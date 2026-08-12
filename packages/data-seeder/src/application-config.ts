/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import fetch from 'node-fetch'
import { z } from 'zod'
import { fromZodError } from 'zod-validation-error'
import { joinUrl } from '@opencrvs/commons'
import { env } from './environment'
import { raise } from './utils'
import { formatUnwrittenFailure } from './seed-failure'
import { SeedData } from './validate-seed-data'

/**
 * The one thing the seed job reads of the country config's application
 * configuration.
 *
 * Narrow on purpose. `ApplicationConfig` in `@opencrvs/commons` describes the
 * whole document, and a seed job that stopped over a field it never looks at
 * would be refusing to seed for a reason that has nothing to do with the
 * seed-data. The canonical schema types the pattern as a string *or* a
 * `RegExp`; only the string form survives JSON, so a string is the only form
 * that can arrive over the wire.
 */
const ApplicationConfigSchema = z.object({
  PHONE_NUMBER_PATTERN: z.string()
})

/**
 * The part of a set of seed-data this module contributes — the third source
 * the entry point merges, alongside the users and the hierarchy.
 */
type ApplicationSeedData = Pick<SeedData, 'PHONE_NUMBER_PATTERN'>

/**
 * The pattern the country config requires mobile numbers to match, fetched but
 * neither compiled nor judged here. Both belong to the validator, which
 * reports a pattern that will not compile as a problem of its own rather than
 * quietly dropping the check — see `./validate-seed-data.ts`.
 *
 * The write path checks every mobile number against this same pattern when the
 * record reaches it, which is too late to be of use: a formatting mistake in
 * one row then stops the run with the hierarchy and every earlier initial user
 * already written. Fetching the pattern up front is what lets that check
 * happen while the database is still clean.
 *
 * The endpoint is served without authentication — the same way the events
 * service reads it — so this needs no token, unlike the users and the roles.
 *
 * Nothing here writes, so every failure it reports ends `nothing was seeded`.
 */
export async function getApplicationConfig(): Promise<{
  seedData: ApplicationSeedData
}> {
  const url = joinUrl(env.COUNTRY_CONFIG_HOST, 'config/application')
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' }
  })

  if (!res.ok) {
    raise(
      formatUnwrittenFailure(
        `Expected to get the application config from ${url}`
      )
    )
  }

  const parsed = ApplicationConfigSchema.safeParse(await res.json())

  if (!parsed.success) {
    raise(
      formatUnwrittenFailure(
        fromZodError(parsed.error, {
          prefix: `Error validating the application config returned from ${url}`
        }).message
      )
    )
  }

  return {
    seedData: { PHONE_NUMBER_PATTERN: parsed.data.PHONE_NUMBER_PATTERN }
  }
}

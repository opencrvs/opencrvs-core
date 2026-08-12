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

/** Narrower than `ApplicationConfig` in `@opencrvs/commons` on purpose: the
 * seed job should not refuse to seed over a field it never reads. */
const ApplicationConfigSchema = z.object({
  PHONE_NUMBER_PATTERN: z.string()
})

type ApplicationSeedData = Pick<SeedData, 'PHONE_NUMBER_PATTERN'>

/** The pattern mobile numbers must match, fetched but neither compiled nor
 * judged here — the validator does both. The endpoint is served without
 * authentication, so this needs no token, unlike the users and the roles. */
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

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
import { env } from './environment'
import fetch from 'node-fetch'
import { readApplicationConfig } from './application-config'
import {
  LocationPayload,
  toLocationPayload,
  readLocations,
  seedLocations
} from './locations'
import { readRoles } from './roles'
import { UserPayload, readUsers, seedUsers, toUserPayloads } from './users'
import { raise } from './utils'
import { createInitialisationClient } from './initialisation-client'
import {
  AFTER_WRITING_BEGAN,
  PartialSeedError,
  describeError,
  formatSeedFailure,
  formatUnwrittenFailure
} from './seed-failure'
import { SeedSources } from './seed-data'
import { validateSeedData } from './validate-seed-data'
import {
  formatValidationReport,
  formatValidationSummary
} from './validation-report'

async function getToken(): Promise<string> {
  const authUrl = new URL(
    '/auth/authenticate-super-user',
    env.GATEWAY_HOST
  ).toString()
  const res = await fetch(authUrl, {
    method: 'POST',
    body: JSON.stringify({
      password: env.SUPER_USER_PASSWORD
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
  if (!res.ok) {
    raise(
      'Could not login as the super user. This might because you have seeded the database already and the account has now been deactivated',
      res.status,
      res.statusText
    )
  }
  const body = await res.json()
  return body.token
}

/** Runs after writing has begun, so it throws rather than calling `raise()`:
 * `write()` below turns anything leaving it into a `PartialSeedError` carrying
 * the clear-the-database remedy. */
async function triggerSystemReady(token: string) {
  // eslint-disable-next-line no-console
  console.log('Triggering system ready')
  const systemReadyUrl = new URL(
    'triggers/system/ready',
    env.COUNTRY_CONFIG_HOST
  ).toString()

  const res = await fetch(systemReadyUrl, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  }).catch((error: unknown) => {
    throw new Error(
      `System ready trigger failed with error: ${describeError(error)}`
    )
  })

  // 501, 404, and 2xx responses are acceptable
  if (
    res.status === 501 ||
    res.status === 404 ||
    (res.status >= 200 && res.status < 300)
  ) {
    // eslint-disable-next-line no-console
    console.log(
      `System ready trigger responded with acceptable status: ${res.status} ${res.statusText}`
    )
    return
  }

  throw new Error(
    `System ready trigger failed with unexpected status: ${res.status} ${res.statusText}`
  )
}

async function deactivateSuperuser(token: string) {
  const client = createInitialisationClient(token)
  await client.complete.mutate()
}

/** Fetch all of the seed-data, validate all of it, and only then write any of
 * it: validation precedes the first write — the hierarchy included — so that
 * rejected seed-data leaves the database untouched.
 */
async function main() {
  const token = await getToken()

  const sources: SeedSources = {
    users: await readUsers(token),
    roles: await readRoles(token),
    locations: await readLocations(),
    applicationConfig: await readApplicationConfig()
  }

  const problems = validateSeedData(sources)

  if (problems.length > 0) {
    raise(formatValidationReport(problems))
  }

  // eslint-disable-next-line no-console
  console.log(formatValidationSummary(sources))

  await write(
    token,
    toLocationPayload(sources.locations),
    toUserPayloads(sources.users)
  )
}

/** Every error leaving here is a `PartialSeedError`, which is
 * what lets the handler below pick between the two failure
 * reports without tracking state.
 */
async function write(
  token: string,
  locations: LocationPayload,
  users: UserPayload[]
) {
  try {
    // eslint-disable-next-line no-console
    console.log('Seeding locations')
    await seedLocations(token, locations)

    // eslint-disable-next-line no-console
    console.log('Seeding users')
    await seedUsers(token, users)

    await triggerSystemReady(token)
    await deactivateSuperuser(token)
  } catch (error) {
    // `seedUsers` knows which record failed, so its report stands.
    throw error instanceof PartialSeedError
      ? error
      : new PartialSeedError(
          formatSeedFailure({
            headline: AFTER_WRITING_BEGAN,
            reason: describeError(error)
          })
        )
  }
}

/** A failure found rather than thrown before the first write never reaches
 * here: the fetch and validation paths call `raise()` themselves. */
main().catch((error: unknown) => {
  raise(
    error instanceof PartialSeedError
      ? error.message
      : formatUnwrittenFailure(describeError(error))
  )
})

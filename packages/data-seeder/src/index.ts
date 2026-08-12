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
import { getApplicationConfig } from './application-config'
import { SeedLocations, getLocations, seedLocations } from './locations'
import { SeedUsers, getUsers, seedUsers } from './users'
import { raise } from './utils'
import { createInitialisationClient } from './initialisation-client'
import {
  PartialSeedError,
  describeError,
  formatPartialSeedFailure,
  formatUnwrittenFailure
} from './seed-failure'
import {
  formatValidationReport,
  formatValidationSummary,
  validateSeedData
} from './validate-seed-data'

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

/**
 * The country config's post-seed hook, run once the locations and the users are
 * in the database.
 *
 * It therefore fails *after* writing has begun, and says so by throwing rather
 * than exiting: it is called from `write()` below, whose catch turns anything
 * leaving it into a `PartialSeedError` carrying the clear-the-database remedy.
 * Calling `raise()` from here instead would exit the process on the spot, and
 * the operator would be left with a half-seeded database and a bare line of
 * text telling them nothing about it.
 */
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

/**
 * Fetch all of the seed-data, validate all of it, and only then write any of
 * it.
 *
 * The three phases are kept apart on purpose. Every fetch happens before
 * validation so that the validator sees the whole set at once, and validation
 * completes before the first write — before the administrative hierarchy, not
 * merely before the users — so that rejected seed-data leaves the database
 * untouched and the operator has nothing to clean up. `raise()` below is the
 * gate: it writes the report to standard error and exits 1, so no `seed*` call
 * is reachable while any problem stands.
 */
async function main() {
  const token = await getToken()

  const locations = await getLocations()
  const users = await getUsers(token)
  const applicationConfig = await getApplicationConfig()
  const seedData = {
    ...users.seedData,
    ...locations.seedData,
    ...applicationConfig.seedData
  }

  const problems = validateSeedData(seedData)

  if (problems.length > 0) {
    raise(formatValidationReport(problems, seedData))
  }

  // eslint-disable-next-line no-console
  console.log(formatValidationSummary(seedData))

  await write(token, locations, users.users)
}

/**
 * Everything that writes, and nothing that does not.
 *
 * The boundary is what lets the handler below choose between the two failure
 * reports without tracking any state: every error leaving this function is a
 * `PartialSeedError`, so an error that reaches the handler without that type
 * can only have been thrown before the first write, when the operator's
 * database was still clean. Keep it that way — a write moved above the call to
 * this function would be reported as though it had never happened, and would
 * send the operator to seed again over data that is already there.
 */
async function write(
  token: string,
  locations: SeedLocations,
  users: SeedUsers
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
    // `seedUsers` already knows which record failed and how many were created
    // before it, so its report stands; anything else can only say that writing
    // had begun.
    throw error instanceof PartialSeedError
      ? error
      : new PartialSeedError(formatPartialSeedFailure(describeError(error)))
  }
}

/**
 * The seed job's only exit.
 *
 * `main()` used to be called bare, so every failure after writing began
 * surfaced as an unhandled promise rejection: a stack trace naming no record,
 * saying nothing about how much had succeeded, and — on older runtimes —
 * exiting zero. Every failure now leaves through here as a report, and through
 * `raise()`, which exits 1.
 *
 * A failure before the first write does not reach this handler at all when it
 * was found rather than thrown: the fetch and validation paths call `raise()`
 * themselves and exit there. Both routes render the same closing phrase, and
 * neither mentions clearing the database.
 */
main().catch((error: unknown) => {
  raise(
    error instanceof PartialSeedError
      ? error.report
      : formatUnwrittenFailure(describeError(error))
  )
})

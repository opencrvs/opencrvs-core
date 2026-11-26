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
import { describe, expect, it } from 'vitest'
import {
  AFTER_WRITING_BEGAN,
  CREATING_INITIAL_USERS,
  SeedFailure,
  describeInitialUserFailure,
  formatSeedFailure,
  formatUnwrittenFailure
} from './seed-failure'
import { NOTHING_WAS_SEEDED, REMEDY } from './seed-report'
import { formatValidationReport } from './validation-report'

function failure(overrides: Partial<SeedFailure> = {}): SeedFailure {
  return {
    headline: CREATING_INITIAL_USERS,
    subject: {
      about: 'initialUser',
      user: { position: 44, username: 'k.mweene' }
    },
    reason: 'DUPLICATE_EMAIL — email "k.mweene@example.org" is already in use',
    ...overrides
  }
}

const fetchFailure = formatUnwrittenFailure(
  'Expected to get the users from http://localhost:3040/config/users'
)

const failedInitialUser = formatSeedFailure(failure())

/**
 * The post-seed trigger runs after the locations and the users are written, so
 * its failures travel `write()`'s catch and are rendered like any other
 * post-write failure — rather than exiting on the spot, as they once did.
 */
const failedTrigger = formatSeedFailure({
  headline: AFTER_WRITING_BEGAN,
  reason:
    'System ready trigger failed with unexpected status: 500 Internal Server Error'
})

const droppedConnection = formatSeedFailure({
  headline: AFTER_WRITING_BEGAN,
  reason: 'connect ECONNREFUSED 127.0.0.1:7070'
})

describe('the closing sentence, by phase', () => {
  it.each([
    ['a seed-data fetch failure', fetchFailure],
    ['a validation report', formatValidationReport([])]
  ])('%s says nothing was seeded, and names no remedy', (_, report) => {
    expect(report).toContain(NOTHING_WAS_SEEDED)
    expect(report).not.toContain(REMEDY)
  })

  it.each([
    ['a failed initial user', failedInitialUser],
    ['a failed post-seed trigger', failedTrigger],
    ['a dropped connection', droppedConnection]
  ])('%s names the remedy, and claims no clean database', (_, report) => {
    expect(report).toContain(REMEDY)
    expect(report).not.toContain(NOTHING_WAS_SEEDED)
  })
})

describe('what an operator reads', () => {
  it('when an initial user could not be created', () => {
    expect(failedInitialUser).toMatchInlineSnapshot(`
      "Seeding failed while creating initial users.

        initial user 44 (k.mweene): DUPLICATE_EMAIL — email "k.mweene@example.org" is already in use

      The database now holds incomplete seed-data. Clear the database before you seed again."
    `)
  })

  it('when the failure is about nothing that can be named', () => {
    expect(droppedConnection).toMatchInlineSnapshot(`
      "Seeding failed after writing had begun.

        connect ECONNREFUSED 127.0.0.1:7070

      The database now holds incomplete seed-data. Clear the database before you seed again."
    `)
  })

  it('when nothing had been written yet', () => {
    expect(fetchFailure).toMatchInlineSnapshot(`
      "Expected to get the users from http://localhost:3040/config/users
      No write was attempted; nothing was seeded."
    `)
  })
})

describe('describing why one initial user could not be created', () => {
  const user = { email: 'k.mweene@example.org', mobile: '+260911111111' }

  it('expands a bare duplicate-email code with the offending address', () => {
    expect(describeInitialUserFailure(new Error('DUPLICATE_EMAIL'), user)).toBe(
      'DUPLICATE_EMAIL — email "k.mweene@example.org" is already in use'
    )
  })

  it('omits the value when the record does not carry that field', () => {
    expect(
      describeInitialUserFailure(new Error('DUPLICATE_MOBILE'), {
        email: 'k.mweene@example.org'
      })
    ).toBe('DUPLICATE_MOBILE — mobile is already in use')
  })

  it('passes any other error through as it was written', () => {
    expect(
      describeInitialUserFailure(
        new Error('A user with the same email already exists'),
        user
      )
    ).toBe('A user with the same email already exists')
  })

  it('renders a thrown value that is not an error at all', () => {
    expect(describeInitialUserFailure('something went wrong', user)).toBe(
      'something went wrong'
    )
  })
})

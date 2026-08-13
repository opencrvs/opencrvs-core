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

/**
 * These tests assert what an operator reads when the seed job fails: which
 * record is named, and — the part worth guarding — which of the two closing
 * sentences they get. Confusing the two sends an operator either to destroy a
 * clean database or to re-run against a dirty one.
 *
 * The seed loop itself is not tested here, by an explicit decision recorded in
 * the plan: there are no mocked-transport tests of the job's orchestration.
 * These are plain unit tests of the rendering, like the validator's.
 */
import { describe, expect, it } from 'vitest'
import {
  AFTER_WRITING_BEGAN,
  CREATING_INITIAL_USERS,
  PartialSeedError,
  SeedFailure,
  describeInitialUserFailure,
  formatSeedFailure,
  formatUnwrittenFailure
} from './seed-failure'
import { formatValidationReport } from './validate-seed-data'

function failure(overrides: Partial<SeedFailure> = {}): SeedFailure {
  return {
    headline: CREATING_INITIAL_USERS,
    subject: {
      about: 'record',
      record: { position: 44, username: 'k.mweene' }
    },
    reason: 'DUPLICATE_EMAIL — email "k.mweene@example.org" is already in use',
    ...overrides
  }
}

describe('a failure while creating initial users', () => {
  it('reads as the operator-facing report', () => {
    expect(formatSeedFailure(failure()).split('\n')).toEqual([
      'Seeding failed while creating initial users.',
      '',
      '  record 44 (k.mweene): DUPLICATE_EMAIL — email "k.mweene@example.org" is already in use',
      '',
      'The database now holds incomplete seed-data. Clear the database before you seed again.'
    ])
  })
})

describe('the two failure reports', () => {
  const written = formatSeedFailure(failure())

  it('are distinguishable from the validation report, which says the same thing as the unwritten one', () => {
    const validation = formatValidationReport([], {
      users: [],
      roles: [],
      administrativeAreas: [],
      locations: [],
      PHONE_NUMBER_PATTERN: '^0[0-9]{10}$'
    })

    expect(validation).toContain('nothing was seeded')
    expect(validation).not.toContain('Clear the database')
    expect(written).not.toContain('nothing was seeded')
  })
})

describe('a failure before anything was written', () => {
  const report = formatUnwrittenFailure(
    'Expected to get the users from http://localhost:3040/config/users'
  )

  it('ends with the phrase that says the database is untouched', () => {
    expect(report.split('\n')).toEqual([
      'Expected to get the users from http://localhost:3040/config/users',
      'No write was attempted; nothing was seeded.'
    ])
  })
})

describe('a failure of the post-seed system-ready trigger', () => {
  /**
   * The trigger runs after the locations and the users are written, so its
   * failures travel `write()`'s catch and are rendered like any other
   * post-write failure — rather than exiting on the spot, as they once did.
   */
  const report = formatSeedFailure({
    headline: AFTER_WRITING_BEGAN,
    reason:
      'System ready trigger failed with unexpected status: 500 Internal Server Error'
  })

  it('tells the operator the database holds incomplete seed-data', () => {
    expect(report.split('\n')).toEqual([
      'Seeding failed after writing had begun.',
      '',
      '  System ready trigger failed with unexpected status: 500 Internal Server Error',
      '',
      'The database now holds incomplete seed-data. Clear the database before you seed again.'
    ])
  })

  it('carries its report out of the writing phase by type', () => {
    expect(new PartialSeedError(report).report).toBe(report)
  })
})

describe('any other failure after writing had begun', () => {
  const report = formatSeedFailure({
    headline: AFTER_WRITING_BEGAN,
    reason: 'connect ECONNREFUSED 127.0.0.1:7070'
  })

  it('names no subject, having none to name', () => {
    expect(report).toContain('  connect ECONNREFUSED 127.0.0.1:7070')
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

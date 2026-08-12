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
 * record is named, how much of the seed-data the report says was written, and
 * — the part worth guarding — which of the two closing sentences they get.
 * Confusing the two sends an operator either to destroy a clean database or to
 * re-run against a dirty one.
 *
 * The seed loop itself is not tested here, by an explicit decision recorded in
 * the plan: there are no mocked-transport tests of the job's orchestration.
 * These are plain unit tests of the rendering, like the validator's.
 */
import { describe, expect, it } from 'vitest'
import {
  InitialUserFailure,
  PartialSeedError,
  describeError,
  describeInitialUserFailure,
  formatInitialUserFailure,
  formatPartialSeedFailure,
  formatUnwrittenFailure
} from './seed-failure'
import { formatValidationReport } from './validate-seed-data'

function failure(overrides: Partial<InitialUserFailure> = {}) {
  return {
    record: { position: 44, username: 'k.mweene' },
    reason: 'DUPLICATE_EMAIL — email "k.mweene@example.org" is already in use',
    created: 32,
    total: 55,
    ...overrides
  }
}

/** Anything that would read as an instruction to run one environment's tooling. */
const COMMANDS =
  /pnpm|npm |npx|yarn|docker|docker-compose|compose|kubectl|helm|psql|db:clear|seed:|\$ /i

describe('a failure while creating initial users', () => {
  it('reads as the operator-facing report', () => {
    expect(formatInitialUserFailure(failure()).split('\n')).toEqual([
      'Seeding failed while creating initial users.',
      '',
      '  record 44 (k.mweene): DUPLICATE_EMAIL — email "k.mweene@example.org" is already in use',
      '  32 of 55 initial users were created before this failure',
      '',
      'The database now holds incomplete seed-data. Clear the database before you seed again.'
    ])
  })

  it('names the record that failed, by position and username', () => {
    expect(
      formatInitialUserFailure(
        failure({ record: { position: 7, username: 'f.katongo' } })
      )
    ).toContain('record 7 (f.katongo):')
  })

  it('identifies the record by position rather than by a line number', () => {
    expect(formatInitialUserFailure(failure())).not.toMatch(/line/i)
  })

  it('reports how many initial users were created before the failure', () => {
    expect(formatInitialUserFailure(failure())).toContain(
      '32 of 55 initial users were created before this failure'
    )
  })

  it('reports a failure on the very first record as none created', () => {
    expect(
      formatInitialUserFailure(
        failure({ record: { position: 1, username: 'k.mweene' }, created: 0 })
      )
    ).toContain('0 of 55 initial users were created before this failure')
  })

  it('counts a lone initial user in the singular', () => {
    expect(
      formatInitialUserFailure(failure({ created: 0, total: 1 }))
    ).toContain('0 of 1 initial user was created before this failure')
  })

  it('states that the database must be cleared before seeding again', () => {
    expect(formatInitialUserFailure(failure())).toContain(
      'The database now holds incomplete seed-data. ' +
        'Clear the database before you seed again.'
    )
  })

  it('names no command, since the same job runs in three environments', () => {
    expect(formatInitialUserFailure(failure())).not.toMatch(COMMANDS)
  })

  it('does not claim that nothing was seeded, because something was', () => {
    expect(formatInitialUserFailure(failure())).not.toContain(
      'nothing was seeded'
    )
  })
})

describe('the two failure reports', () => {
  const written = formatInitialUserFailure(failure())
  const unwritten = formatUnwrittenFailure('Expected to get the users')

  it('are distinguishable by their closing sentence', () => {
    expect(written.endsWith('Clear the database before you seed again.')).toBe(
      true
    )
    expect(unwritten.endsWith('nothing was seeded.')).toBe(true)
  })

  it('are distinguishable from the validation report, which says the same thing as the unwritten one', () => {
    const validation = formatValidationReport([], {
      users: [],
      roles: [],
      administrativeAreas: [],
      locations: []
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
      'Seeding failed before anything was written.',
      '',
      '  Expected to get the users from http://localhost:3040/config/users',
      '',
      'No write was attempted; nothing was seeded.'
    ])
  })

  it('does not tell the operator to clear a database it never wrote to', () => {
    expect(report).not.toContain('Clear the database')
    expect(report).not.toContain('incomplete seed-data')
  })
})

describe('a failure to fetch seed-data', () => {
  /**
   * Users and locations are both seed-data, and both are fetched before the
   * first write, so a failure to fetch either one closes the same way. The
   * locations path used to print bare text and say neither thing.
   */
  const reasons = [
    'Expected to get the users from http://localhost:3040/config/users',
    'Expected to get the locations from http://localhost:3040/config/locations',
    'Error validating locations data returned from http://localhost:3040/config/locations: ' +
      'Required at "locations[0].name"'
  ]

  it.each(reasons)('ends with `nothing was seeded`: %s', (reason) => {
    expect(formatUnwrittenFailure(reason).endsWith('nothing was seeded.')).toBe(
      true
    )
  })

  it.each(reasons)(
    'names no remedy, since there is nothing to clear: %s',
    (reason) => {
      expect(formatUnwrittenFailure(reason)).not.toContain('Clear the database')
    }
  )

  it('renders the reason as text on its own indented line', () => {
    // A parse failure arrives as a `zod-validation-error`, whose *message* is
    // the operator-readable part; the object itself renders as a blob. The
    // string parameter is what forces the caller to take `.message`.
    expect(
      formatUnwrittenFailure(
        'Error validating locations data returned from http://localhost:3040/config/locations: ' +
          'Required at "locations[0].name"'
      ).split('\n')
    ).toEqual([
      'Seeding failed before anything was written.',
      '',
      '  Error validating locations data returned from http://localhost:3040/config/locations: ' +
        'Required at "locations[0].name"',
      '',
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
  const report = formatPartialSeedFailure(
    'System ready trigger failed with unexpected status: 500 Internal Server Error'
  )

  it('tells the operator the database holds incomplete seed-data', () => {
    expect(report.split('\n')).toEqual([
      'Seeding failed after writing had begun.',
      '',
      '  System ready trigger failed with unexpected status: 500 Internal Server Error',
      '',
      'The database now holds incomplete seed-data. Clear the database before you seed again.'
    ])
  })

  it('does not claim that nothing was seeded, because the writes had happened', () => {
    expect(report).not.toContain('nothing was seeded')
  })

  it('carries its report out of the writing phase by type', () => {
    expect(new PartialSeedError(report)).toBeInstanceOf(PartialSeedError)
    expect(new PartialSeedError(report).report).toBe(report)
  })
})

describe('any other failure after writing had begun', () => {
  const report = formatPartialSeedFailure('connect ECONNREFUSED 127.0.0.1:7070')

  it('carries the same remedy, since the database is in the same state', () => {
    expect(report.split('\n')).toEqual([
      'Seeding failed after writing had begun.',
      '',
      '  connect ECONNREFUSED 127.0.0.1:7070',
      '',
      'The database now holds incomplete seed-data. Clear the database before you seed again.'
    ])
  })

  it('names no command', () => {
    expect(report).not.toMatch(COMMANDS)
  })
})

describe('describing why one initial user could not be created', () => {
  const user = { email: 'k.mweene@example.org', mobile: '+260911111111' }

  it('expands a bare duplicate-email code with the offending address', () => {
    expect(describeInitialUserFailure(new Error('DUPLICATE_EMAIL'), user)).toBe(
      'DUPLICATE_EMAIL — email "k.mweene@example.org" is already in use'
    )
  })

  it('expands a bare duplicate-mobile code with the offending number', () => {
    expect(
      describeInitialUserFailure(new Error('DUPLICATE_MOBILE'), user)
    ).toBe('DUPLICATE_MOBILE — mobile "+260911111111" is already in use')
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
})

describe('describing an unknown thrown value', () => {
  it('reads an error by its message', () => {
    expect(describeError(new Error('Internal server error'))).toBe(
      'Internal server error'
    )
  })

  it('falls back to the name of an error thrown without a message', () => {
    expect(describeError(new TypeError())).toBe('TypeError')
  })

  it('renders a value that is not an error at all', () => {
    expect(describeError('something went wrong')).toBe('something went wrong')
    expect(describeError(undefined)).toBe('undefined')
  })
})

describe('a failure carried out of the writing phase', () => {
  it('carries the report the entry point prints', () => {
    const report = formatInitialUserFailure(failure())

    expect(new PartialSeedError(report).report).toBe(report)
  })

  it('is recognisable by type, which is how the entry point knows a write had begun', () => {
    expect(new PartialSeedError('a report')).toBeInstanceOf(PartialSeedError)
    expect(new Error('a report')).not.toBeInstanceOf(PartialSeedError)
  })
})

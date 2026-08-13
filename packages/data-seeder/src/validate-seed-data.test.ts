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
 * These tests assert what an operator sees: which problems a given set of
 * seed-data produces, and how the report reads. They deliberately say nothing
 * about how the validator is organised internally or the order it runs its
 * checks in — the report's line order is a promise to the operator, the
 * checks' execution order is not.
 */
import { describe, expect, it } from 'vitest'
import { encodeScope } from '@opencrvs/commons'
import {
  SeedData,
  SeedDataLocation,
  SeedDataRole,
  SeedDataUser,
  formatValidationReport,
  formatValidationSummary,
  validateSeedData
} from './validate-seed-data'

function user(overrides: Partial<SeedDataUser> = {}): SeedDataUser {
  return {
    username: 'a.user',
    email: undefined,
    mobile: undefined,
    ...overrides
  }
}

/** A role the country config declares, carrying no scopes unless asked for. */
function role(overrides: Partial<SeedDataRole> = {}): SeedDataRole {
  return {
    id: 'LOCAL_REGISTRAR',
    scopes: [],
    ...overrides
  }
}

/**
 * The scope without which nobody could configure the seeded system, encoded
 * the way a country config's roles carry it.
 */
const CONFIGURE = [encodeScope({ type: 'config.update-all' })]

/** A node of the hierarchy: an administrative area or a location. */
function place(overrides: Partial<SeedDataLocation> = {}): SeedDataLocation {
  return {
    id: 'a-place',
    name: 'A Place',
    partOf: 'Location/0',
    ...overrides
  }
}

/** A whole set of seed-data, with only the part a test exercises filled in. */
function seedData(overrides: Partial<SeedData> = {}): SeedData {
  return {
    users: [],
    roles: [],
    administrativeAreas: [],
    locations: [],
    PHONE_NUMBER_PATTERN: '.*',
    ...overrides
  }
}

/** The report an operator would see, as a list of its lines. */
function report(overrides: Partial<SeedData> = {}) {
  const data = seedData(overrides)
  return formatValidationReport(validateSeedData(data), data).split('\n')
}

describe('duplicate emails within the seed-data', () => {
  it('reports the second of two initial users sharing an email', () => {
    expect(
      report({
        users: [
          user({ username: 'k.mweene', email: 'k.mweene@x.com' }),
          user({ username: 'f.katongo', email: 'f.katongo@x.com' }),
          user({ username: 'e.mweene', email: 'k.mweene@x.com' })
        ]
      })
    ).toEqual([
      '1 problem found in 3 initial users; nothing was seeded.',
      '  initial user 3 (e.mweene): email "k.mweene@x.com" duplicates initial user 1 — emails must be unique'
    ])
  })

  it('reports two spellings of one address, since emails are lowercased on write', () => {
    expect(
      report({
        users: [
          user({ username: 'one', email: 'K.Mweene@X.com' }),
          user({ username: 'two', email: 'k.mweene@x.com' })
        ]
      })
    ).toEqual([
      '1 problem found in 2 initial users; nothing was seeded.',
      '  initial user 2 (two): email "k.mweene@x.com" duplicates initial user 1 — emails must be unique'
    ])
  })
})

describe('duplicate mobile numbers within the seed-data', () => {
  it('reports the second of two initial users sharing a mobile number', () => {
    expect(
      report({
        users: [
          user({ username: 'k.mweene', mobile: '+260911111111' }),
          user({ username: 'f.katongo', mobile: '+260911111111' })
        ]
      })
    ).toEqual([
      '1 problem found in 2 initial users; nothing was seeded.',
      '  initial user 2 (f.katongo): mobile "+260911111111" duplicates initial user 1 — mobile numbers must be unique'
    ])
  })
})

describe('duplicate usernames within the seed-data', () => {
  it('reports a shared username as a problem rather than letting it be renumbered', () => {
    expect(
      report({
        users: [
          user({ username: 'k.mweene', email: 'one@x.com' }),
          user({ username: 'k.mweene', email: 'two@x.com' })
        ]
      })
    ).toEqual([
      '1 problem found in 2 initial users; nothing was seeded.',
      '  initial user 2 (k.mweene): username "k.mweene" duplicates initial user 1 — usernames must be unique'
    ])
  })
})

describe("an initial user's primary office", () => {
  const administrativeAreas = [place({ id: 'ibombo', name: 'Ibombo' })]
  const locations = [
    place({
      id: 'HPGiE9Jjh2r',
      name: 'Ibombo District Office',
      partOf: 'Location/ibombo'
    })
  ]

  it('is reported by initial user, naming the office, when the seed-data does not declare it', () => {
    expect(
      report({
        users: [
          user({ username: 'k.mweene', primaryOfficeId: 'ibombo_HPGiE9Jjh2r' }),
          user({ username: 'f.katongo', primaryOfficeId: 'atlantis_ATL1' })
        ],
        administrativeAreas,
        locations
      })
    ).toEqual([
      '1 problem found in 2 initial users; nothing was seeded.',
      '  initial user 2 (f.katongo): primaryOfficeId "atlantis_ATL1" resolves to office "ATL1", which the seed-data does not declare — an initial user\'s primary office must be a location the seed-data declares'
    ])
  })

  it('may not be an administrative area, since only locations are offices', () => {
    expect(
      validateSeedData(
        seedData({
          users: [user({ primaryOfficeId: 'ibombo' })],
          administrativeAreas,
          locations
        })
      )
    ).toHaveLength(1)
  })
})

describe('the administrative hierarchy', () => {
  it('reports a location that is not part of a declared administrative area', () => {
    expect(
      report({
        users: [user()],
        administrativeAreas: [place({ id: 'ibombo', name: 'Ibombo' })],
        locations: [
          place({
            id: 'HPGiE9Jjh2r',
            name: 'Ibombo District Office',
            partOf: 'Location/atlantis'
          })
        ]
      })
    ).toEqual([
      '1 problem found in 1 initial user; nothing was seeded.',
      '  location "Ibombo District Office" (id HPGiE9Jjh2r): partOf "Location/atlantis" names no declared administrative area — partOf must name an administrative area the seed-data declares, or the root "0"'
    ])
  })

  it('reports a location that is part of another location rather than of an area', () => {
    expect(
      validateSeedData(
        seedData({
          administrativeAreas: [place({ id: 'ibombo', name: 'Ibombo' })],
          locations: [
            place({ id: 'office', name: 'Office', partOf: 'Location/ibombo' }),
            place({ id: 'annex', name: 'Annex', partOf: 'Location/office' })
          ]
        })
      )
    ).toHaveLength(1)
  })
})

describe('an initial user entry that did not parse', () => {
  it('is named by its position alone when it carries no usable username', () => {
    expect(
      report({
        users: [
          user({
            username: undefined,
            malformed: 'Invalid input: expected string, received number'
          })
        ]
      })
    ).toEqual([
      '1 problem found in 1 initial user; nothing was seeded.',
      '  initial user 1: does not parse — Invalid input: expected string, received number'
    ])
  })
})

describe('a seed-data document that did not parse at all', () => {
  it('reports the initial users the country config served', () => {
    expect(
      report({
        malformedUserList: 'Invalid input: expected array, received object'
      })
    ).toEqual([
      '1 problem found in 0 initial users; nothing was seeded.',
      "  the country config's initial users: do not parse — Invalid input: expected array, received object"
    ])
  })
})

describe('a role that did not parse', () => {
  it('is reported by its id, as the text of the schema message', () => {
    expect(
      report({
        roles: [
          role({
            id: 'LOCAL_REGISTRAR',
            malformed: 'Invalid scope: "recorddeclare" at "scopes[0]"'
          })
        ]
      })
    ).toEqual([
      '1 problem found in 0 initial users; nothing was seeded.',
      '  role "LOCAL_REGISTRAR": does not parse — Invalid scope: "recorddeclare" at "scopes[0]"'
    ])
  })
})

describe('duplicate role ids', () => {
  it('reports the id the country config declares more than once', () => {
    expect(
      report({
        roles: [
          role({ id: 'LOCAL_REGISTRAR' }),
          role({ id: 'NATIONAL_SYSTEM_ADMIN' }),
          role({ id: 'LOCAL_REGISTRAR' })
        ]
      })
    ).toEqual([
      '1 problem found in 0 initial users; nothing was seeded.',
      '  the country config\'s roles: id "LOCAL_REGISTRAR" is declared more than once — role ids must be unique'
    ])
  })
})

describe("an initial user's role", () => {
  const roles = [
    role({ id: 'LOCAL_REGISTRAR' }),
    role({ id: 'NATIONAL_SYSTEM_ADMIN', scopes: CONFIGURE })
  ]

  it('is no problem when the country config declares it', () => {
    expect(
      validateSeedData(
        seedData({
          users: [user({ role: 'NATIONAL_SYSTEM_ADMIN' })],
          roles
        })
      )
    ).toEqual([])
  })

  it('is reported by initial user, naming the role, when no declared role matches', () => {
    expect(
      report({
        users: [
          user({ username: 'k.mweene', role: 'NATIONAL_SYSTEM_ADMIN' }),
          user({ username: 'f.katongo', role: 'LOCAL_REGISTRARR' })
        ],
        roles
      })
    ).toEqual([
      '1 problem found in 2 initial users; nothing was seeded.',
      '  initial user 2 (f.katongo): role "LOCAL_REGISTRARR" names no role the country config declares — an initial user\'s role must be one of the roles the country config declares'
    ])
  })

  it('is not reported when the role list itself did not parse', () => {
    // Every user would otherwise be reported, and none of it would be news:
    // the roles are unreadable, which the report already says.
    expect(
      report({
        users: [user({ username: 'k.mweene', role: 'LOCAL_REGISTRAR' })],
        malformedRoleList: 'Invalid input: expected array, received object'
      })
    ).toEqual([
      '1 problem found in 1 initial user; nothing was seeded.',
      "  the country config's roles: do not parse — Invalid input: expected array, received object"
    ])
  })
})

describe('the ability to configure the seeded system', () => {
  it('is reported when no initial user carries a role that has the scope', () => {
    expect(
      report({
        users: [user({ username: 'k.mweene', role: 'LOCAL_REGISTRAR' })],
        roles: [
          role({ id: 'LOCAL_REGISTRAR' }),
          role({ id: 'NATIONAL_SYSTEM_ADMIN', scopes: CONFIGURE })
        ]
      })
    ).toEqual([
      '1 problem found in 1 initial user; nothing was seeded.',
      '  the initial users: include nobody who could configure the system — at least one initial user must carry a role with the "config.update-all" scope'
    ])
  })

  it('stands down when no initial user names a role to check', () => {
    expect(
      validateSeedData(seedData({ users: [user({ username: 'k.mweene' })] }))
    ).toEqual([])
  })
})

describe("an initial user's mobile number", () => {
  /** A pattern of the shape a country config configures: a local number of ten
   * digits beginning `07` or `09`. */
  const PHONE_NUMBER_PATTERN = '^0(7|9)[0-9]{8}$'

  it('is reported by initial user, naming the number and the pattern, when it does not match', () => {
    expect(
      report({
        users: [
          user({ username: 'k.mweene', mobile: '0733333333' }),
          user({ username: 'f.katongo', mobile: '+260733333333' })
        ],
        PHONE_NUMBER_PATTERN
      })
    ).toEqual([
      '1 problem found in 2 initial users; nothing was seeded.',
      '  initial user 2 (f.katongo): mobile "+260733333333" does not match the configured pattern ^0(7|9)[0-9]{8}$ — an initial user\'s mobile number must match the country config\'s PHONE_NUMBER_PATTERN'
    ])
  })
})

describe('a configured phone number pattern that is not a regular expression', () => {
  const PHONE_NUMBER_PATTERN = '^0(7|9)[0-9{8}$'

  it('is reported as a problem of the country config rather than of any initial user', () => {
    expect(
      report({
        users: [user({ username: 'k.mweene', mobile: '0733333333' })],
        PHONE_NUMBER_PATTERN
      })
    ).toEqual([
      '1 problem found in 1 initial user; nothing was seeded.',
      '  the country config\'s application configuration: PHONE_NUMBER_PATTERN "^0(7|9)[0-9{8}$" is not a valid regular expression — a configured phone number pattern must be a valid regular expression'
    ])
  })

  it('does not also report every mobile number as malformed against it', () => {
    // Every number fails a pattern that cannot be read, and fifty-five
    // invented problems would bury the one real one.
    expect(
      report({
        users: [
          user({ username: 'one', mobile: '0733333333' }),
          user({ username: 'two', mobile: 'nonsense' }),
          user({ username: 'three', mobile: '+260733333333' })
        ],
        PHONE_NUMBER_PATTERN
      })
    ).toEqual([
      '1 problem found in 3 initial users; nothing was seeded.',
      '  the country config\'s application configuration: PHONE_NUMBER_PATTERN "^0(7|9)[0-9{8}$" is not a valid regular expression — a configured phone number pattern must be a valid regular expression'
    ])
  })
})

describe('a set of seed-data with several problems', () => {
  const users = [
    user({ username: 'k.mweene', email: 'k.mweene@x.com', mobile: '+2601' }),
    user({ username: 'f.katongo', email: 'f.katongo@x.com', mobile: '+2601' }),
    user({ username: 'e.mweene', email: 'k.mweene@x.com', mobile: '+2603' }),
    user({ username: 'f.katongo', email: 'k.mweene@x.com', mobile: '+2601' })
  ]

  it('reports every problem in one run rather than stopping at the first', () => {
    expect(report({ users })).toEqual([
      '5 problems found in 4 initial users; nothing was seeded.',
      '  initial user 2 (f.katongo): mobile "+2601" duplicates initial user 1 — mobile numbers must be unique',
      '  initial user 3 (e.mweene): email "k.mweene@x.com" duplicates initial user 1 — emails must be unique',
      '  initial user 4 (f.katongo): email "k.mweene@x.com" duplicates initial user 1 — emails must be unique',
      '  initial user 4 (f.katongo): mobile "+2601" duplicates initial user 1 — mobile numbers must be unique',
      '  initial user 4 (f.katongo): username "f.katongo" duplicates initial user 2 — usernames must be unique'
    ])
  })
})

describe('valid seed-data', () => {
  const users = [
    user({
      username: 'k.mweene',
      email: 'k.mweene@x.com',
      mobile: '+260911111111',
      primaryOfficeId: 'ibombo_HPGiE9Jjh2r'
    }),
    user({
      username: 'f.katongo',
      email: 'f.katongo@x.com',
      mobile: '+260922222222',
      primaryOfficeId: 'ibombo_HPGiE9Jjh2r'
    })
  ]
  const administrativeAreas = [
    place({ id: 'central', name: 'Central' }),
    place({ id: 'ibombo', name: 'Ibombo', partOf: 'Location/central' }),
    place({ id: 'isamba', name: 'Isamba', partOf: 'Location/central' })
  ]
  const locations = [
    place({
      id: 'HPGiE9Jjh2r',
      name: 'Ibombo District Office',
      partOf: 'Location/ibombo'
    })
  ]
  const valid = seedData({ users, administrativeAreas, locations })

  it('produces no problems', () => {
    expect(validateSeedData(valid)).toEqual([])
  })

  it('is summarised in one line stating what was validated', () => {
    expect(formatValidationSummary(valid)).toBe(
      'Seed-data validated: 2 initial users, 3 administrative areas, 1 location. ' +
        'No problems found.'
    )
  })
})

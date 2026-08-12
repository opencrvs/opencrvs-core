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
      '1 problem found in 3 user records; nothing was seeded.',
      '  record 3 (e.mweene): email "k.mweene@x.com" duplicates record 1 — emails must be unique'
    ])
  })

  it('points every later duplicate at the first record holding the value', () => {
    expect(
      report({
        users: [
          user({ username: 'one', email: 'shared@x.com' }),
          user({ username: 'two', email: 'shared@x.com' }),
          user({ username: 'three', email: 'shared@x.com' })
        ]
      })
    ).toEqual([
      '2 problems found in 3 user records; nothing was seeded.',
      '  record 2 (two): email "shared@x.com" duplicates record 1 — emails must be unique',
      '  record 3 (three): email "shared@x.com" duplicates record 1 — emails must be unique'
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
      '1 problem found in 2 user records; nothing was seeded.',
      '  record 2 (two): email "k.mweene@x.com" duplicates record 1 — emails must be unique'
    ])
  })

  it('does not treat two users without an email as duplicates of each other', () => {
    expect(
      validateSeedData(
        seedData({
          users: [
            user({ username: 'one', mobile: '+260911111111' }),
            user({ username: 'two', mobile: '+260922222222' })
          ]
        })
      )
    ).toEqual([])
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
      '1 problem found in 2 user records; nothing was seeded.',
      '  record 2 (f.katongo): mobile "+260911111111" duplicates record 1 — mobile numbers must be unique'
    ])
  })

  it('compares mobile numbers verbatim, because they are stored verbatim', () => {
    expect(
      validateSeedData(
        seedData({
          users: [
            user({ username: 'one', mobile: '+447911123456' }),
            user({ username: 'two', mobile: '07911123456' })
          ]
        })
      )
    ).toEqual([])
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
      '1 problem found in 2 user records; nothing was seeded.',
      '  record 2 (k.mweene): username "k.mweene" duplicates record 1 — usernames must be unique'
    ])
  })

  it('does not report a username that is merely a prefix of another', () => {
    expect(
      validateSeedData(
        seedData({
          users: [
            user({ username: 'j.campbell' }),
            user({ username: 'j.campbell2' })
          ]
        })
      )
    ).toEqual([])
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

  it('is no problem when the location seed-data declares the office', () => {
    expect(
      validateSeedData(
        seedData({
          users: [user({ primaryOfficeId: 'ibombo_HPGiE9Jjh2r' })],
          administrativeAreas,
          locations
        })
      )
    ).toEqual([])
  })

  it('is reported by record, naming the office, when the seed-data does not declare it', () => {
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
      '1 problem found in 2 user records; nothing was seeded.',
      '  record 2 (f.katongo): primaryOfficeId "atlantis_ATL1" resolves to office "ATL1", which the seed-data does not declare — an initial user\'s primary office must be a location the seed-data declares'
    ])
  })

  it('is resolved by the transform the write path applies, not by the whole value', () => {
    // The write path looks the office up by the segment after the last
    // underscore, so a reference whose *last* segment is declared resolves
    // and one whose whole value is declared does not.
    expect(
      validateSeedData(
        seedData({
          users: [user({ primaryOfficeId: 'anything_at_all_HPGiE9Jjh2r' })],
          administrativeAreas,
          locations
        })
      )
    ).toEqual([])

    expect(
      validateSeedData(
        seedData({
          users: [user({ primaryOfficeId: 'HPGiE9Jjh2r_suffix' })],
          administrativeAreas,
          locations
        })
      )
    ).toHaveLength(1)
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
  it('reports an administrative area whose parent is not declared', () => {
    expect(
      report({
        users: [user()],
        administrativeAreas: [
          place({ id: 'central', name: 'Central' }),
          place({
            id: 'ibombo',
            name: 'Ibombo',
            partOf: 'Location/atlantis'
          })
        ]
      })
    ).toEqual([
      '1 problem found in 1 user record; nothing was seeded.',
      '  administrative area "Ibombo" (id ibombo): partOf "Location/atlantis" names no declared administrative area — partOf must name an administrative area the seed-data declares, or the root "0"'
    ])
  })

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
      '1 problem found in 1 user record; nothing was seeded.',
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

  it('accepts "0" as the root both areas and locations may be part of', () => {
    expect(
      validateSeedData(
        seedData({
          administrativeAreas: [
            place({ id: 'central', name: 'Central', partOf: 'Location/0' }),
            place({ id: 'ibombo', name: 'Ibombo', partOf: 'Location/central' })
          ],
          locations: [
            place({ id: 'HQ', name: 'HQ', partOf: 'Location/0' }),
            place({ id: 'office', name: 'Office', partOf: 'Location/ibombo' })
          ]
        })
      )
    ).toEqual([])
  })
})

describe('an initial user record that did not parse', () => {
  it('is reported against the record, as the text of the schema message', () => {
    expect(
      report({
        users: [
          user({
            username: 'k.mweene',
            malformed: 'Invalid email address at "email"'
          })
        ]
      })
    ).toEqual([
      '1 problem found in 1 user record; nothing was seeded.',
      '  record 1 (k.mweene): does not parse — Invalid email address at "email"'
    ])
  })

  it('renders as text rather than as a dumped error object', () => {
    // A parse failure used to reach the console as the error itself, which
    // printed a stack trace over many lines. One record is one line, and it
    // holds no rendering of an object.
    const lines = report({
      users: [
        user({
          username: 'k.mweene',
          malformed: 'Invalid email address at "email"'
        })
      ]
    })

    expect(lines).toHaveLength(2)
    expect(lines[1]).not.toContain('[object Object]')
    expect(lines[1]).not.toContain('ZodError')
    expect(lines[1]).not.toMatch(/\bat [\w./]+:\d+:\d+/)
  })

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
      '1 problem found in 1 user record; nothing was seeded.',
      '  record 1: does not parse — Invalid input: expected string, received number'
    ])
  })

  it('keeps every other record at the position the operator will find it at', () => {
    expect(
      report({
        users: [
          user({ username: 'k.mweene', email: 'k.mweene@x.com' }),
          user({ username: undefined, malformed: 'Required at "username"' }),
          user({ username: 'e.mweene', email: 'k.mweene@x.com' })
        ]
      })
    ).toEqual([
      '2 problems found in 3 user records; nothing was seeded.',
      '  record 2: does not parse — Required at "username"',
      '  record 3 (e.mweene): email "k.mweene@x.com" duplicates record 1 — emails must be unique'
    ])
  })

  it('is reported together with a duplicate email in one run', () => {
    expect(
      report({
        users: [
          user({ username: 'k.mweene', email: 'k.mweene@x.com' }),
          user({
            username: 'f.katongo',
            email: 'k.mweene@x.com',
            malformed: 'Invalid input: expected string at "password"'
          })
        ]
      })
    ).toEqual([
      '2 problems found in 2 user records; nothing was seeded.',
      '  record 2 (f.katongo): does not parse — Invalid input: expected string at "password"',
      '  record 2 (f.katongo): email "k.mweene@x.com" duplicates record 1 — emails must be unique'
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
      '1 problem found in 0 user records; nothing was seeded.',
      "  the country config's initial users: do not parse — Invalid input: expected array, received object"
    ])
  })

  it('reports the roles the country config served', () => {
    expect(
      report({
        malformedRoleList: 'Invalid input: expected array, received null'
      })
    ).toEqual([
      '1 problem found in 0 user records; nothing was seeded.',
      "  the country config's roles: do not parse — Invalid input: expected array, received null"
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
      '1 problem found in 0 user records; nothing was seeded.',
      '  role "LOCAL_REGISTRAR": does not parse — Invalid scope: "recorddeclare" at "scopes[0]"'
    ])
  })

  it('is named by its position when it carries no usable id', () => {
    expect(
      report({
        roles: [
          role({ id: 'LOCAL_REGISTRAR' }),
          role({ id: undefined, malformed: 'Required at "id"' })
        ]
      })
    ).toEqual([
      '1 problem found in 0 user records; nothing was seeded.',
      '  role 2: does not parse — Required at "id"'
    ])
  })

  it('still counts as declared, so a user naming it is not also reported', () => {
    expect(
      validateSeedData(
        seedData({
          users: [user({ role: 'LOCAL_REGISTRAR' })],
          roles: [
            role({ id: 'LOCAL_REGISTRAR', malformed: 'Required at "label"' })
          ]
        })
      )
    ).toHaveLength(1)
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
      '1 problem found in 0 user records; nothing was seeded.',
      '  the country config\'s roles: id "LOCAL_REGISTRAR" is declared more than once — role ids must be unique'
    ])
  })

  it('reports an id declared three times once, not twice', () => {
    expect(
      validateSeedData(
        seedData({
          roles: [
            role({ id: 'LOCAL_REGISTRAR' }),
            role({ id: 'LOCAL_REGISTRAR' }),
            role({ id: 'LOCAL_REGISTRAR' })
          ]
        })
      )
    ).toHaveLength(1)
  })

  it('is no problem when every id is distinct', () => {
    expect(
      validateSeedData(
        seedData({
          roles: [
            role({ id: 'LOCAL_REGISTRAR' }),
            role({ id: 'NATIONAL_SYSTEM_ADMIN' })
          ]
        })
      )
    ).toEqual([])
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

  it('is reported by record, naming the role, when no declared role matches', () => {
    expect(
      report({
        users: [
          user({ username: 'k.mweene', role: 'NATIONAL_SYSTEM_ADMIN' }),
          user({ username: 'f.katongo', role: 'LOCAL_REGISTRARR' })
        ],
        roles
      })
    ).toEqual([
      '1 problem found in 2 user records; nothing was seeded.',
      '  record 2 (f.katongo): role "LOCAL_REGISTRARR" names no role the country config declares — an initial user\'s role must be one of the roles the country config declares'
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
      '1 problem found in 1 user record; nothing was seeded.',
      "  the country config's roles: do not parse — Invalid input: expected array, received object"
    ])
  })
})

describe('the ability to configure the seeded system', () => {
  it('is no problem when an initial user carries a role that has the scope', () => {
    expect(
      validateSeedData(
        seedData({
          users: [
            user({ username: 'k.mweene', role: 'LOCAL_REGISTRAR' }),
            user({ username: 'j.musonda', role: 'NATIONAL_SYSTEM_ADMIN' })
          ],
          roles: [
            role({ id: 'LOCAL_REGISTRAR' }),
            role({ id: 'NATIONAL_SYSTEM_ADMIN', scopes: CONFIGURE })
          ]
        })
      )
    ).toEqual([])
  })

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
      '1 problem found in 1 user record; nothing was seeded.',
      '  the initial users: include nobody who could configure the system — at least one initial user must carry a role with the "config.update-all" scope'
    ])
  })

  it("is reported when the only role that has the scope is nobody's", () => {
    expect(
      report({
        users: [user({ username: 'k.mweene', role: 'NO_SUCH_ROLE' })],
        roles: [role({ id: 'NATIONAL_SYSTEM_ADMIN', scopes: CONFIGURE })]
      })
    ).toEqual([
      '2 problems found in 1 user record; nothing was seeded.',
      '  the initial users: include nobody who could configure the system — at least one initial user must carry a role with the "config.update-all" scope',
      '  record 1 (k.mweene): role "NO_SUCH_ROLE" names no role the country config declares — an initial user\'s role must be one of the roles the country config declares'
    ])
  })

  it('stands down when a role an initial user names did not parse', () => {
    // The role exists but its scopes could not be read, so whether anybody
    // can configure the system is not yet knowable.
    expect(
      validateSeedData(
        seedData({
          users: [user({ role: 'NATIONAL_SYSTEM_ADMIN' })],
          roles: [
            role({
              id: 'NATIONAL_SYSTEM_ADMIN',
              malformed: 'Required at "label"'
            })
          ]
        })
      )
    ).toHaveLength(1)
  })

  it('stands down when no record names a role to check', () => {
    expect(
      validateSeedData(seedData({ users: [user({ username: 'k.mweene' })] }))
    ).toEqual([])
  })
})

describe("an initial user's mobile number", () => {
  /** A pattern of the shape a country config configures: a local number of ten
   * digits beginning `07` or `09`. */
  const PHONE_NUMBER_PATTERN = '^0(7|9)[0-9]{8}$'

  it('is no problem when it matches the configured pattern', () => {
    expect(
      validateSeedData(
        seedData({
          users: [user({ mobile: '0733333333' })],
          PHONE_NUMBER_PATTERN
        })
      )
    ).toEqual([])
  })

  it('is reported by record, naming the number and the pattern, when it does not match', () => {
    expect(
      report({
        users: [
          user({ username: 'k.mweene', mobile: '0733333333' }),
          user({ username: 'f.katongo', mobile: '+260733333333' })
        ],
        PHONE_NUMBER_PATTERN
      })
    ).toEqual([
      '1 problem found in 2 user records; nothing was seeded.',
      '  record 2 (f.katongo): mobile "+260733333333" does not match the configured pattern ^0(7|9)[0-9]{8}$ — an initial user\'s mobile number must match the country config\'s PHONE_NUMBER_PATTERN'
    ])
  })

  it('is reported for every record at fault, in record order', () => {
    expect(
      validateSeedData(
        seedData({
          users: [
            user({ username: 'one', mobile: '0733333333' }),
            user({ username: 'two', mobile: '073' }),
            user({ username: 'three', mobile: '0744444444' }),
            user({ username: 'four', mobile: 'not a number' })
          ],
          PHONE_NUMBER_PATTERN
        })
      ).map((problem) => problem.record?.position)
    ).toEqual([2, 4])
  })

  it('is not checked at all when the seed-data configures no pattern', () => {
    expect(
      validateSeedData(
        seedData({ users: [user({ mobile: 'not a number at all' })] })
      )
    ).toEqual([])
  })

  it('is checked against the whole number, not merely a part of it', () => {
    // An unanchored pattern is the country config's business, but an anchored
    // one must be honoured as written.
    expect(
      validateSeedData(
        seedData({
          users: [user({ mobile: 'x0733333333x' })],
          PHONE_NUMBER_PATTERN
        })
      )
    ).toHaveLength(1)
  })
})

describe('a configured phone number pattern that is not a regular expression', () => {
  const PHONE_NUMBER_PATTERN = '^0(7|9)[0-9{8}$'

  it('is reported as a problem of the country config rather than of any record', () => {
    expect(
      report({
        users: [user({ username: 'k.mweene', mobile: '0733333333' })],
        PHONE_NUMBER_PATTERN
      })
    ).toEqual([
      '1 problem found in 1 user record; nothing was seeded.',
      '  the country config\'s application configuration: PHONE_NUMBER_PATTERN "^0(7|9)[0-9{8}$" is not a valid regular expression — a configured phone number pattern must be a valid regular expression'
    ])
  })

  it('fails validation rather than letting the mobile numbers through unchecked', () => {
    // The service logs and carries on where this pattern will not compile, so
    // a country can lose mobile validation without being told. Here the run
    // stops: there is a problem, so nothing is seeded.
    const problems = validateSeedData(
      seedData({
        users: [user({ mobile: '0733333333' })],
        PHONE_NUMBER_PATTERN
      })
    )

    expect(problems).toHaveLength(1)
    expect(problems[0].record).toBeUndefined()
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
      '1 problem found in 3 user records; nothing was seeded.',
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
      '5 problems found in 4 user records; nothing was seeded.',
      '  record 2 (f.katongo): mobile "+2601" duplicates record 1 — mobile numbers must be unique',
      '  record 3 (e.mweene): email "k.mweene@x.com" duplicates record 1 — emails must be unique',
      '  record 4 (f.katongo): email "k.mweene@x.com" duplicates record 1 — emails must be unique',
      '  record 4 (f.katongo): mobile "+2601" duplicates record 1 — mobile numbers must be unique',
      '  record 4 (f.katongo): username "f.katongo" duplicates record 2 — usernames must be unique'
    ])
  })

  it('counts problems rather than records in the header', () => {
    // Three records are at fault on five lines, and the header says five.
    expect(report({ users })[0]).toBe(
      '5 problems found in 4 user records; nothing was seeded.'
    )
  })

  it('ends the header with the phrase that says the database is untouched', () => {
    expect(report({ users })[0]).toContain('nothing was seeded.')
  })

  it('reports a broken hierarchy, an unknown office and a duplicate email together', () => {
    expect(
      report({
        users: [
          user({
            username: 'k.mweene',
            email: 'k.mweene@x.com',
            primaryOfficeId: 'ibombo_HPGiE9Jjh2r'
          }),
          user({
            username: 'f.katongo',
            email: 'k.mweene@x.com',
            primaryOfficeId: 'atlantis_ATL1'
          })
        ],
        administrativeAreas: [
          place({ id: 'ibombo', name: 'Ibombo', partOf: 'Location/atlantis' })
        ],
        locations: [
          place({
            id: 'HPGiE9Jjh2r',
            name: 'Ibombo District Office',
            partOf: 'Location/ibombo'
          })
        ]
      })
    ).toEqual([
      '3 problems found in 2 user records; nothing was seeded.',
      '  administrative area "Ibombo" (id ibombo): partOf "Location/atlantis" names no declared administrative area — partOf must name an administrative area the seed-data declares, or the root "0"',
      '  record 2 (f.katongo): email "k.mweene@x.com" duplicates record 1 — emails must be unique',
      '  record 2 (f.katongo): primaryOfficeId "atlantis_ATL1" resolves to office "ATL1", which the seed-data does not declare — an initial user\'s primary office must be a location the seed-data declares'
    ])
  })

  it('reports a badly formatted mobile number alongside a duplicate and an unknown role', () => {
    expect(
      report({
        users: [
          user({
            username: 'k.mweene',
            mobile: '0733333333',
            role: 'LOCAL_REGISTRAR'
          }),
          user({
            username: 'f.katongo',
            mobile: '+260733333333',
            role: 'CHIEF_OF_ATLANTIS'
          }),
          user({
            username: 'e.mweene',
            mobile: '0733333333',
            role: 'LOCAL_REGISTRAR'
          })
        ],
        roles: [role({ id: 'LOCAL_REGISTRAR', scopes: CONFIGURE })],
        PHONE_NUMBER_PATTERN: '^0(7|9)[0-9]{8}$'
      })
    ).toEqual([
      '3 problems found in 3 user records; nothing was seeded.',
      '  record 2 (f.katongo): role "CHIEF_OF_ATLANTIS" names no role the country config declares — an initial user\'s role must be one of the roles the country config declares',
      '  record 2 (f.katongo): mobile "+260733333333" does not match the configured pattern ^0(7|9)[0-9]{8}$ — an initial user\'s mobile number must match the country config\'s PHONE_NUMBER_PATTERN',
      '  record 3 (e.mweene): mobile "0733333333" duplicates record 1 — mobile numbers must be unique'
    ])
  })
})

describe('the checks that used to abort the run', () => {
  it('all appear in record order under the same count header', () => {
    // One set of seed-data breaking all five of the checks that each used to
    // end the run on their own, alongside a duplicate email — one report,
    // one header, one editing pass.
    expect(
      report({
        users: [
          user({
            username: 'k.mweene',
            email: 'k.mweene@x.com',
            role: 'LOCAL_REGISTRAR'
          }),
          user({ username: undefined, malformed: 'Required at "username"' }),
          user({
            username: 'f.katongo',
            email: 'k.mweene@x.com',
            role: 'LOCAL_REGISTRARR'
          })
        ],
        roles: [
          role({ id: 'LOCAL_REGISTRAR' }),
          role({ id: 'LOCAL_REGISTRAR' }),
          role({
            id: 'PERFORMANCE_MANAGER',
            malformed: 'Invalid scope: "perfomance.read" at "scopes[0]"'
          })
        ]
      })
    ).toEqual([
      '6 problems found in 3 user records; nothing was seeded.',
      '  role "PERFORMANCE_MANAGER": does not parse — Invalid scope: "perfomance.read" at "scopes[0]"',
      '  the country config\'s roles: id "LOCAL_REGISTRAR" is declared more than once — role ids must be unique',
      '  the initial users: include nobody who could configure the system — at least one initial user must carry a role with the "config.update-all" scope',
      '  record 2: does not parse — Required at "username"',
      '  record 3 (f.katongo): email "k.mweene@x.com" duplicates record 1 — emails must be unique',
      '  record 3 (f.katongo): role "LOCAL_REGISTRARR" names no role the country config declares — an initial user\'s role must be one of the roles the country config declares'
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

  it('summarises a single initial user in the singular', () => {
    expect(formatValidationSummary(seedData({ users: [user()] }))).toBe(
      'Seed-data validated: 1 initial user, 0 administrative areas, 0 locations. ' +
        'No problems found.'
    )
  })
})

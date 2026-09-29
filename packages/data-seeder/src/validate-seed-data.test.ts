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
import { encodeScope, EncodedScope } from '@opencrvs/commons'
import {
  ApplicationConfigRead,
  parseApplicationConfig
} from './application-config'
import { LocationPayload, LocationRead, ParsedPlace } from './locations'
import { ParsedRole, RoleProblem, RoleRead } from './roles'
import { SeedProblem, SeedSources } from './seed-data'
import { CheckedUser, ParsedUser, UserProblem, UserRead } from './users'
import { validateSeedData } from './validate-seed-data'
import {
  formatValidationReport,
  formatValidationSummary
} from './validation-report'

const OFFICE = 'HPGiE9Jjh2r'
const AREA = 'ibombo'

/**
 * The default is a set of seed-data with nothing wrong with it, so that a test
 * states the one thing it is about and everything else stays quiet. That is
 * why the default role carries the scope that lets someone configure the
 * system, and why the default initial user's office and role are ones the
 * defaults below declare.
 */
function user(overrides: Partial<Omit<CheckedUser, 'position'>> = {}) {
  return {
    username: 'a.user',
    primaryOfficeId: `${AREA}_${OFFICE}`,
    role: 'LOCAL_REGISTRAR',
    ...overrides
  }
}

/** No cross-cutting check reads the payload — it cannot, it is not given one —
 * so it carries nothing a test has to state. */
function withPayload(
  user: Omit<CheckedUser, 'position'>,
  index: number
): ParsedUser {
  return {
    ...user,
    position: index + 1,
    payload: {
      ...user,
      password: 'password',
      firstname: 'A',
      surname: 'User'
    }
  }
}

/** Positions follow the list, which is where a real one gets them too. */
function initialUsers(
  users: Omit<CheckedUser, 'position'>[] = [],
  problems: UserProblem[] = []
): UserRead {
  return { readable: true, users: users.map(withPayload), problems }
}

function role(overrides: Partial<Omit<ParsedRole, 'position'>> = {}) {
  return { id: 'LOCAL_REGISTRAR', scopes: [] as EncodedScope[], ...overrides }
}

function roles(
  declared: Omit<ParsedRole, 'position'>[],
  problems: RoleProblem[] = []
): RoleRead {
  return {
    readable: true,
    roles: declared.map((role, index) => ({ ...role, position: index + 1 })),
    problems
  }
}

/**
 * The scope without which nobody could configure the seeded system, encoded
 * the way a country config's roles carry it.
 */
const CONFIGURE = [encodeScope({ type: 'config.update-all' })]

/** A node of the hierarchy: an administrative area or a location. */
function place(overrides: Partial<ParsedPlace> = {}): ParsedPlace {
  return { id: 'a-place', name: 'A Place', partOf: 'Location/0', ...overrides }
}

/** No cross-cutting check reads the payload, so it carries nothing a test has
 * to state. Whether the hierarchy holds together is `locations.test.ts`. */
const NO_PAYLOAD: LocationPayload = { administrativeAreas: [], locations: [] }

function hierarchy(
  administrativeAreas: ParsedPlace[],
  locations: ParsedPlace[]
): LocationRead {
  return {
    readable: true,
    administrativeAreas,
    locations,
    payload: NO_PAYLOAD,
    problems: []
  }
}

/** Built through the module, so that a fixture cannot state a pattern without
 * the problems that come with it. */
function applicationConfig(PHONE_NUMBER_PATTERN = '.*'): ApplicationConfigRead {
  return parseApplicationConfig({ PHONE_NUMBER_PATTERN })
}

/** A whole set of seed-data, with only the part a test exercises filled in. */
function seedData(overrides: Partial<SeedSources> = {}): SeedSources {
  return {
    users: initialUsers(),
    roles: roles([role({ scopes: CONFIGURE })]),
    locations: hierarchy(
      [place({ id: AREA, name: 'Ibombo' })],
      [place({ id: OFFICE, name: 'Ibombo District Office', partOf: `Location/${AREA}` })]
    ),
    applicationConfig: applicationConfig(),
    ...overrides
  }
}

/** The problem lines an operator would see. */
function problems(overrides: Partial<SeedSources> = {}) {
  return formatValidationReport(validateSeedData(seedData(overrides)))
    .split('\n')
    .slice(1)
}

describe("an initial user's primary office", () => {
  it('is reported by initial user, naming the office, when the seed-data does not declare it', () => {
    expect(
      problems({
        users: initialUsers([
          user({ username: 'k.mweene' }),
          user({ username: 'f.katongo', primaryOfficeId: 'atlantis_ATL1' })
        ])
      })
    ).toEqual([
      '  initial user 2 (f.katongo): primaryOfficeId "atlantis_ATL1" resolves to office "ATL1", which the seed-data does not declare — an initial user\'s primary office must be a location the seed-data declares'
    ])
  })

  it('may not be an administrative area, since only locations are offices', () => {
    expect(
      validateSeedData(
        seedData({ users: initialUsers([user({ primaryOfficeId: AREA })]) })
      )
    ).toHaveLength(1)
  })

  it('is not reported when the hierarchy could not be read at all', () => {
    // Every initial user would be reported, and none of it would be news.
    expect(
      validateSeedData(
        seedData({
          users: initialUsers([user()]),
          locations: {
            readable: false,
            problem: { kind: 'hierarchyUnparsed', message: 'Invalid input' }
          }
        })
      ).filter(({ kind }) => kind === 'unknownOffice')
    ).toEqual([])
  })
})

describe("an initial user's role", () => {
  const declared = roles([
    role({ id: 'LOCAL_REGISTRAR' }),
    role({ id: 'NATIONAL_SYSTEM_ADMIN', scopes: CONFIGURE })
  ])

  it('is no problem when the country config declares it', () => {
    expect(
      validateSeedData(
        seedData({
          users: initialUsers([user({ role: 'NATIONAL_SYSTEM_ADMIN' })]),
          roles: declared
        })
      )
    ).toEqual([])
  })

  it('is reported by initial user, naming the role, when no declared role matches', () => {
    expect(
      problems({
        users: initialUsers([
          user({ username: 'k.mweene', role: 'NATIONAL_SYSTEM_ADMIN' }),
          user({ username: 'f.katongo', role: 'LOCAL_REGISTRARR' })
        ]),
        roles: declared
      })
    ).toEqual([
      '  initial user 2 (f.katongo): role "LOCAL_REGISTRARR" names no role the country config declares — an initial user\'s role must be one of the roles the country config declares'
    ])
  })

  it('is no problem when the declared role did not parse: it is still declared', () => {
    expect(
      validateSeedData(
        seedData({
          users: initialUsers([user({ role: 'SOCIAL_WORKER' })]),
          roles: roles([role({ scopes: CONFIGURE })], [
            {
              kind: 'roleUnparsed',
              role: { position: 2, id: 'SOCIAL_WORKER' },
              message: 'Invalid scope: "nonsense"'
            }
          ])
        })
      ).filter(({ kind }) => kind === 'unknownRole')
    ).toEqual([])
  })

  it('is not reported when the role list itself could not be read', () => {
    // Every initial user would be reported, and none of it would be news.
    expect(
      validateSeedData(
        seedData({
          users: initialUsers([user()]),
          roles: {
            readable: false,
            problem: { kind: 'roleListUnparsed', message: 'Invalid input' }
          }
        })
      ).filter(({ kind }) => kind === 'unknownRole')
    ).toEqual([])
  })
})

describe('the ability to configure the seeded system', () => {
  it('is reported when no initial user carries a role that has the scope', () => {
    expect(
      problems({
        users: initialUsers([user({ username: 'k.mweene' })]),
        roles: roles([
          role({ id: 'LOCAL_REGISTRAR' }),
          role({ id: 'NATIONAL_SYSTEM_ADMIN', scopes: CONFIGURE })
        ])
      })
    ).toEqual([
      '  the initial users: include nobody who could configure the system — at least one initial user must carry a role with the "config.update-all" scope'
    ])
  })

  it('stands down when there is no initial user to check', () => {
    expect(
      validateSeedData(seedData({ roles: roles([role()]) }))
    ).toEqual([])
  })

  it('stands down when a role an initial user names did not parse', () => {
    // Its scopes might have been the ones in question.
    expect(
      validateSeedData(
        seedData({
          users: initialUsers([user({ role: 'SOCIAL_WORKER' })]),
          roles: roles([role()], [
            {
              kind: 'roleUnparsed',
              role: { position: 2, id: 'SOCIAL_WORKER' },
              message: 'Invalid scope: "nonsense"'
            }
          ])
        })
      ).filter(({ kind }) => kind === 'noConfigurationAdministrator')
    ).toEqual([])
  })

  it('is still reported when an initial user names a role nobody declares', () => {
    // An undeclared role grants nothing, so it does not stand the check down.
    expect(
      validateSeedData(
        seedData({
          users: initialUsers([user({ role: 'CHAIRMAN' })]),
          roles: roles([role()])
        })
      ).filter(({ kind }) => kind === 'noConfigurationAdministrator')
    ).toHaveLength(1)
  })
})

describe("an initial user's mobile number", () => {
  /** A pattern of the shape a country config configures: a local number of ten
   * digits beginning `07` or `09`. */
  const PHONE_NUMBER_PATTERN = '^0(7|9)[0-9]{8}$'

  it('is reported by initial user, naming the number and the pattern, when it does not match', () => {
    expect(
      problems({
        users: initialUsers([
          user({ username: 'k.mweene', mobile: '0733333333' }),
          user({ username: 'f.katongo', mobile: '+260733333333' })
        ]),
        applicationConfig: applicationConfig(PHONE_NUMBER_PATTERN)
      })
    ).toEqual([
      '  initial user 2 (f.katongo): mobile "+260733333333" does not match the configured pattern ^0(7|9)[0-9]{8}$ — an initial user\'s mobile number must match the country config\'s PHONE_NUMBER_PATTERN'
    ])
  })

  it('is not checked against a pattern that is not a regular expression', () => {
    // Every number fails a pattern that cannot be read, and fifty-five
    // invented problems would bury the one real one. That the pattern itself
    // is a problem is `application-config.test.ts`.
    expect(
      validateSeedData(
        seedData({
          users: initialUsers([
            user({ username: 'one', mobile: '0733333333' }),
            user({ username: 'two', mobile: 'nonsense' })
          ]),
          applicationConfig: applicationConfig('^0(7|9)[0-9{8}$')
        })
      ).filter(({ kind }) => kind === 'mobileDoesNotMatchPattern')
    ).toEqual([])
  })

  it('is not checked when the application configuration could not be read', () => {
    expect(
      validateSeedData(
        seedData({
          users: initialUsers([user({ mobile: 'nonsense' })]),
          applicationConfig: {
            readable: false,
            problem: {
              kind: 'applicationConfigUnparsed',
              message: 'Invalid input'
            }
          }
        })
      ).filter(({ kind }) => kind === 'mobileDoesNotMatchPattern')
    ).toEqual([])
  })
})

describe('the report', () => {
  /**
   * One problem of every kind, in an order no report would print them in: what
   * the report promises an operator is that it names each problem the same way
   * every time, and prints them in seed-data order regardless of the order the
   * checks found them.
   */
  const everyKind: SeedProblem[] = [
    {
      kind: 'userUnparsed',
      user: { position: 4, username: 'd.dube' },
      message: 'Invalid input'
    },
    {
      kind: 'mobileDoesNotMatchPattern',
      user: { position: 3, username: 'b.mutesi' },
      mobile: '07',
      pattern: '^\\+260[0-9]{9}$'
    },
    {
      kind: 'unknownRole',
      user: { position: 2, username: 'k.mweene' },
      role: 'CHAIRMAN'
    },
    {
      kind: 'unknownOffice',
      user: { position: 2, username: 'k.mweene' },
      primaryOfficeId: 'ibombo_nowhere',
      externalId: 'nowhere'
    },
    {
      kind: 'duplicateUserField',
      user: { position: 2, username: 'k.mweene' },
      field: 'email',
      value: 'k.mweene@x.com',
      firstSeenAt: 1
    },
    {
      kind: 'duplicateUserField',
      user: { position: 2, username: 'k.mweene' },
      field: 'mobile',
      value: '+260911111111',
      firstSeenAt: 1
    },
    {
      kind: 'duplicateUserField',
      user: { position: 2, username: 'k.mweene' },
      field: 'username',
      value: 'k.mweene',
      firstSeenAt: 1
    },
    { kind: 'duplicateRoleId', id: 'LOCAL_REGISTRAR' },
    {
      kind: 'roleUnparsed',
      role: { position: 3, id: 'SOCIAL_WORKER' },
      message: 'Invalid scope: "nonsense"'
    },
    {
      kind: 'unparentedNode',
      node: { place: 'administrativeArea', id: AREA, name: 'Ibombo' },
      partOf: 'Location/central'
    },
    { kind: 'noConfigurationAdministrator', scope: 'config.update-all' },
    { kind: 'invalidPhoneNumberPattern', pattern: '^0(7|9)[0-9{8}$' },
    { kind: 'hierarchyUnparsed', message: 'Invalid input' },
    { kind: 'applicationConfigUnparsed', message: 'Invalid input' },
    { kind: 'roleListUnparsed', message: 'Invalid input' },
    { kind: 'userListUnparsed', message: 'Invalid input' }
  ]

  it('counts the problems, and says nothing was seeded', () => {
    expect(formatValidationReport(everyKind).split('\n')[0]).toBe(
      '16 problems found; nothing was seeded.'
    )
  })

  it('uses the singular for a lone problem', () => {
    expect(
      formatValidationReport([
        { kind: 'duplicateRoleId', id: 'LOCAL_REGISTRAR' }
      ]).split('\n')[0]
    ).toBe('1 problem found; nothing was seeded.')
  })

  it('names every kind of problem, in seed-data order', () => {
    expect(formatValidationReport(everyKind).split('\n').slice(1)).toEqual([
      "  the country config's initial users: do not parse — Invalid input",
      "  the country config's roles: do not parse — Invalid input",
      "  the country config's application configuration: does not parse — Invalid input",
      '  the country config\'s application configuration: PHONE_NUMBER_PATTERN "^0(7|9)[0-9{8}$" is not a valid regular expression — a configured phone number pattern must be a valid regular expression',
      '  the initial users: include nobody who could configure the system — at least one initial user must carry a role with the "config.update-all" scope',
      "  the country config's administrative hierarchy: does not parse — Invalid input",
      '  administrative area "Ibombo" (id ibombo): partOf "Location/central" names no declared administrative area — partOf must name an administrative area the seed-data declares, or the root "0"',
      '  role "SOCIAL_WORKER": does not parse — Invalid scope: "nonsense"',
      `  the country config's roles: id "LOCAL_REGISTRAR" is declared more than once — role ids must be unique`,
      '  initial user 2 (k.mweene): email "k.mweene@x.com" duplicates initial user 1 — emails must be unique',
      '  initial user 2 (k.mweene): mobile "+260911111111" duplicates initial user 1 — mobile numbers must be unique',
      '  initial user 2 (k.mweene): username "k.mweene" duplicates initial user 1 — usernames must be unique',
      `  initial user 2 (k.mweene): primaryOfficeId "ibombo_nowhere" resolves to office "nowhere", which the seed-data does not declare — an initial user's primary office must be a location the seed-data declares`,
      `  initial user 2 (k.mweene): role "CHAIRMAN" names no role the country config declares — an initial user's role must be one of the roles the country config declares`,
      `  initial user 3 (b.mutesi): mobile "07" does not match the configured pattern ^\\+260[0-9]{9}$ — an initial user's mobile number must match the country config's PHONE_NUMBER_PATTERN`,
      '  initial user 4 (d.dube): does not parse — Invalid input'
    ])
  })

  it('names an initial user by position alone when it carries no usable username', () => {
    expect(
      formatValidationReport([
        {
          kind: 'userUnparsed',
          user: { position: 1 },
          message: 'Invalid input: expected string, received number'
        }
      ]).split('\n')[1]
    ).toBe(
      '  initial user 1: does not parse — Invalid input: expected string, received number'
    )
  })

  it('names a role by position when it carries no usable id', () => {
    expect(
      formatValidationReport([
        {
          kind: 'roleUnparsed',
          role: { position: 2 },
          message: 'Invalid input'
        }
      ]).split('\n')[1]
    ).toBe('  role 2: does not parse — Invalid input')
  })
})

describe('valid seed-data', () => {
  const valid = seedData({
    users: initialUsers([
      user({
        username: 'k.mweene',
        email: 'k.mweene@x.com',
        mobile: '+260911111111'
      }),
      user({
        username: 'f.katongo',
        email: 'f.katongo@x.com',
        mobile: '+260922222222'
      })
    ]),
    roles: roles([role({ scopes: CONFIGURE })]),
    locations: hierarchy(
      [
        place({ id: 'central', name: 'Central' }),
        place({ id: AREA, name: 'Ibombo', partOf: 'Location/central' }),
        place({ id: 'isamba', name: 'Isamba', partOf: 'Location/central' })
      ],
      [
        place({
          id: OFFICE,
          name: 'Ibombo District Office',
          partOf: `Location/${AREA}`
        })
      ]
    )
  })

  it('produces no problems', () => {
    expect(validateSeedData(valid)).toEqual([])
  })

  it('is summarised in one line stating what was validated', () => {
    expect(formatValidationSummary(valid)).toBe(
      'Seed-data validated: 2 initial users, 1 role, 3 administrative areas, ' +
        '1 location. ' +
        'No problems found.'
    )
  })
})

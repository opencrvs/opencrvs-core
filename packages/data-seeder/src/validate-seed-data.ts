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
import { EncodedScope, hasScope } from '@opencrvs/commons'
import { officeExternalId } from './office-external-id'
import {
  InitialUserRef,
  NOTHING_WAS_SEEDED,
  Offending,
  SeedSubject,
  renderOffending,
  renderSubject
} from './seed-report'

/** Every field is optional, including those the country config's schema
 * requires: an entry that did not parse still arrives here and may be missing
 * anything, so a check reads only what is there. */
export interface SeedDataUser {
  username?: string
  email?: string
  mobile?: string
  /** A compound reference, not the office's own id. */
  primaryOfficeId?: string
  role?: string
  malformed?: string
}

export interface SeedDataRole {
  id?: string
  scopes: EncodedScope[]
  malformed?: string
}

export interface SeedDataLocation {
  id: string
  name: string
  /** `Location/<id>`, or `Location/0` at the root of the hierarchy. */
  partOf: string
}

export interface SeedData {
  users: SeedDataUser[]
  roles: SeedDataRole[]
  PHONE_NUMBER_PATTERN: string
  malformedUserList?: string
  malformedRoleList?: string
  administrativeAreas: SeedDataLocation[]
  locations: SeedDataLocation[]
}

export type SeedDataProblem = SeedSubject &
  Offending & {
    problem: string
    rule: string
  }

/** `normalise` mirrors how the write path compares the field, so both agree on
 * what a duplicate is: emails and usernames are lowercased on write, mobile
 * numbers are stored verbatim. */
interface UniqueUserField {
  field: string
  rule: string
  read: (user: SeedDataUser) => string | undefined
  normalise: (value: string) => string
}

const lowercased = (value: string) => value.toLowerCase()
const verbatim = (value: string) => value

const UNIQUE_USER_FIELDS: UniqueUserField[] = [
  {
    field: 'email',
    rule: 'emails must be unique',
    read: (user) => user.email,
    normalise: lowercased
  },
  {
    field: 'mobile',
    rule: 'mobile numbers must be unique',
    read: (user) => user.mobile,
    normalise: verbatim
  },
  {
    field: 'username',
    rule: 'usernames must be unique',
    read: (user) => user.username,
    normalise: lowercased
  }
]

function identifyUser(user: SeedDataUser, index: number): InitialUserRef {
  return { position: index + 1, username: user.username }
}

function duplicatesOf(
  users: SeedDataUser[],
  { field, rule, read, normalise }: UniqueUserField
): SeedDataProblem[] {
  const problems: SeedDataProblem[] = []
  const firstSeenAt = new Map<string, number>()

  users.forEach((user, index) => {
    const value = read(user)

    if (value === undefined) {
      return
    }

    const key = normalise(value)
    const original = firstSeenAt.get(key)

    if (original === undefined) {
      firstSeenAt.set(key, index + 1)
      return
    }

    problems.push({
      about: 'initialUser',
      user: identifyUser(user, index),
      field,
      value,
      problem: `duplicates initial user ${original}`,
      rule
    })
  })

  return problems
}

/** Offices are resolved against the seed-data, not the database, which has not
 * been seeded yet. Only locations are offices — administrative areas are
 * written to a different table from the one the write path looks in. */
function unknownOffices({ users, locations }: SeedData): SeedDataProblem[] {
  const declaredOffices = new Set(locations.map(({ id }) => id))
  const problems: SeedDataProblem[] = []

  users.forEach((user, index) => {
    if (user.primaryOfficeId === undefined) {
      return
    }

    const externalId = officeExternalId(user.primaryOfficeId)

    if (declaredOffices.has(externalId)) {
      return
    }

    problems.push({
      about: 'initialUser',
      user: identifyUser(user, index),
      field: 'primaryOfficeId',
      value: user.primaryOfficeId,
      problem: `resolves to office "${externalId}", which the seed-data does not declare`,
      rule: `an initial user's primary office must be a location the seed-data declares`
    })
  })

  return problems
}

const ROOT_ADMINISTRATIVE_AREA_ID = '0'

/** One check covers both halves of the hierarchy: areas nest inside areas and
 * locations hang off them, so only areas are ever parents. */
function unparentedNodes(
  nodes: SeedDataLocation[],
  kind: string,
  declaredAreas: Set<string>
): SeedDataProblem[] {
  return nodes
    .filter(({ partOf }) => {
      const parentId = partOf.split('/')[1]
      return (
        parentId !== ROOT_ADMINISTRATIVE_AREA_ID && !declaredAreas.has(parentId)
      )
    })
    .map(({ id, name, partOf }) => ({
      about: 'subject',
      subject: `${kind} "${name}" (id ${id})`,
      field: 'partOf',
      value: partOf,
      problem: 'names no declared administrative area',
      rule: `partOf must name an administrative area the seed-data declares, or the root "${ROOT_ADMINISTRATIVE_AREA_ID}"`
    }))
}

function unparsedLists({
  malformedUserList,
  malformedRoleList
}: SeedData): SeedDataProblem[] {
  const problems: SeedDataProblem[] = []

  if (malformedUserList !== undefined) {
    problems.push({
      about: 'subject',
      subject: `the country config's initial users`,
      problem: 'do not parse',
      rule: malformedUserList
    })
  }

  if (malformedRoleList !== undefined) {
    problems.push({
      about: 'subject',
      subject: `the country config's roles`,
      problem: 'do not parse',
      rule: malformedRoleList
    })
  }

  return problems
}

/** No `initialUser`: a role lives in the country config's roles rather than in
 * the employees spreadsheet. */
function unparsedRoles({ roles }: SeedData): SeedDataProblem[] {
  return roles.flatMap((role, index) =>
    role.malformed === undefined
      ? []
      : [
          {
            about: 'subject',
            subject:
              role.id === undefined ? `role ${index + 1}` : `role "${role.id}"`,
            problem: 'does not parse',
            rule: role.malformed
          }
        ]
  )
}

function duplicateRoleIds({ roles }: SeedData): SeedDataProblem[] {
  const seen = new Set<string>()
  const reported = new Set<string>()
  const problems: SeedDataProblem[] = []

  for (const { id } of roles) {
    if (id === undefined) {
      continue
    }

    if (!seen.has(id)) {
      seen.add(id)
      continue
    }

    if (reported.has(id)) {
      continue
    }

    reported.add(id)
    problems.push({
      about: 'subject',
      subject: `the country config's roles`,
      field: 'id',
      value: id,
      problem: 'is declared more than once',
      rule: 'role ids must be unique'
    })
  }

  return problems
}

/** Includes roles that did not parse: such a role exists and is named. */
function declaredRoleIds(roles: SeedDataRole[]): Map<string, SeedDataRole> {
  return new Map(
    roles.flatMap((role) => (role.id === undefined ? [] : [[role.id, role]]))
  )
}

/** Stands down when the role list did not parse: every user would be
 * reported, and none of it would be news. */
function unknownRoles({
  users,
  roles,
  malformedRoleList
}: SeedData): SeedDataProblem[] {
  if (malformedRoleList !== undefined) {
    return []
  }

  const declared = declaredRoleIds(roles)

  return users.flatMap((user, index) =>
    user.role === undefined || declared.has(user.role)
      ? []
      : [
          {
            about: 'initialUser',
            user: identifyUser(user, index),
            field: 'role',
            value: user.role,
            problem: 'names no role the country config declares',
            rule: `an initial user's role must be one of the roles the country config declares`
          }
        ]
  )
}

function compilePattern(pattern: string): RegExp | undefined {
  try {
    return new RegExp(pattern)
  } catch {
    return undefined
  }
}

/** The service that creates a user compiles this same pattern and, where it
 * will not compile, logs and carries on — so a typo silently costs a country
 * every mobile number check. Here it is a problem. */
function invalidPhoneNumberPattern({
  PHONE_NUMBER_PATTERN
}: SeedData): SeedDataProblem[] {
  if (compilePattern(PHONE_NUMBER_PATTERN) !== undefined) {
    return []
  }

  return [
    {
      about: 'subject',
      subject: `the country config's application configuration`,
      field: 'PHONE_NUMBER_PATTERN',
      value: PHONE_NUMBER_PATTERN,
      problem: 'is not a valid regular expression',
      rule: 'a configured phone number pattern must be a valid regular expression'
    }
  ]
}

/** Stands down when the pattern will not compile: every number fails against
 * an unreadable pattern, which the check above already reports. */
function misformattedMobileNumbers({
  users,
  PHONE_NUMBER_PATTERN
}: SeedData): SeedDataProblem[] {
  const pattern = compilePattern(PHONE_NUMBER_PATTERN)

  if (pattern === undefined) {
    return []
  }

  return users.flatMap((user, index) =>
    user.mobile === undefined || pattern.test(user.mobile)
      ? []
      : [
          {
            about: 'initialUser',
            user: identifyUser(user, index),
            field: 'mobile',
            value: user.mobile,
            problem: `does not match the configured pattern ${PHONE_NUMBER_PATTERN}`,
            rule: `an initial user's mobile number must match the country config's PHONE_NUMBER_PATTERN`
          }
        ]
  )
}

/** Without a holder of this scope, the seeded system cannot be administered. */
const CONFIGURE_SCOPE = 'config.update-all'

/** Stands down where the answer cannot be known: the role list did not parse,
 * no initial user names a role, or a named role did not parse and its scopes might
 * have been the ones in question. An undeclared role grants nothing, so it
 * does not stand the check down. */
function missingConfigurationAdministrator({
  users,
  roles,
  malformedRoleList
}: SeedData): SeedDataProblem[] {
  const named = users.flatMap((user) =>
    user.role === undefined ? [] : [user.role]
  )

  if (malformedRoleList !== undefined || named.length === 0) {
    return []
  }

  const declared = declaredRoleIds(roles)
  let unreadable = false

  for (const id of named) {
    const role = declared.get(id)

    if (role === undefined) {
      continue
    }

    if (role.malformed !== undefined) {
      unreadable = true
      continue
    }

    if (hasScope(role.scopes, CONFIGURE_SCOPE)) {
      return []
    }
  }

  return unreadable
    ? []
    : [
        {
          about: 'subject',
          subject: 'the initial users',
          problem: 'include nobody who could configure the system',
          rule: `at least one initial user must carry a role with the "${CONFIGURE_SCOPE}" scope`
        }
      ]
}

/** The schema's own message is the rule. */
function unparsedUsers({ users }: SeedData): SeedDataProblem[] {
  return users.flatMap((user, index) =>
    user.malformed === undefined
      ? []
      : [
          {
            about: 'initialUser',
            user: identifyUser(user, index),
            problem: 'does not parse',
            rule: user.malformed
          }
        ]
  )
}

function brokenHierarchy({
  administrativeAreas,
  locations
}: SeedData): SeedDataProblem[] {
  const declaredAreas = new Set(administrativeAreas.map(({ id }) => id))

  return [
    ...unparentedNodes(
      administrativeAreas,
      'administrative area',
      declaredAreas
    ),
    ...unparentedNodes(locations, 'location', declaredAreas)
  ]
}

/** Every problem with a set of seed-data, in seed-data order. An empty list means
 * it is safe to write. */
export function validateSeedData(seedData: SeedData): SeedDataProblem[] {
  const problems = [
    ...unparsedLists(seedData),
    ...invalidPhoneNumberPattern(seedData),
    ...brokenHierarchy(seedData),
    ...unparsedRoles(seedData),
    ...duplicateRoleIds(seedData),
    ...missingConfigurationAdministrator(seedData),
    ...unparsedUsers(seedData),
    ...UNIQUE_USER_FIELDS.flatMap((uniqueField) =>
      duplicatesOf(seedData.users, uniqueField)
    ),
    ...unknownOffices(seedData),
    ...unknownRoles(seedData),
    ...misformattedMobileNumbers(seedData)
  ]

  // Stable, so two problems with one initial user keep their checked order.
  return problems.sort((a, b) => positionOf(a) - positionOf(b))
}

/** Problems about something other than an initial user sort to the front. */
function positionOf(problem: SeedDataProblem) {
  return problem.about === 'initialUser' ? problem.user.position : 0
}

function pluralise(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`
}

function renderProblem(problem: SeedDataProblem) {
  return (
    `  ${renderSubject(problem)}${renderOffending(problem)}` +
    `${problem.problem} — ${problem.rule}`
  )
}

/** The header ends `nothing was seeded` because validation runs before the
 * first write, so there is nothing for the operator to clear. */
export function formatValidationReport(
  problems: SeedDataProblem[],
  seedData: SeedData
): string {
  const header =
    `${pluralise(problems.length, 'problem', 'problems')} found in ` +
    `${pluralise(seedData.users.length, 'initial user', 'initial users')}; ` +
    `${NOTHING_WAS_SEEDED}`

  return [header, ...problems.map(renderProblem)].join('\n')
}

export function formatValidationSummary({
  users,
  administrativeAreas,
  locations
}: SeedData): string {
  return (
    `Seed-data validated: ` +
    `${pluralise(users.length, 'initial user', 'initial users')}, ` +
    `${pluralise(
      administrativeAreas.length,
      'administrative area',
      'administrative areas'
    )}, ` +
    `${pluralise(locations.length, 'location', 'locations')}. ` +
    `No problems found.`
  )
}

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
 * Pre-flight validation of a whole set of seed-data, before any of it is
 * written.
 *
 * `validateSeedData` is pure: seed-data in, a list of problems out. It reaches
 * for no network and no database, it does not exit, and it accumulates every
 * problem it finds rather than stopping at the first, so that an operator can
 * correct a spreadsheet in one editing pass instead of one problem per
 * attempt. Rendering the list and exiting belong to the caller — see
 * `./index.ts`, which validates between fetching the seed-data and the first
 * write.
 *
 * Everything the seed job has to say about a set of seed-data is said here,
 * including the five things that used to end the run where they were found: a
 * record that would not parse, a role list that would not parse, a role no
 * declared role matched, a duplicated role id, and the requirement that
 * somebody be able to configure the seeded system. Nothing about them was
 * special except that they were noticed early, and being noticed early is not
 * a reason to answer one operator with a stack trace and the next with a line
 * of prose. `./users.ts` now fetches and parses and judges nothing.
 *
 * Two decisions here look like oversights, and are not.
 *
 * **Why validation lives in the seed job rather than the country config.** The
 * country config owns the employees spreadsheet and is the only place that
 * knows row numbers, which makes it the obvious home. It is nonetheless the
 * wrong one: the country config template is a scaffold that each country forks
 * into a separate repository. It sits outside this workspace, is not
 * published, and is adopted once by copy — so validation added there would
 * never reach a country that has already forked it, and improvements to it
 * could only arrive by hand-merging. It also cannot see roles, locations, or
 * database state, which the cross-referential checks need. Validation
 * therefore lives in core, in the seed job, where every country receives it.
 *
 * **Why no problem cites a line number.** The consequence of the above,
 * accepted deliberately. The seed job receives seed-data as parsed objects
 * over HTTP, with no row provenance attached, so the only handle it has on a
 * record is its position in the array. That position is reported as
 * `record <N>` and is deliberately not called a line number: the job cannot
 * know that a country config serves its users from a file at all, so for a
 * config serving them from a database "line 44" would be a confident lie.
 * Restoring true line numbers would require a change to a forked template, and
 * so could not reach existing countries.
 */
import { EncodedScope, hasScope } from '@opencrvs/commons'
import { officeExternalId } from './office-external-id'

/**
 * What the validator needs of an initial user. Structural rather than imported
 * from `./users`, so that the checks state their own requirements and a test
 * can build a record without the fields it does not exercise.
 *
 * Every field is optional, including `username` and `primaryOfficeId`, which
 * the country config's schema in fact requires. A record that did not parse
 * still arrives here — see `malformed` — and may be missing anything at all,
 * so a check reads only what is there. Nothing is lost by that: a record
 * reaching this point missing a required field has already been reported as a
 * parse failure, and a check reporting its absence again would only say the
 * same thing twice.
 */
export interface SeedDataUser {
  username?: string
  email?: string
  mobile?: string
  /**
   * The country config's reference to the user's primary office — a compound
   * value, not the office's own id. See `./office-external-id`.
   */
  primaryOfficeId?: string
  /** The id of the role the country config gives the user. */
  role?: string
  /**
   * Why the country config's record did not parse, when it did not, as text.
   *
   * A record that did not parse still occupies its position in `users`, so
   * that every other record keeps the position the operator will find it at
   * and so that this problem is reported in record order with the rest. Only
   * the two fields that name and classify it are read back off a record that
   * failed — the username and the role, and each only when it is a string.
   * Everything else is left undefined rather than half-trusted: the value
   * checks then stand down for this record, which is right, because a record
   * that has to be rewritten anyway gains nothing from being told a second
   * thing about a value the schema has already rejected.
   */
  malformed?: string
}

/**
 * A role the country config declares, as the validator needs it: the id an
 * initial user names, and the scopes that decide what that user may do.
 */
export interface SeedDataRole {
  /**
   * The country config's own id for the role. Absent only for a role that did
   * not parse and carried no usable id.
   */
  id?: string
  scopes: EncodedScope[]
  /**
   * Why this role did not parse, when it did not, as text. Its scopes are then
   * empty and unknown rather than empty and known, which is why the check on
   * the `config.update-all` scope stands down when an initial user names it.
   */
  malformed?: string
}

/**
 * A node of the hierarchy — an administrative area or a location — as the
 * country config states it, before the seed assigns it an identifier of its
 * own.
 */
export interface SeedDataLocation {
  /**
   * The country config's own id for the node, which the seed writes as its
   * external id and which an office reference therefore resolves to.
   */
  id: string
  name: string
  /**
   * `Location/<id>` of the administrative area this node sits under, or
   * `Location/0` for one that sits at the root of the hierarchy.
   */
  partOf: string
}

/**
 * A whole set of seed-data, as fetched from the country config: the initial
 * users, the roles they are given, and the hierarchy in the two halves the
 * country config serves it in. A check reads only the part it needs.
 */
export interface SeedData {
  users: SeedDataUser[]
  roles: SeedDataRole[]
  /**
   * The regular expression the country config's application configuration
   * requires every mobile number to match, as text — the same pattern the
   * write path checks a mobile number against when it creates the user.
   *
   * Absent when a set of seed-data was assembled without one, and the format
   * check then stands down: there is nothing to check against, and no check
   * may invent a rule the country config never stated. A pattern that is
   * present but will not compile is a different thing entirely, and is
   * reported — see `invalidPhoneNumberPattern`.
   */
  PHONE_NUMBER_PATTERN?: string
  /**
   * Why the country config's initial users did not parse as a list at all,
   * when they did not. `users` is then empty — the document was unusable, so
   * there are no records to report against, and no record-level check has
   * anything to say.
   */
  malformedUserList?: string
  /**
   * Why the country config's roles did not parse as a list at all, when they
   * did not. `roles` is then empty, which is why the checks that read it stand
   * down: with no list, every role an initial user names would look unknown.
   */
  malformedRoleList?: string
  administrativeAreas: SeedDataLocation[]
  locations: SeedDataLocation[]
}

/**
 * The record a problem belongs to, as the operator will be told to find it.
 *
 * `position` is 1-based and is the record's place in the seed-data — see the
 * note above on why it is not a line number. Absent for a problem that is
 * about the set of seed-data as a whole rather than about one record.
 *
 * `username` is absent for a record that did not parse and carried no usable
 * one. The record is then named by its position alone, which is honest: the
 * alternative would be to invent a username the operator could not search for.
 */
export interface SeedDataRecord {
  position: number
  username?: string
}

/**
 * One problem with the seed-data, in the four parts an operator needs: which
 * record, which field, what value it held, and which rule that broke.
 */
export interface SeedDataProblem {
  record?: SeedDataRecord
  /**
   * What the problem is about when it is not about a user record — a location,
   * say, which has no username to be found by. Rendered where the record would
   * be, so that every line names the thing the operator has to go and edit.
   */
  subject?: string
  /**
   * The seed-data field at fault, named as the country config names it.
   * Absent when the problem is not about one field: a record that did not
   * parse may be wrong in several fields at once, or in none of them, and
   * naming one would be a guess.
   */
  field?: string
  /** The offending value. Absent when the field itself is missing. */
  value?: string
  /** What is wrong with the value, e.g. `duplicates record 12`. */
  problem: string
  /**
   * The rule that was broken, e.g. `emails must be unique`. For something that
   * did not parse this is the schema's own message, which states what a
   * well-formed value would have carried and so is the nearest thing to a rule
   * the seed job has for it.
   */
  rule: string
}

/**
 * A field whose values must be unique across the seed-data.
 *
 * `normalise` mirrors how the write path compares the field, so that the
 * pre-flight check and the write path agree on what a duplicate is: emails and
 * usernames are lowercased on write and so compare case-insensitively, while
 * mobile numbers are stored verbatim and so compare exactly. `+447911123456`
 * and `07911123456` are two different users by design.
 */
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

function identify(user: SeedDataUser, index: number): SeedDataRecord {
  return { position: index + 1, username: user.username }
}

/**
 * Every record that repeats a value an earlier record already used, reported
 * against the first record that used it — so an operator reading down the
 * report always has one place to compare against.
 */
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
      record: identify(user, index),
      field,
      value,
      problem: `duplicates record ${original}`,
      rule
    })
  })

  return problems
}

/**
 * Every initial user whose primary office no location in the seed-data
 * declares.
 *
 * The office is resolved against the seed-data rather than against the
 * database on purpose: the country config's statement of the hierarchy is the
 * authority on which offices the run will create, so checking it is both
 * earlier — before anything is written — and more accurate than asking a
 * database that has not been seeded yet. The write path's later lookup can
 * then treat a miss as an internal error.
 *
 * Only locations are offices. Administrative areas are written to a different
 * table from the one the write path resolves the office against, so naming one
 * as a primary office is a problem, not a match.
 */
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
      record: identify(user, index),
      field: 'primaryOfficeId',
      value: user.primaryOfficeId,
      problem: `resolves to office "${externalId}", which the seed-data does not declare`,
      rule: `an initial user's primary office must be a location the seed-data declares`
    })
  })

  return problems
}

/**
 * The id a node carries in `partOf` when it sits at the root of the hierarchy
 * and so has no parent. It names no declared administrative area, and is the
 * one value for which that is not a fault.
 */
const ROOT_ADMINISTRATIVE_AREA_ID = '0'

/**
 * Every node of the hierarchy whose `partOf` names an administrative area the
 * seed-data does not declare.
 *
 * One check covers both halves of the hierarchy because both obey one rule:
 * administrative areas nest inside administrative areas, and locations hang
 * off them, so in either case `partOf` must name a declared area or the root.
 * Note that a location may not be part of another location — only areas are
 * parents.
 *
 * A problem here has no record, because a location is not a user record and
 * has no position an operator could look up. It names the node instead, by the
 * two handles the country config gives them: the name and the id.
 */
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
      subject: `${kind} "${name}" (id ${id})`,
      field: 'partOf',
      value: partOf,
      problem: 'names no declared administrative area',
      rule: `partOf must name an administrative area the seed-data declares, or the root "${ROOT_ADMINISTRATIVE_AREA_ID}"`
    }))
}

/**
 * The two documents the country config serves that the seed job could not read
 * as a list at all.
 *
 * These used to end the run where they were found, and there is nothing else
 * to say about seed-data that could not be read — but saying it in the report
 * rather than through a bare `console.error` is what keeps one run to one
 * report, and keeps a parse failure rendered as text.
 */
function unparsedDocuments({
  malformedUserList,
  malformedRoleList
}: SeedData): SeedDataProblem[] {
  const problems: SeedDataProblem[] = []

  if (malformedUserList !== undefined) {
    problems.push({
      subject: `the country config's initial users`,
      problem: 'do not parse',
      rule: malformedUserList
    })
  }

  if (malformedRoleList !== undefined) {
    problems.push({
      subject: `the country config's roles`,
      problem: 'do not parse',
      rule: malformedRoleList
    })
  }

  return problems
}

/**
 * Every role the country config declares that did not parse.
 *
 * A role is named by its id where it kept one, and by its position in the role
 * list where it did not — the same honesty the record lines apply. It carries
 * no `record`, because a role is not a user record: it lives in the country
 * config's roles rather than in the employees spreadsheet, and an operator
 * looking for `record 3` there would find nothing.
 */
function unparsedRoles({ roles }: SeedData): SeedDataProblem[] {
  return roles.flatMap((role, index) =>
    role.malformed === undefined
      ? []
      : [
          {
            subject:
              role.id === undefined ? `role ${index + 1}` : `role "${role.id}"`,
            problem: 'does not parse',
            rule: role.malformed
          }
        ]
  )
}

/**
 * Every role id the country config declares more than once, reported once
 * however many times it repeats.
 *
 * A duplicate id is a property of the role list rather than of any one role,
 * so it carries no record. A role that did not parse still counts here: an id
 * it kept is an id it claims, whatever else is wrong with it.
 */
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
      subject: `the country config's roles`,
      field: 'id',
      value: id,
      problem: 'is declared more than once',
      rule: 'role ids must be unique'
    })
  }

  return problems
}

/** The ids the country config declares, including those of roles that did not
 * parse: such a role exists and is named, it merely cannot be read. */
function declaredRoleIds(roles: SeedDataRole[]): Map<string, SeedDataRole> {
  return new Map(
    roles.flatMap((role) => (role.id === undefined ? [] : [[role.id, role]]))
  )
}

/**
 * Every initial user whose role no declared role matches.
 *
 * Stands down when the role list itself did not parse: with no list to compare
 * against, every user would be reported, and none of it would be news beyond
 * what the unreadable list already says.
 */
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
            record: identify(user, index),
            field: 'role',
            value: user.role,
            problem: 'names no role the country config declares',
            rule: `an initial user's role must be one of the roles the country config declares`
          }
        ]
  )
}

/**
 * The configured pattern as a regular expression, or `undefined` when it is
 * not one — which is the only two answers there are, and the reason the two
 * checks below can each ask for themselves rather than share state.
 */
function compilePattern(pattern: string): RegExp | undefined {
  try {
    return new RegExp(pattern)
  } catch {
    return undefined
  }
}

/**
 * The country config's configured phone number pattern, when it is not a
 * regular expression at all.
 *
 * The service that creates a user compiles this same pattern, and where it
 * will not compile it logs and carries on — so a typo in one line of a
 * country's application configuration silently costs it every mobile number
 * check it believes it has. Here it is a problem in its own right, because an
 * operator would far rather be told that their rule is unreadable than be told
 * nothing and be left to discover, at some later date, that nothing was ever
 * checked.
 *
 * It carries no record. No initial user is at fault, and the fix is in the
 * country config's application configuration rather than in the spreadsheet.
 */
function invalidPhoneNumberPattern({
  PHONE_NUMBER_PATTERN
}: SeedData): SeedDataProblem[] {
  if (
    PHONE_NUMBER_PATTERN === undefined ||
    compilePattern(PHONE_NUMBER_PATTERN) !== undefined
  ) {
    return []
  }

  return [
    {
      subject: `the country config's application configuration`,
      field: 'PHONE_NUMBER_PATTERN',
      value: PHONE_NUMBER_PATTERN,
      problem: 'is not a valid regular expression',
      rule: 'a configured phone number pattern must be a valid regular expression'
    }
  ]
}

/**
 * Every initial user whose mobile number the country config's configured
 * pattern rejects.
 *
 * The same check the write path performs, asked early enough to be worth
 * something: today a badly formatted number is caught when its record reaches
 * the service, halfway through a run, with the hierarchy and every earlier
 * initial user already in the database.
 *
 * It stands down when the pattern will not compile, and that is not the
 * service's silent skip. Every number fails against a pattern that cannot be
 * read, so reporting all of them would bury the one real problem under
 * fifty-five invented ones — while the pattern itself is reported by the check
 * above, so validation still fails and nothing is written. The operator is
 * told "your pattern is unreadable" rather than "all of your phone numbers are
 * wrong", which of the two is the true statement.
 */
function misformattedMobileNumbers({
  users,
  PHONE_NUMBER_PATTERN
}: SeedData): SeedDataProblem[] {
  const pattern =
    PHONE_NUMBER_PATTERN === undefined
      ? undefined
      : compilePattern(PHONE_NUMBER_PATTERN)

  if (pattern === undefined) {
    return []
  }

  return users.flatMap((user, index) =>
    user.mobile === undefined || pattern.test(user.mobile)
      ? []
      : [
          {
            record: identify(user, index),
            field: 'mobile',
            value: user.mobile,
            problem: `does not match the configured pattern ${PHONE_NUMBER_PATTERN}`,
            rule: `an initial user's mobile number must match the country config's PHONE_NUMBER_PATTERN`
          }
        ]
  )
}

/** The scope without which nobody could configure the system once it is
 * seeded, so that a seed producing no holder of it has produced a system its
 * operator cannot administer. */
const CONFIGURE_SCOPE = 'config.update-all'

/**
 * Whether the seed-data creates anybody able to configure the system, reported
 * against the initial users as a set rather than against any one of them: no
 * single record is at fault, and the operator's fix is to give one of them a
 * role that carries the scope.
 *
 * The check stands down in the three cases where it cannot know the answer:
 * when the role list did not parse; when no record names a role at all, which
 * after parsing can only mean there are no records left to read one from; and
 * when an initial user names a role that did not parse, since that role's
 * scopes might have been the ones in question. A role a user names that is
 * *not declared at all* does not stand it down — an undeclared role grants
 * nothing, so the answer is known.
 */
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
          subject: 'the initial users',
          problem: 'include nobody who could configure the system',
          rule: `at least one initial user must carry a role with the "${CONFIGURE_SCOPE}" scope`
        }
      ]
}

/**
 * Every initial user record the country config's schema rejected.
 *
 * The schema's own message is the rule: it already states what a well-formed
 * record would have carried, and the seed job has nothing more specific to add.
 * It is text rather than the error it came from, which is the whole point of
 * folding this check in — an operator with a typo'd record used to get a stack
 * trace where an operator with a duplicate email got a line of prose.
 */
function unparsedRecords({ users }: SeedData): SeedDataProblem[] {
  return users.flatMap((user, index) =>
    user.malformed === undefined
      ? []
      : [
          {
            record: identify(user, index),
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

/**
 * Every problem with a set of seed-data, in the order an operator will read
 * the records: by record, and within a record in the order the fields are
 * checked. Problems about the seed-data as a whole carry no record and are
 * listed first.
 *
 * An empty list means the seed-data is safe to write.
 */
export function validateSeedData(seedData: SeedData): SeedDataProblem[] {
  // Set-level families first, then the record-level ones, which is the order
  // the sort below will put them in anyway. A new check family joins the list
  // it belongs to; nothing else has to change, because each family reads the
  // part of the seed-data it needs and the sort places its problems.
  const problems = [
    ...unparsedDocuments(seedData),
    ...invalidPhoneNumberPattern(seedData),
    ...brokenHierarchy(seedData),
    ...unparsedRoles(seedData),
    ...duplicateRoleIds(seedData),
    ...missingConfigurationAdministrator(seedData),
    ...unparsedRecords(seedData),
    ...UNIQUE_USER_FIELDS.flatMap((uniqueField) =>
      duplicatesOf(seedData.users, uniqueField)
    ),
    ...unknownOffices(seedData),
    ...unknownRoles(seedData),
    ...misformattedMobileNumbers(seedData)
  ]

  // A stable sort, so that two problems with one record stay in the order the
  // fields were checked in rather than swapping between runs.
  return problems.sort(
    (a, b) => (a.record?.position ?? 0) - (b.record?.position ?? 0)
  )
}

function pluralise(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`
}

/** What the problem is about, as the operator will be told to find it. */
function renderSubject({ record, subject }: SeedDataProblem) {
  if (record) {
    return record.username === undefined
      ? `record ${record.position}: `
      : `record ${record.position} (${record.username}): `
  }

  return subject ? `${subject}: ` : ''
}

/** The field and value the problem is about, where it is about one, as the
 * grammatical subject of what follows it. */
function renderOffending({ field, value }: SeedDataProblem) {
  if (field === undefined) {
    return ''
  }

  return value === undefined ? `${field} ` : `${field} "${value}" `
}

function renderProblem(problem: SeedDataProblem) {
  return (
    `  ${renderSubject(problem)}${renderOffending(problem)}` +
    `${problem.problem} — ${problem.rule}`
  )
}

/**
 * The report an operator sees when validation fails: a count header, then one
 * line per problem in record order.
 *
 * The header ends `nothing was seeded`, and that phrase is load-bearing.
 * Validation runs before the first write, so a failure here leaves the
 * database untouched; telling an operator to clear a database that was never
 * written to would send them to destroy a clean system for no reason. The
 * report for a failure *after* writing has begun says the opposite, and says
 * it differently.
 */
export function formatValidationReport(
  problems: SeedDataProblem[],
  seedData: SeedData
): string {
  const header =
    `${pluralise(problems.length, 'problem', 'problems')} found in ` +
    `${pluralise(seedData.users.length, 'user record', 'user records')}; ` +
    `nothing was seeded.`

  return [header, ...problems.map(renderProblem)].join('\n')
}

/**
 * The single line an operator sees when validation passes, so that they can
 * see the job read the seed-data they expected it to read.
 *
 * The hierarchy is counted in the two halves the country config serves it in
 * rather than as one number, because that is how the operator holds it too:
 * a total covering both would be a figure they could not check against
 * anything.
 */
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

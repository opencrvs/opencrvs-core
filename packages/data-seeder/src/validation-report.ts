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
import { getParsedUsers, UniqueUserField } from './users'
import { parsedRoles } from './roles'
import { parsedPlaces, PlaceKind, ROOT_ADMINISTRATIVE_AREA_ID } from './locations'
import { SeedProblem, SeedSources } from './seed-data'
import {
  NOTHING_WAS_SEEDED,
  Offending,
  renderOffending,
  renderSubject,
  SeedSubject
} from './seed-report'

/**
 * The order a report prints problems of one subject in. Problems about the
 * seed-data as a whole come first, then the hierarchy, then the roles, and
 * finally the initial users — who are printed in seed-data order, so this only
 * decides the order of two problems about one initial user.
 */
const ORDER: SeedProblem['kind'][] = [
  'userListUnparsed',
  'roleListUnparsed',
  'applicationConfigUnparsed',
  'invalidPhoneNumberPattern',
  'noConfigurationAdministrator',
  'hierarchyUnparsed',
  'unparentedNode',
  'roleUnparsed',
  'duplicateRoleId',
  'duplicateUserField',
  'unknownOffice',
  'unknownRole',
  'mobileDoesNotMatchPattern',
  'userUnparsed'
]

const UNIQUENESS_RULE: Record<UniqueUserField, string> = {
  email: 'emails must be unique',
  mobile: 'mobile numbers must be unique',
  username: 'usernames must be unique'
}

const PLACE: Record<PlaceKind, string> = {
  administrativeArea: 'administrative area',
  location: 'location'
}

const COUNTRY_CONFIG_USERS = `the country config's initial users`
const COUNTRY_CONFIG_ROLES = `the country config's roles`
const COUNTRY_CONFIG_APPLICATION = `the country config's application configuration`
const COUNTRY_CONFIG_HIERARCHY = `the country config's administrative hierarchy`

/** One problem, said in full: what it is about, which field offends where
 * there is one, what is wrong, and the rule that makes it wrong. */
interface Rendered {
  subject: SeedSubject
  offending?: Offending
  problem: string
  rule: string
}

function named(subject: string): SeedSubject {
  return { about: 'subject', subject }
}

function render(problem: SeedProblem): Rendered {
  switch (problem.kind) {
    case 'userListUnparsed':
      return {
        subject: named(COUNTRY_CONFIG_USERS),
        problem: 'do not parse',
        rule: problem.message
      }

    case 'userUnparsed':
      return {
        subject: { about: 'initialUser', user: problem.user },
        problem: 'does not parse',
        rule: problem.message
      }

    case 'duplicateUserField':
      return {
        subject: { about: 'initialUser', user: problem.user },
        offending: { field: problem.field, value: problem.value },
        problem: `duplicates initial user ${problem.firstSeenAt}`,
        rule: UNIQUENESS_RULE[problem.field]
      }

    case 'roleListUnparsed':
      return {
        subject: named(COUNTRY_CONFIG_ROLES),
        problem: 'do not parse',
        rule: problem.message
      }

    case 'roleUnparsed':
      return {
        subject: named(
          problem.role.id === undefined
            ? `role ${problem.role.position}`
            : `role "${problem.role.id}"`
        ),
        problem: 'does not parse',
        rule: problem.message
      }

    case 'duplicateRoleId':
      return {
        subject: named(COUNTRY_CONFIG_ROLES),
        offending: { field: 'id', value: problem.id },
        problem: 'is declared more than once',
        rule: 'role ids must be unique'
      }

    case 'hierarchyUnparsed':
      return {
        subject: named(COUNTRY_CONFIG_HIERARCHY),
        problem: 'does not parse',
        rule: problem.message
      }

    case 'unparentedNode':
      return {
        subject: named(
          `${PLACE[problem.node.place]} "${problem.node.name}" (id ${problem.node.id})`
        ),
        offending: { field: 'partOf', value: problem.partOf },
        problem: 'names no declared administrative area',
        rule: `partOf must name an administrative area the seed-data declares, or the root "${ROOT_ADMINISTRATIVE_AREA_ID}"`
      }

    case 'applicationConfigUnparsed':
      return {
        subject: named(COUNTRY_CONFIG_APPLICATION),
        problem: 'does not parse',
        rule: problem.message
      }

    case 'invalidPhoneNumberPattern':
      return {
        subject: named(COUNTRY_CONFIG_APPLICATION),
        offending: { field: 'PHONE_NUMBER_PATTERN', value: problem.pattern },
        problem: 'is not a valid regular expression',
        rule: 'a configured phone number pattern must be a valid regular expression'
      }

    case 'unknownOffice':
      return {
        subject: { about: 'initialUser', user: problem.user },
        offending: {
          field: 'primaryOfficeId',
          value: problem.primaryOfficeId
        },
        problem: `resolves to office "${problem.externalId}", which the seed-data does not declare`,
        rule: `an initial user's primary office must be a location the seed-data declares`
      }

    case 'unknownRole':
      return {
        subject: { about: 'initialUser', user: problem.user },
        offending: { field: 'role', value: problem.role },
        problem: 'names no role the country config declares',
        rule: `an initial user's role must be one of the roles the country config declares`
      }

    case 'mobileDoesNotMatchPattern':
      return {
        subject: { about: 'initialUser', user: problem.user },
        offending: { field: 'mobile', value: problem.mobile },
        problem: `does not match the configured pattern ${problem.pattern}`,
        rule: `an initial user's mobile number must match the country config's PHONE_NUMBER_PATTERN`
      }

    case 'noConfigurationAdministrator':
      return {
        subject: named('the initial users'),
        problem: 'include nobody who could configure the system',
        rule: `at least one initial user must carry a role with the "${problem.scope}" scope`
      }
  }
}

/** Problems about something other than an initial user sort to the front. */
function positionOf(problem: SeedProblem): number {
  return 'user' in problem ? problem.user.position : 0
}

function rankOf(problem: SeedProblem): number {
  return ORDER.indexOf(problem.kind)
}

/** In seed-data order. The sort is stable, so two problems of one kind about
 * one initial user keep the order the check found them in. */
function ordered(problems: SeedProblem[]): SeedProblem[] {
  return [...problems].sort(
    (a, b) => positionOf(a) - positionOf(b) || rankOf(a) - rankOf(b)
  )
}

function pluralise(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`
}

function renderProblem(problem: SeedProblem) {
  const rendered = render(problem)

  return (
    `${renderSubject(rendered.subject)}` +
    `${renderOffending(rendered.offending ?? {})}` +
    `${rendered.problem} — ${rendered.rule}`
  )
}

/** The header ends `nothing was seeded` because validation runs before the
 * first write, so there is nothing for the operator to clear. It counts the
 * problems alone: a problem may be about a role or a location as readily as
 * about an initial user, so naming one of those sets would misdescribe it. */
export function formatValidationReport(problems: SeedProblem[]): string {
  const header = `${pluralise(
    problems.length,
    'problem',
    'problems'
  )} found; ${NOTHING_WAS_SEEDED}`

  return [
    header,
    ...ordered(problems).map((problem) => `  ${renderProblem(problem)}`)
  ].join('\n')
}

export function formatValidationSummary(sources: SeedSources): string {
  const { administrativeAreas, locations } = parsedPlaces(sources.locations)

  return (
    `Seed-data validated: ` +
    `${pluralise(
      getParsedUsers(sources.users).length,
      'initial user',
      'initial users'
    )}, ` +
    `${pluralise(parsedRoles(sources.roles).length, 'role', 'roles')}, ` +
    `${pluralise(
      administrativeAreas.length,
      'administrative area',
      'administrative areas'
    )}, ` +
    `${pluralise(locations.length, 'location', 'locations')}. ` +
    `No problems found.`
  )
}

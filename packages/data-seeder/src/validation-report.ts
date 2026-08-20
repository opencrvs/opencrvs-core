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
import { SeedData, SeedDataProblem } from './seed-data'
import {
  NOTHING_WAS_SEEDED,
  renderOffending,
  renderSubject
} from './seed-report'

function pluralise(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`
}

function renderProblem(problem: SeedDataProblem) {
  return (
    `${renderSubject(problem)}${renderOffending(problem)}` +
    `${problem.problem} — ${problem.rule}`
  )
}

/** The header ends `nothing was seeded` because validation runs before the
 * first write, so there is nothing for the operator to clear. It counts the
 * problems alone: a problem may be about a role or a location as readily as
 * about an initial user, so naming one of those sets would misdescribe it. */
export function formatValidationReport(problems: SeedDataProblem[]): string {
  const header = `${pluralise(
    problems.length,
    'problem',
    'problems'
  )} found; ${NOTHING_WAS_SEEDED}`

  return [
    header,
    ...problems.map((problem) => `  ${renderProblem(problem)}`)
  ].join('\n')
}

export function formatValidationSummary({
  users,
  roles,
  administrativeAreas,
  locations
}: SeedData): string {
  return (
    `Seed-data validated: ` +
    `${pluralise(users.length, 'initial user', 'initial users')}, ` +
    `${pluralise(roles.length, 'role', 'roles')}, ` +
    `${pluralise(
      administrativeAreas.length,
      'administrative area',
      'administrative areas'
    )}, ` +
    `${pluralise(locations.length, 'location', 'locations')}. ` +
    `No problems found.`
  )
}

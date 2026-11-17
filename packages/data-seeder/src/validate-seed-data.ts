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
import { hasScope } from '@opencrvs/commons'
import { getPhoneNumberPattern } from './application-config'
import { getDeclaredOffices } from './locations'
import { getOfficeExternalId } from './utils'
import { problemsOf } from './read'
import { DeclaredRole, getDeclaredRoles } from './roles'
import { CrossCuttingProblem, SeedProblem, SeedSources } from './seed-data'
import { CheckedUser, identifyUser, getParsedUsers } from './users'

/** Without a holder of this scope, the seeded system cannot be administered. */
const CONFIGURE_SCOPE = 'config.update-all'

/** Offices are resolved against the seed-data, not the database, which has not
 * been seeded yet. */
function unknownOffices(
  users: CheckedUser[],
  offices: Set<string>
): CrossCuttingProblem[] {
  return users.flatMap((user) => {
    const externalId = getOfficeExternalId(user.primaryOfficeId)

    return offices.has(externalId)
      ? []
      : [
          {
            kind: 'unknownOffice' as const,
            user: identifyUser(user),
            primaryOfficeId: user.primaryOfficeId,
            externalId
          }
        ]
  })
}

function unknownRoles(
  users: CheckedUser[],
  declared: Map<string, DeclaredRole>
): CrossCuttingProblem[] {
  return users.flatMap((user) =>
    declared.has(user.role)
      ? []
      : [{ kind: 'unknownRole' as const, user: identifyUser(user), role: user.role }]
  )
}

/**
 * Stands down where the answer cannot be known: a named role did not parse and
 * its scopes might have been the ones in question. An undeclared role grants
 * nothing, so it does not stand the check down.
 */
function missingConfigurationAdministrator(
  users: CheckedUser[],
  declared: Map<string, DeclaredRole>
): CrossCuttingProblem[] {
  if (users.length === 0) {
    return []
  }

  let unreadable = false

  for (const user of users) {
    const role = declared.get(user.role)

    if (role === undefined) {
      continue
    }

    if (role.scopes === undefined) {
      unreadable = true
      continue
    }

    if (hasScope(role.scopes, CONFIGURE_SCOPE)) {
      return []
    }
  }

  return unreadable
    ? []
    : [{ kind: 'noConfigurationAdministrator', scope: CONFIGURE_SCOPE }]
}

function misformattedMobileNumbers(
  users: CheckedUser[],
  pattern: { source: string; expression: RegExp }
): CrossCuttingProblem[] {
  return users.flatMap((user) =>
    user.mobile === undefined || pattern.expression.test(user.mobile)
      ? []
      : [
          {
            kind: 'mobileDoesNotMatchPattern' as const,
            user: identifyUser(user),
            mobile: user.mobile,
            pattern: pattern.source
          }
        ]
  )
}

/**
 * Every problem with a set of seed-data. An empty list means it is safe to
 * write.
 *
 * Each module's own problems come as it found them. The cross-cutting checks
 * then run over what parsed — an entry that did not is absent from it, so one
 * unreadable initial user costs the report only itself rather than every check
 * that would have read it.
 *
 * Ordering is not decided here: `formatValidationReport` sorts, so the order
 * these are gathered in is free to follow the gates instead of the report.
 */
export function validateSeedData(sources: SeedSources): SeedProblem[] {
  const { users, roles, locations, applicationConfig } = sources

  const problems: SeedProblem[] = [
    ...problemsOf(users),
    ...problemsOf(roles),
    ...problemsOf(locations),
    ...problemsOf(applicationConfig)
  ]

  const initialUsers = getParsedUsers(users)

  if (locations.readable) {
    problems.push(...unknownOffices(initialUsers, getDeclaredOffices(locations)))
  }

  if (roles.readable) {
    const declared = getDeclaredRoles(roles)

    problems.push(
      ...unknownRoles(initialUsers, declared),
      ...missingConfigurationAdministrator(initialUsers, declared)
    )
  }

  const pattern = getPhoneNumberPattern(applicationConfig)

  if (pattern !== undefined) {
    problems.push(...misformattedMobileNumbers(initialUsers, pattern))
  }

  return problems
}

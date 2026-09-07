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
/* eslint-disable no-console */
import { bold, dim, green, yellow } from 'kleur/colors'
import { DEFAULT_TARGET_URL, line, resolveBaseUrl } from './endpoints'

const REQUEST_TIMEOUT_MS = 15000

/**
 * Scopes this release added, which guard features that ship whether or not a
 * country config assigns them.
 *
 * A missing scope is the quietest kind of upgrade miss: the country config
 * compiles, the deployment comes up healthy, and the feature is simply absent
 * from every role — there is no error anywhere to notice. Adding a scope here
 * whenever a release introduces one is what makes it noticeable.
 */
const SCOPES_ADDED_THIS_RELEASE: readonly {
  scope: string
  guards: string
}[] = [
  {
    scope: 'record.unarchive',
    guards:
      'the new UNARCHIVE action. Without it no role can restore an archived record, including roles that hold record.archive.'
  },
  {
    scope: 'location.edit',
    guards:
      'the location and administrative area write API (create, update, withdrawVersion).'
  },
  {
    scope: 'integration.audit.read',
    guards:
      "reading a system client's audit log via the integrations.audit endpoint."
  }
]

interface Role {
  id: string
  scopes: string[]
}

/**
 * The scope type out of one encoded scope.
 *
 * Scopes arrive from `/config/roles` in the query-string form `encodeScope`
 * produces — `type=record.unarchive`, or `type=record.read&event[]=birth` once
 * options are involved — so the type has to be read out of the `type` pair
 * rather than matched against the whole string.
 */
function scopeType(encoded: string): string | undefined {
  for (const pair of encoded.split('&')) {
    const [key, value] = pair.split('=')
    if (key === 'type') {
      return value
    }
  }
  return undefined
}

async function fetchRoles(baseUrl: string): Promise<Role[] | undefined> {
  try {
    const response = await fetch(`${baseUrl}/config/roles`, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
    })

    if (!response.ok) {
      return undefined
    }

    const body: unknown = await response.json()

    if (!Array.isArray(body)) {
      return undefined
    }

    return body.filter(
      (role): role is Role =>
        typeof role === 'object' &&
        role !== null &&
        Array.isArray((role as Role).scopes)
    )
  } catch {
    return undefined
  }
}

/**
 * Checks the country config assigns the scopes this release added to at least
 * one role.
 *
 * Deliberately "at least one role" and not more: which roles should hold a
 * scope is the country's own policy, and this cannot know it. Assigning a scope
 * to nobody, on the other hand, is almost always an upgrade that was missed
 * rather than a decision.
 *
 * @returns the number of failed checks.
 */
export async function runVerifyScopes(
  target: string = DEFAULT_TARGET_URL
): Promise<number> {
  const baseUrl = resolveBaseUrl(target)

  console.log(bold(`Scopes added in this release, at ${baseUrl}\n`))

  const roles = await fetchRoles(baseUrl)

  if (!roles) {
    console.log(
      '  ' +
        yellow(
          'Could not read /config/roles, so the new scopes could not be checked.'
        )
    )
    return 1
  }

  let failures = 0

  for (const { scope, guards } of SCOPES_ADDED_THIS_RELEASE) {
    const holders = roles.filter((role) =>
      role.scopes.some((encoded) => scopeType(encoded) === scope)
    )

    if (holders.length === 0) {
      failures++
      console.log(line(false, scope, `held by no role — guards ${guards}`))
      continue
    }

    const named = holders
      .map((role) => role.id)
      .slice(0, 3)
      .join(', ')
    const more = holders.length > 3 ? `, +${holders.length - 3} more` : ''
    console.log(
      line(true, scope, `${holders.length} role(s)${dim(`: ${named}${more}`)}`)
    )
  }

  console.log()

  if (failures === 0) {
    console.log(green(bold('✓ Every scope added this release is assigned.')))
  }

  return failures
}

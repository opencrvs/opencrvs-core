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

import * as z from 'zod/v4'
import * as qs from 'qs'
import {
  ConfigurableScopeType,
  parseConfigurableScope,
  parseLiteralScope
} from './authentication'

/*
 * V2 file will be unified with the scopes during 2.0 development.
 * We separate scope changes to phases in order to not block other development.
 */

const JurisdictionFilter = z
  .enum(['administrativeArea', 'location', 'all'])
  .describe(
    'Filters based on user jurisdiction relative to their office location in hierarchy.'
  )
const UserFilter = z
  .enum(['user'])
  .describe('Filters based on the user. Limits to self.')

const RecordAction = z.enum([
  'recoed.search',
  'record.create',
  'record.read',
  'record.declare',
  'record.notify',
  'record.validate',
  'record.reject',
  'record.archive',
  'record.review-duplicates',
  'record.register',
  'record.print-certified-copies',
  'record.request-correction',
  'record.correct',
  'record.unassign-others'
])

const RecordScope = z
  .object({
    type: RecordAction,
    options: z
      .object({
        event: z.array(z.string()).describe('Event type, e.g. birth, death'),
        eventLocation: JurisdictionFilter.optional(),
        declaredIn: JurisdictionFilter.optional(),
        declaredBy: UserFilter.optional(),
        registeredIn: JurisdictionFilter.optional(),
        registeredBy: UserFilter.optional()
      })
      .describe(
        'Limits access to records using provided filters. Combined as "AND". Use multiple scopes for "OR" behavior.'
      )
  })
  .describe(
    "Scopes used to check user's permission to perform actions on a record."
  )

export type RecordScope = z.infer<typeof RecordScope>

/**
 * Generic scope structure that can represent any scope.
 * Used for encoding/decoding scopes to/from strings.
 * We can then later refine to more specific scope types as needed.
 */
const AnyScope = z.object({
  type: z.string(),
  options: z.record(z.string(), z.string().or(z.array(z.string()))).optional()
})
type AnyScope = z.infer<typeof AnyScope>

const flattenScope = (scope: AnyScope) => ({
  type: scope.type,
  ...scope.options
})

const unflattenScope = (input: Record<string, unknown>) => {
  const { type, ...options } = input
  return { type, options }
}

export const encodeScope = (scope: AnyScope): string => {
  const flattened = flattenScope(scope)

  return qs.stringify(flattened, {
    arrayFormat: 'comma',
    allowDots: true,
    addQueryPrefix: false,
    encode: false
  })
}

export const decodeScope = (query: string) => {
  const scope = qs.parse(query, {
    ignoreQueryPrefix: true,
    comma: true,
    allowDots: true
  })

  const unflattenedScope = unflattenScope(scope)
  return AnyScope.parse(unflattenedScope)
}

type LegacyScopeType = ConfigurableScopeType

/**
 * Mapping of V1 scope types to V2 scope types.
 *
 * Unifies the naming structure by dropping the status from the string.
 * This is done in order to more easily represent the scopes in human-readable formant, and to match better with the system actions.
 */
const v1ToV2ConfigScopeTypeMap: Record<LegacyScopeType, string> = {
  search: 'record.search',
  workqueue: 'workqueue',
  'user.create': 'user.create',
  'user.edit': 'user.edit',
  'record.create': 'record.create',
  'record.read': 'record.read',
  'record.declare': 'record.declare',
  'record.notify': 'record.notify',
  'record.register': 'record.register',
  'record.unassign-others': 'record.unassign-others',
  'record.declared.validate': 'record.validate',
  'record.declared.reject': 'record.reject',
  'record.declared.archive': 'record.archive',
  'record.declared.review-duplicates': 'record.review-duplicates',
  'record.registered.print-certified-copies': 'record.print-certified-copies',
  'record.registered.request-correction': 'record.request-correction',
  'record.registered.correct': 'record.correct',
  'record.custom-action': 'record.custom-action'
}

/**
 * Converts a V1 scope string to a V2 compatible scope string. Used to migrate between 1.9 and 2.0 scopes.
 *
 * @param v1Scope e.g. 'record.declared.reject[event=birth|death|tennis-club-membership]',
 * @returns corresponding V2 compatible scope string based on v1 input.
 */
export const v1ScopeToV2Scope = (v1Scope: string) => {
  const configurableV1Scope = parseConfigurableScope(v1Scope)
  const literalV1Scope = parseLiteralScope(v1Scope)

  if (!configurableV1Scope && !literalV1Scope) {
    throw new Error(`Invalid V1 scope: ${v1Scope}`)
  }

  if (literalV1Scope) {
    return encodeScope(literalV1Scope)
  }

  if (configurableV1Scope) {
    const type = v1ToV2ConfigScopeTypeMap[configurableV1Scope.type]

    if (type === undefined) {
      throw new Error(`Unsupported V1 scope type: ${configurableV1Scope.type}`)
    }

    if (configurableV1Scope.type === 'search') {
      return encodeScope({
        type,
        options: {
          event: configurableV1Scope.options.event[0] || [],
          access:
            configurableV1Scope.options.access[0] === 'my-jurisdiction'
              ? 'administrativeArea'
              : 'all'
        }
      })
    }

    return encodeScope({
      type,
      options: configurableV1Scope.options
    })
  }
  throw new Error(`Unsupported V1 scope type: ${v1Scope}`)
}

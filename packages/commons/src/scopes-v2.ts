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
import {
  ConfigurableScopeType,
  decodeScope,
  encodeScope,
  parseConfigurableScope,
  parseLiteralScope
} from './scopes'
import { UUID } from './uuid'
import { ActionType } from './client'

/*
 * V2 file will be unified with the scopes during 2.0 development.
 * We separate scope changes to phases in order to not block other development.
 */

export const JurisdictionFilter = z
  .enum(['administrativeArea', 'location', 'all'])
  .describe(
    'Filters based on user jurisdiction relative to their office location in hierarchy.'
  )
export type JurisdictionFilter = z.infer<typeof JurisdictionFilter>

export const UserFilter = z
  .enum(['user'])
  .describe('Filters based on the user. Limits to self.')
export type UserFilter = z.infer<typeof UserFilter>

export const RecordAction = z.enum([
  'record.search',
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

export const ActionToScopeTypeMap: Partial<Record<ActionType, string>> = {
  [ActionType.CREATE]: 'record.create',
  [ActionType.READ]: 'record.read',
  [ActionType.DECLARE]: 'record.declare',
  [ActionType.NOTIFY]: 'record.notify',
  [ActionType.REJECT]: 'record.reject',
  [ActionType.ARCHIVE]: 'record.archive',
  [ActionType.REGISTER]: 'record.register',
  [ActionType.REQUEST_CORRECTION]: 'record.request-correction',
  [ActionType.APPROVE_CORRECTION]: 'record.correct',
  [ActionType.REJECT_CORRECTION]: 'record.correct',
  [ActionType.EDIT]: 'record.edit',
  [ActionType.CUSTOM]: 'record.custom-action',
  [ActionType.PRINT_CERTIFICATE]: 'record.print-certified-copies'
}

export const ResolvedRecordScopeV2 = z
  .object({
    type: RecordAction,
    options: z.object({
      event: z
        .array(z.string())
        .describe('Event type, e.g. birth, death')
        .optional(),
      eventLocation: UUID.nullish(),
      declaredIn: UUID.nullish(),
      declaredBy: z.string().or(z.undefined()).optional(),
      registeredIn: UUID.nullish(),
      registeredBy: z.string().or(z.undefined()).optional()
    })
  })
  .describe('Resolved scope with location/user IDs instead of filters.')

export type ResolvedRecordScopeV2 = z.infer<typeof ResolvedRecordScopeV2>

export const RecordScopeV2 = z
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

export type RecordScopeV2 = z.infer<typeof RecordScopeV2>
export type RecordScopeV2Options = z.infer<typeof RecordScopeV2>['options']

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
  'record.declared.reject': 'record.reject',
  'record.declared.archive': 'record.archive',
  'record.declared.review-duplicates': 'record.review-duplicates',
  'record.registered.print-certified-copies': 'record.print-certified-copies',
  'record.registered.request-correction': 'record.request-correction',
  'record.registered.correct': 'record.correct',
  'record.custom-action': 'record.custom-action',
  'record.declared.edit': 'record.edit'
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

export const findV2Scope = (scopes: string[], type: string) => {
  return scopes
    .map((scope) => decodeScope(scope))
    .find((scope) => scope?.type === type)
}

export const getV2Workqueues = (scopes: string[]) => {
  return findV2Scope(scopes, 'workqueue')?.options?.id ?? []
}

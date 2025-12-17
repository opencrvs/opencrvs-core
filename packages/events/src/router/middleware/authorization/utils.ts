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
import { intersection } from 'lodash'
import {
  getScopes,
  AnyScope,
  decodeScope,
  ResolvedRecordScopeV2,
  getMixedPath
} from '@opencrvs/commons'
import { EventIndexWithLocationHierarchy } from '../../../service/indexing/utils'

const scopeToEventStateMap = {
  event: 'type',
  eventLocation: 'createdAtLocation',
  declaredIn: 'legalStatuses.DECLARED.createdAtLocation',
  registeredIn: 'legalStatuses.REGISTERED.createdAtLocation',
  declaredBy: 'legalStatuses.DECLARED.createdBy',
  registeredBy: 'legalStatuses.REGISTERED.createdBy'
} as const

type Options = ResolvedRecordScopeV2['options']

type ScopesAsEventState = {
  [K in keyof typeof scopeToEventStateMap as (typeof scopeToEventStateMap)[K]]?: Options[K]
}

/**
 * Given scope, transform its options into criteria that can be matched against event state fields.
 */
function transformScopeToEventStateCriteria(
  scope: ResolvedRecordScopeV2
): ScopesAsEventState {
  const keys = Object.keys(
    scopeToEventStateMap
  ) as (keyof typeof scopeToEventStateMap)[]

  const eventStateCriteria = keys.reduce<ScopesAsEventState>((acc, key) => {
    const value = scope.options[key]
    // @todo: check if null is meaningful
    if (!value) {
      return acc
    }

    const esField = scopeToEventStateMap[key]

    switch (key) {
      case 'event':
      case 'eventLocation':
      case 'declaredIn':
      case 'registeredIn':
      case 'declaredBy':
      case 'registeredBy':
        return {
          ...acc,
          [esField]: value
        }

      default: {
        throw new Error(`Unhandled option key: ${key}`)
      }
    }
  }, {})

  return eventStateCriteria
}

/**
 * Given indexed event and resolved scope, determine if the scope allows access to the event.
 */
function canAccessEventWithScope(
  event: Partial<EventIndexWithLocationHierarchy>,
  scope: ResolvedRecordScopeV2
) {
  const eventStateCriteria = transformScopeToEventStateCriteria(scope)
  return Object.entries(eventStateCriteria).every(([field, value]) => {
    const actualEventValue = getMixedPath(event, field)

    if (!actualEventValue) {
      return false
    }

    if (Array.isArray(value)) {
      return intersection(value, [actualEventValue]).length > 0
    }

    if (Array.isArray(actualEventValue)) {
      return actualEventValue.includes(value)
    }

    return actualEventValue === value
  })
}

/**
 * Given indexed event and list of resolved scopes, determine if any of the scopes allow access to the event.
 */
export function canAccessEventWithScopes(
  event: Partial<EventIndexWithLocationHierarchy>,
  scopes: ResolvedRecordScopeV2[]
) {
  return scopes.some((scope) => canAccessEventWithScope(event, scope))
}

export function getAcceptedScopesFromToken(
  token: string,
  acceptedScopes: string[]
) {
  const tokenScopes = getScopes(token)

  return tokenScopes
    .map((scope) => {
      const parsedScope = decodeScope(scope)
      return parsedScope && acceptedScopes.includes(parsedScope.type)
        ? parsedScope
        : null
    })
    .filter((scope): scope is z.infer<typeof AnyScope> => scope !== null)
}

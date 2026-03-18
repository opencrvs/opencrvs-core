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
import {
  JurisdictionFilter,
  RecordScopeTypeV2,
  ScopeOptionKey,
  getScopeOptionValue
} from '../scopes'
import { getAcceptedScopesFromToken } from '../authentication'
import z from 'zod/v4'

const ScopeOptionReference = z.object({
  $scope: RecordScopeTypeV2,
  $option: ScopeOptionKey
})

type ScopeOptionReference = z.infer<typeof ScopeOptionReference>

export const JurisdictionReference = z.object({
  $jurisdiction: JurisdictionFilter.or(ScopeOptionReference)
})
export type JurisdictionReference = z.infer<typeof JurisdictionReference>

/*
 * Type guard to check if the jurisdiction is a plain jurisdiction filter.
 *
 * @param jurisdiction - The jurisdiction to check.
 * @returns True if the jurisdiction is a plain jurisdiction filter, false otherwise.
 */
function isJurisdictionFilter(
  jurisdiction: unknown
): jurisdiction is JurisdictionFilter {
  if (typeof jurisdiction !== 'string') {
    return false
  }

  // Do this instead of using safeParse for performance reasons.
  const allowedJurisdictionFilters: string[] = JurisdictionFilter.options
  return allowedJurisdictionFilters.includes(jurisdiction)
}

/**
 * Resolves a scope option reference to a jurisdiction filter.
 *
 * @param scopeOptionReference - The scope option reference to resolve. This will contain scope and option names.
 * @param scopes - The scopes to resolve the scope option reference from.
 * @returns The jurisdiction filter or undefined if the scope is not found or the option is not a valid jurisdiction filter.
 */
function resolveJurisdictionScopeOptionReference(
  scopeOptionReference: ScopeOptionReference,
  token: string,
  eventType: string
): JurisdictionFilter | undefined {
  const { $scope, $option } = scopeOptionReference
  const acceptedScopes = getAcceptedScopesFromToken(token, [$scope])

  const acceptedScopesMatchingEventType = acceptedScopes.filter(
    (scope) =>
      scope.options?.event?.includes(eventType) ||
      scope.options?.event === undefined
  )

  const acceptedJurisdictionFilters = acceptedScopesMatchingEventType
    .map((scope) => getScopeOptionValue(scope, $option))
    .filter((val) => isJurisdictionFilter(val))

  // Return the first matching jurisdiction filter by priority order
  const priorityOrder = [
    JurisdictionFilter.enum.all,
    JurisdictionFilter.enum.administrativeArea,
    JurisdictionFilter.enum.location
  ]

  const jurisdictionFilter = priorityOrder.find((f) =>
    acceptedJurisdictionFilters.includes(f)
  )

  return jurisdictionFilter ?? undefined
}

/**
 * Resolves a jurisdiction reference to a jurisdiction filter.
 *
 * @param jurisdictionReference - The jurisdiction reference to resolve. This can be a plain jurisdiction filter or a scope option reference.
 * @returns The jurisdiction filter or undefined if the jurisdiction reference is not valid.
 */
export function resolveJurisdictionReference(
  jurisdictionReference: JurisdictionReference | undefined,
  token?: string,
  eventType?: string
): JurisdictionFilter | undefined {
  if (!jurisdictionReference) {
    return JurisdictionFilter.enum.all
  }

  const jurisdiction = jurisdictionReference['$jurisdiction']

  // If the jurisdiction is a plain jurisdiction filter, return it
  if (isJurisdictionFilter(jurisdiction)) {
    return jurisdiction
  }

  // If the jurisdiction is a scope option reference, resolve it
  if (jurisdiction['$scope'] && token && eventType) {
    return resolveJurisdictionScopeOptionReference(
      jurisdiction,
      token,
      eventType
    )
  }

  return
}

/** Functions for referencing values from the logged in user's details */
export const userReferenceFunctions = {
  scope: (scope: RecordScopeTypeV2) => ({
    /**
     * user.scope().attribute() is used to create a scope option reference.
     *
     * E.g.: user.scope('record.create').attribute('placeOfEvent')
     *
     * @param option - The option to create a reference for.
     * @returns A scope option reference.
     */
    attribute: (option: ScopeOptionKey) => ({
      $scope: scope,
      $option: option
    })
  }),
  /**
   * user.jurisdicton() accepts two different kinds of parameters, either:
   *
   * 1. a plain jurisdiction filter: user.jurisdiction('administrativeArea')
   * 2. a scope option reference: user.jurisdiction(user.scope('record.create').attribute('placeOfEvent'))
   *
   * These will be resolved during runtime.
   *
   * @param jurisdiction - The jurisdiction to resolve.
   */
  jurisdiction: (jurisdiction: JurisdictionFilter | ScopeOptionReference) => ({
    $jurisdiction: jurisdiction
  })
}

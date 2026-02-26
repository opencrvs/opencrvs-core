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
  findScopeV2,
  RecordScopeAttributes
} from '../scopes-v2'
import { RawScopes, Scope } from '../authentication'
import z from 'zod/v4'

const RecordScopeAttributeKey = RecordScopeAttributes.keyof()
type RecordScopeAttributeKey = z.infer<typeof RecordScopeAttributeKey>

const ScopeAttributeReference = z.object({
  $scope: RecordScopeTypeV2,
  $attribute: RecordScopeAttributeKey
})

type ScopeAttributeReference = z.infer<typeof ScopeAttributeReference>

export const JurisdictionReference = z.object({
  $jurisdiction: JurisdictionFilter.or(ScopeAttributeReference)
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
  const allowedJurisdictionFilters: string[] = Object.values(
    JurisdictionFilter.enum
  )
  return allowedJurisdictionFilters.includes(jurisdiction)
}

// TODO CIHAN: can we make this into a generic function for resolving any scope option?
function getScopeAttributeValue(
  scopeAttributeReference: ScopeAttributeReference,
  scopes: RawScopes[]
): JurisdictionFilter {
  const { $scope, $attribute } = scopeAttributeReference
  const scope = findScopeV2(scopes, $scope)

  // If no scope is found, return the most limited jurisdiction filter
  if (!scope) {
    return JurisdictionFilter.enum.location
  }

  const attributeValue = scope.options?.[$attribute]

  // If scope is found but no attribute is set, return the most permissive jurisdiction filter
  if (!attributeValue || !isJurisdictionFilter(attributeValue)) {
    return JurisdictionFilter.enum.all
  }

  return attributeValue
}

/**
 * Resolves a jurisdiction reference to a jurisdiction filter.
 *
 * @param jurisdictionReference - The jurisdiction reference to resolve. This can be a plain jurisdiction filter or a scope attribute reference.
 * @returns The jurisdiction filter.
 */
export function resolveJurisdictionReference(
  jurisdictionReference: JurisdictionReference | undefined,
  scopes?: RawScopes[] | null
): JurisdictionFilter {
  if (!jurisdictionReference) {
    return JurisdictionFilter.enum.all
  }

  const jurisdiction = jurisdictionReference['$jurisdiction']

  // If the jurisdiction is a plain jurisdiction filter, return it
  if (isJurisdictionFilter(jurisdiction)) {
    return jurisdiction
  }

  // If the jurisdiction is a scope attribute reference, resolve it
  if (jurisdiction['$scope'] && scopes) {
    return getScopeAttributeValue(jurisdiction, scopes)
  }

  throw 'Failed to resolve jurisdiction filter'
}

/** Functions for referencing values from the logged in user's details */
export const userReferenceFunctions = {
  scope: (scope: Scope) => ({
    /**
     * user.scope().attribute() is used to create a scope attribute reference.
     *
     * E.g.: user.scope('record.create').attribute('placeOfEvent')
     *
     * @param option - The option to create a reference for.
     * @returns A scope option reference.
     */
    attribute: (attribute: RecordScopeAttributeKey) => ({
      $scope: scope,
      $attribute: attribute
    })
  }),
  /**
   * user.jurisdicton() accepts two different kinds of parameters, either:
   *
   * 1. a plain jurisdiction filter: user.jurisdiction('administrativeArea')
   * 2. a scope attribute reference: user.jurisdiction(user.scope('record.create').attribute('placeOfEvent'))
   *
   * These will be resolved during runtime.
   *
   * @param jurisdiction - The jurisdiction to resolve.
   */
  jurisdiction: (
    jurisdiction: JurisdictionFilter | ScopeAttributeReference
  ) => ({
    $jurisdiction: jurisdiction
  })
}

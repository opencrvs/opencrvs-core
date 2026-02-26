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
  RecordScopeOptions
} from '../scopes-v2'
import { RawScopes, Scope } from '../authentication'
import z from 'zod/v4'

const ScopeOptionReference = z.object({
  $scope: RecordScopeTypeV2,
  $option: RecordScopeOptions.keyof()
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
  const allowedJurisdictionFilters: string[] = Object.values(
    JurisdictionFilter.enum
  )
  return allowedJurisdictionFilters.includes(jurisdiction)
}

// TODO CIHAN: can we make this into a generic function for resolving any scope option?
function parseScopeOption(
  scopeOptionReference: ScopeOptionReference,
  scopes: RawScopes[]
): JurisdictionFilter {
  const { $scope, $option } = scopeOptionReference
  const scope = findScopeV2(scopes, $scope)

  if (!scope) {
    return JurisdictionFilter.enum.location
  }

  const optionValue = scope.options?.[$option]

  // By default the scope attribute is 'all'
  if (!optionValue || !isJurisdictionFilter(optionValue)) {
    return JurisdictionFilter.enum.all
  }

  return optionValue
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
    return parseScopeOption(jurisdiction, scopes)
  }

  throw 'Failed to resolve jurisdiction filter'
}

/** Functions for referencing values from the logged in user's details */
export const userReferenceFunctions = {
  scope: (scope: Scope) => ({
    /**
     * user.scope().option() is used to create a scope option reference.
     *
     * E.g.: user.scope('record.create').option('placeOfEvent')
     *
     * @param option - The option to create a reference for.
     * @returns A scope option reference.
     */
    option: (option: string) => ({ $scope: scope, $option: option })
  }),
  /**
   * user.jurisdicton() accepts two different kinds of parameters, either:
   *
   * 1. a plain jurisdiction filter: user.jurisdiction('administrativeArea')
   * 2. a scope attribute reference: user.jurisdiction(user.scope('record.create').option('placeOfEvent'))
   *
   * These will be resolved during runtime.
   *
   * @param jurisdiction - The jurisdiction to resolve.
   */
  jurisdiction: (jurisdiction: JurisdictionFilter | ScopeOptionReference) => ({
    $jurisdiction: jurisdiction
  })
}

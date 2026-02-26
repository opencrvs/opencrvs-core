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
  jurisdiction: JurisdictionFilter | ScopeOptionReference
): jurisdiction is JurisdictionFilter {
  if (typeof jurisdiction !== 'string') {
    return false
  }

  // Do this instead of using safeParse for performance reasons.
  const allowedJurisdictionFilters = Object.values(JurisdictionFilter.enum)
  return allowedJurisdictionFilters.includes(jurisdiction)
}

// TODO CIHAN: can we make this into a generic function for resolving any scope option?
function parseScopeOption(
  scopeOptionReference: ScopeOptionReference,
  scopes: RawScopes[]
): JurisdictionFilter {
  const scopeName = scopeOptionReference['$scope']
  const scopeOption = scopeOptionReference['$option']

  // TODO CIHAN:
  console.log('scopeName', scopeName)
  console.log('scopeOption', scopeOption)

  const scope = findScopeV2(scopes, scopeName)

  console.log('scope', scope)

  if (!scope) {
    return JurisdictionFilter.enum.location
  }

  const optionValue = scope.options?.[scopeOption]

  console.log('optionValue', optionValue)

  // By default the scope attribute is 'all'
  return JurisdictionFilter.enum.all
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

/** Functions for resolving values from user details */
export const userReferenceFunctions = {
  jurisdiction: (jurisdiction: JurisdictionFilter | ScopeOptionReference) => ({
    $jurisdiction: jurisdiction
  }),
  scope: (scope: Scope) => ({
    option: (option: string) => ({ $scope: scope, $option: option })
  })
}

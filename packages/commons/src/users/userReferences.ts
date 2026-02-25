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
import { JurisdictionFilter } from '../scopes-v2'
import { Scope } from '../authentication'
import z from 'zod/v4'

// TODO CIHAN: can we specify the scope and attribute here?
const ScopeAttributeReference = z.object({
  $scope: z.string(),
  $attribute: z.string()
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
  jurisdiction: JurisdictionFilter | ScopeAttributeReference
): jurisdiction is JurisdictionFilter {
  if (typeof jurisdiction !== 'string') {
    return false
  }

  // Do this instead of using safeParse for performance reasons.
  const allowedJurisdictionFilters = Object.values(JurisdictionFilter.enum)
  return allowedJurisdictionFilters.includes(jurisdiction)
}

function resolveScopeAttribute(
  scopeAttributeReference: ScopeAttributeReference,
  scopes: string[]
): JurisdictionFilter {
  const scopeName = scopeAttributeReference['$scope']
  const scopeAttribute = scopeAttributeReference['$attribute']

  // TODO CIHAN:
  console.log('scopeName', scopeName)
  console.log('scopeAttribute', scopeAttribute)

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
  scopes?: string[]
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
    return resolveScopeAttribute(jurisdiction, scopes)
  }

  throw 'Failed to resolve jurisdiction filter'
}

/** Functions for resolving values from user details */
export const userReferenceFunctions = {
  jurisdiction: (
    jurisdiction: JurisdictionFilter | ScopeAttributeReference
  ) => ({ $jurisdiction: jurisdiction }),
  scope: (scope: Scope) => ({
    attribute: (attribute: string) => ({ $scope: scope, $attribute: attribute })
  })
}

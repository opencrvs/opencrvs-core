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

import { SEARCH_URL } from '@gateway/constants'
import {
  GQLAdvancedSearchParametersInput,
  GQLEventType
} from '@gateway/graphql/schema'
import { IAuthHeader } from '@opencrvs/commons'
import fetch from '@gateway/fetch'
import {
  getTokenPayload,
  Scope,
  SCOPES
} from '@opencrvs/commons/authentication'
import { IUserModelData } from '@gateway/features/user/type-resolvers'

export interface ISearchCriteria {
  parameters: GQLAdvancedSearchParametersInput
  sort?: string
  sortColumn?: string
  sortBy?: Array<Record<string, string>>
  size?: number
  from?: number
  createdBy?: string
}

export const postAdvancedSearch = async (
  authHeader: IAuthHeader,
  criteria: ISearchCriteria
) => {
  try {
    const response = await fetch(`${SEARCH_URL}advancedRecordSearch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader
      },
      body: JSON.stringify(criteria)
    })
    return await response.json()
  } catch (error) {
    throw new Error(`Search request failed: ${error.message}`)
  }
}

const addJurisdictionIdParamWithScopes = (
  currentScopes: Scope[],
  searchParams: Omit<GQLAdvancedSearchParametersInput, 'event'> & {
    event?: GQLEventType[]
    birthJurisdictionId?: string
    deathJurisdictionId?: string
    marriageJurisdictionId?: string
  },
  user: IUserModelData
) => {
  if (
    searchParams.event &&
    (searchParams.declarationJurisdictionId ||
      searchParams.declarationLocationId)
  ) {
  }

  if (currentScopes.includes(SCOPES.SEARCH_BIRTH_MY_JURISDICTION)) {
    searchParams.birthJurisdictionId = user.primaryOfficeId
  }
  if (currentScopes.includes(SCOPES.SEARCH_DEATH_MY_JURISDICTION)) {
    searchParams.deathJurisdictionId = user.primaryOfficeId
  }
  if (currentScopes.includes(SCOPES.SEARCH_MARRIAGE_MY_JURISDICTION)) {
    searchParams.marriageJurisdictionId = user.primaryOfficeId
  }
}

const addSearchParamForScope = (
  requiredScopes: Scope[],
  event: GQLEventType,
  tokenScopes: Scope[],
  filteredParams: Omit<GQLAdvancedSearchParametersInput, 'event'> & {
    event?: GQLEventType[]
    birthJurisdictionId?: string
    deathJurisdictionId?: string
    marriageJurisdictionId?: string
  },
  searchParamEvent: GQLEventType | undefined
) => {
  if (!tokenScopes.some((scope) => requiredScopes.includes(scope))) return

  if (!searchParamEvent) {
    filteredParams.event ??= []
    filteredParams.event.push(event)
  }
}

export const filterSearchParamsWithScope = (
  token: string,
  advancedSearchParameters: GQLAdvancedSearchParametersInput,
  user: IUserModelData
): Omit<
  GQLAdvancedSearchParametersInput,
  'event' & {
    event: GQLEventType[]
  }
> => {
  const { event: searchParamEvent, ...filteredParams } =
    advancedSearchParameters
  const currentUserScopes = getTokenPayload(token).scope

  addSearchParamForScope(
    [SCOPES.SEARCH_BIRTH, SCOPES.SEARCH_BIRTH_MY_JURISDICTION],
    GQLEventType.birth,
    currentUserScopes,
    filteredParams,
    searchParamEvent
  )

  addSearchParamForScope(
    [SCOPES.SEARCH_DEATH, SCOPES.SEARCH_DEATH_MY_JURISDICTION],
    GQLEventType.death,
    currentUserScopes,
    filteredParams,
    searchParamEvent
  )

  addSearchParamForScope(
    [SCOPES.SEARCH_MARRIAGE, SCOPES.SEARCH_MARRIAGE_MY_JURISDICTION],
    GQLEventType.marriage,
    currentUserScopes,
    filteredParams,
    searchParamEvent
  )

  addJurisdictionIdParamWithScopes(currentUserScopes, filteredParams, user)

  return filteredParams
}

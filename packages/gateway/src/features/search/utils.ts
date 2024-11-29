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
    return await Promise.reject(
      new Error(`Search request failed: ${error.message}`)
    )
  }
}

const addEventParamForScope = (
  requiredScopes: Scope[],
  event: GQLEventType,
  tokenScopes: Scope[],
  filteredParams: Omit<GQLAdvancedSearchParametersInput, 'event'> & {
    event?: GQLEventType[]
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
  advancedSearchParameters: GQLAdvancedSearchParametersInput
): Omit<
  GQLAdvancedSearchParametersInput,
  'event' & {
    event: GQLEventType[]
  }
> => {
  const { event: searchParamEvent, ...filteredParams } =
    advancedSearchParameters
  const currentUserScopes = getTokenPayload(token).scope

  addEventParamForScope(
    [SCOPES.SEARCH_BIRTH, SCOPES.SEARCH_BIRTH_MY_JURISDICTION],
    GQLEventType.birth,
    currentUserScopes,
    filteredParams,
    searchParamEvent
  )

  addEventParamForScope(
    [SCOPES.SEARCH_DEATH, SCOPES.SEARCH_DEATH_MY_JURISDICTION],
    GQLEventType.death,
    currentUserScopes,
    filteredParams,
    searchParamEvent
  )

  addEventParamForScope(
    [SCOPES.SEARCH_MARRIAGE, SCOPES.SEARCH_MARRIAGE_MY_JURISDICTION],
    GQLEventType.marriage,
    currentUserScopes,
    filteredParams,
    searchParamEvent
  )

  return filteredParams
}

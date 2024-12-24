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
import { Scope, SCOPES } from '@opencrvs/commons/authentication'

export interface ISearchCriteria {
  parameters: AdvancedSearchParams
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
type AdvancedSearchParams = Omit<GQLAdvancedSearchParametersInput, 'event'> & {
  event?: {
    eventName: string
    jurisdictionId?: string
  }[]
}

function scopeToEventParams(
  userScopes: Scope[],
  officeLocationId: string
): NonNullable<AdvancedSearchParams['event']> {
  const eventParams: NonNullable<AdvancedSearchParams['event']> = []
  if (
    userScopes.includes(SCOPES.SEARCH_BIRTH) ||
    userScopes.includes(SCOPES.SEARCH_BIRTH_MY_JURISDICTION)
  ) {
    eventParams.push({
      eventName: GQLEventType.birth,
      jurisdictionId: userScopes.includes(SCOPES.SEARCH_BIRTH_MY_JURISDICTION)
        ? officeLocationId
        : undefined
    })
  }
  if (
    userScopes.includes(SCOPES.SEARCH_DEATH) ||
    userScopes.includes(SCOPES.SEARCH_DEATH_MY_JURISDICTION)
  ) {
    eventParams.push({
      eventName: GQLEventType.death,
      jurisdictionId: userScopes.includes(SCOPES.SEARCH_DEATH_MY_JURISDICTION)
        ? officeLocationId
        : undefined
    })
  }
  if (
    userScopes.includes(SCOPES.SEARCH_MARRIAGE) ||
    userScopes.includes(SCOPES.SEARCH_MARRIAGE_MY_JURISDICTION)
  ) {
    eventParams.push({
      eventName: GQLEventType.marriage,
      jurisdictionId: userScopes.includes(
        SCOPES.SEARCH_MARRIAGE_MY_JURISDICTION
      )
        ? officeLocationId
        : undefined
    })
  }
  return eventParams
}

export const transformSearchParams = (
  userScopes: Scope[],
  inputParams: GQLAdvancedSearchParametersInput,
  officeLocationId: string
): AdvancedSearchParams => {
  const { event: eventType, ...restOfParams } = inputParams
  let eventParams = scopeToEventParams(userScopes, officeLocationId)
  if (eventType) {
    eventParams = eventParams.filter(({ eventName }) => eventName === eventType)
  }

  return {
    ...restOfParams,
    event: eventParams
  }
}

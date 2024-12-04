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

const addSearchParamForScope = (
  requiredScopes: Scope[],
  tokenScopes: Scope[],
  advancedSearchParameters: GQLAdvancedSearchParametersInput & {
    birthJurisdictionId?: string
    deathJurisdictionId?: string
    marriageJurisdictionId?: string
  },
  user: IUserModelData,
  event?: GQLEventType
) => {
  const { declarationJurisdictionId, declarationLocationId } =
    advancedSearchParameters
  if (!tokenScopes.some((scope) => requiredScopes.includes(scope))) return

  const scopeMappings = {
    [GQLEventType.birth]: {
      jurisdictionScope: SCOPES.SEARCH_BIRTH_MY_JURISDICTION,
      generalScope: SCOPES.SEARCH_BIRTH,
      jurisdictionIdField: 'birthJurisdictionId' as const
    },
    [GQLEventType.death]: {
      jurisdictionScope: SCOPES.SEARCH_DEATH_MY_JURISDICTION,
      generalScope: SCOPES.SEARCH_DEATH,
      jurisdictionIdField: 'deathJurisdictionId' as const
    },
    [GQLEventType.marriage]: {
      jurisdictionScope: SCOPES.SEARCH_MARRIAGE_MY_JURISDICTION,
      generalScope: SCOPES.SEARCH_MARRIAGE,
      jurisdictionIdField: 'marriageJurisdictionId' as const
    }
  }

  if (
    advancedSearchParameters.declarationLocationId ||
    advancedSearchParameters.declarationJurisdictionId
  ) {
    if (
      user.primaryOfficeId !== declarationLocationId &&
      user.primaryOfficeId !== declarationJurisdictionId
    ) {
      throw new Error('Can not search this location')
    }
  }

  if (event) {
    const { jurisdictionScope, generalScope, jurisdictionIdField } =
      scopeMappings[event]

    if (tokenScopes.includes(jurisdictionScope)) {
      advancedSearchParameters[jurisdictionIdField] = user.primaryOfficeId
    } else if (tokenScopes.includes(generalScope)) {
      advancedSearchParameters.event = event
    }
  }
}

export const filterSearchParamsWithScope = (
  token: string,
  advancedSearchParameters: GQLAdvancedSearchParametersInput,
  user: IUserModelData,
  eventType?: GQLEventType
): Omit<
  GQLAdvancedSearchParametersInput,
  'event' & {
    event: GQLEventType[]
  }
> => {
  const currentUserScopes = getTokenPayload(token).scope

  addSearchParamForScope(
    [SCOPES.SEARCH_BIRTH, SCOPES.SEARCH_BIRTH_MY_JURISDICTION],
    currentUserScopes,
    advancedSearchParameters,
    user,
    eventType
  )

  addSearchParamForScope(
    [SCOPES.SEARCH_DEATH, SCOPES.SEARCH_DEATH_MY_JURISDICTION],
    currentUserScopes,
    advancedSearchParameters,
    user,
    eventType
  )

  addSearchParamForScope(
    [SCOPES.SEARCH_MARRIAGE, SCOPES.SEARCH_MARRIAGE_MY_JURISDICTION],
    currentUserScopes,
    advancedSearchParameters,
    user,
    eventType
  )

  return advancedSearchParameters
}

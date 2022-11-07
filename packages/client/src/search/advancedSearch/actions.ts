/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import { IAdvancedSearchParamState } from '@client/search/advancedSearch/reducer'

export const CHANGE_ADVANCED_SEARCH_PARAM =
  'ADVANCED_SEARCH/CHANGE_ADVANCED_SEARCH_PARAM'

export type MOdifyAdvancedSearchParamAction = {
  type: typeof CHANGE_ADVANCED_SEARCH_PARAM
  payload: Partial<IAdvancedSearchParamState>
}

export const modifyAdvancedSearchParam = (
  paramsToUpdate: Partial<IAdvancedSearchParamState>
): MOdifyAdvancedSearchParamAction => ({
  type: CHANGE_ADVANCED_SEARCH_PARAM,
  payload: paramsToUpdate
})

export type AdvancedSearchParamActions = MOdifyAdvancedSearchParamAction

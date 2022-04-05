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

import { ApolloQueryResult } from 'apollo-client'
import { GQLFormDraft } from '@opencrvs/gateway/src/graphql/schema'

export const LOAD_DRAFT = 'FORM/FETCH_DRAFT'
export type DraftFetchAction = {
  type: typeof LOAD_DRAFT
}

export const fetchDraft = (): DraftFetchAction => ({
  type: LOAD_DRAFT
})

export const STORE_DRAFT = 'FORM/STORE_DRAFT'
export type DraftStoredAction = {
  type: typeof STORE_DRAFT
  payload: {
    queryData: ApolloQueryResult<{ getFormDraft: Array<GQLFormDraft | null> }>
  }
}

export const storeDraft = (
  queryData: ApolloQueryResult<{ getFormDraft: Array<GQLFormDraft | null> }>
): DraftStoredAction => ({
  type: STORE_DRAFT,
  payload: {
    queryData
  }
})

export const FAILED_DRAFT = 'FORM/FAILED_DRAFT'
export type DraftFailAction = {
  type: typeof FAILED_DRAFT
}

export const failedDraft = (): DraftFailAction => ({
  type: FAILED_DRAFT
})

export type FormDraftActions =
  | DraftStoredAction
  | DraftFetchAction
  | DraftFailAction

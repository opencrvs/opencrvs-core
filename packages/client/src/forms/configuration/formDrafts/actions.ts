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

export const LOAD_FORM_DRAFT = 'FORM/LOAD_FORM_DRAFT'
export type LoadFormDraftAction = {
  type: typeof LOAD_FORM_DRAFT
}

export const loadFormDraft = (): LoadFormDraftAction => ({
  type: LOAD_FORM_DRAFT
})

export const FETCH_FORM_DRAFT = 'FORM/FETCH_FORM_DRAFT'
export type FetchFormDraftAction = {
  type: typeof FETCH_FORM_DRAFT
}

export const fetchFormDraft = (): FetchFormDraftAction => ({
  type: FETCH_FORM_DRAFT
})

export const LOAD_FORM_DRAFT_SUCCESS = 'FORM/LOAD_FORM_DRAFT_SUCCESS'
export type LoadFormDraftSuccessAction = {
  type: typeof LOAD_FORM_DRAFT_SUCCESS
  payload: string
}

export const loadFormDraftSuccessAction = (
  response: string
): LoadFormDraftSuccessAction => ({
  type: LOAD_FORM_DRAFT_SUCCESS,
  payload: response
})

export const FETCH_FORM_DRAFT_SUCCESS = 'FORM/FETCH_FORM_DRAFT_SUCCESS'
export type FetchFormDraftSuccessAction = {
  type: typeof FETCH_FORM_DRAFT_SUCCESS
  payload: {
    queryData: ApolloQueryResult<{ getFormDraft: GQLFormDraft[] }>
  }
}

export const fetchFormDraftSuccessAction = (
  queryData: ApolloQueryResult<{ getFormDraft: GQLFormDraft[] }>
): FetchFormDraftSuccessAction => ({
  type: FETCH_FORM_DRAFT_SUCCESS,
  payload: {
    queryData
  }
})

export const FETCH_FORM_DRAFT_FAILED = 'FORM/FETCH_FORM_DRAFT_FAILED'
export type FetchFormDraftFailedAction = {
  type: typeof FETCH_FORM_DRAFT_FAILED
}

export const fetchFormDraftFailedAction = (): FetchFormDraftFailedAction => ({
  type: FETCH_FORM_DRAFT_FAILED
})

export type FormDraftActions =
  | LoadFormDraftAction
  | FetchFormDraftAction
  | FetchFormDraftSuccessAction
  | FetchFormDraftFailedAction
  | LoadFormDraftSuccessAction

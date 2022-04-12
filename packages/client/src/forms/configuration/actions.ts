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
import { GQLformDraft } from '@opencrvs/gateway/src/graphql/schema'

export const LOAD_FORM_DRAFT = 'FORM/LOAD_FORM_DRAFT'
export type FormDraftLoadAction = {
  type: typeof LOAD_FORM_DRAFT
}

export const loadFormDraft = (): FormDraftLoadAction => ({
  type: LOAD_FORM_DRAFT
})

export const FETCH_FORM_DRAFT = 'FORM/FETCH_FORM_DRAFT'
export type FormDraftFetchAction = {
  type: typeof FETCH_FORM_DRAFT
}

export const fetchFormDraft = (): FormDraftFetchAction => ({
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
    queryData: ApolloQueryResult<{ getFormDraft: Array<GQLformDraft | null> }>
  }
}

export const fetchFormDraftSuccessAction = (
  queryData: ApolloQueryResult<{ getFormDraft: Array<GQLformDraft | null> }>
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
  | FormDraftLoadAction
  | FormDraftFetchAction
  | FetchFormDraftSuccessAction
  | FetchFormDraftFailedAction
  | LoadFormDraftSuccessAction

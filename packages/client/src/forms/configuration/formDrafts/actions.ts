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

export const LOAD_STORAGE_FORM_DRAFT = 'FORM/LOAD_STORAGE_FORM_DRAFT'
export type LoadStorageFormDraftAction = {
  type: typeof LOAD_STORAGE_FORM_DRAFT
}

export const loadStorageFormDraft = (): LoadStorageFormDraftAction => ({
  type: LOAD_STORAGE_FORM_DRAFT
})

export const FETCH_FORM_DRAFT = 'FORM/FETCH_FORM_DRAFT'
export type FetchFormDraftAction = {
  type: typeof FETCH_FORM_DRAFT
}

export const fetchFormDraft = (): FetchFormDraftAction => ({
  type: FETCH_FORM_DRAFT
})

export const LOAD_STORAGE_FORM_DRAFT_SUCCESS =
  'FORM/LOAD_STORAGE_FORM_DRAFT_SUCCESS'
export type LoadStorageFormDraftSuccessAction = {
  type: typeof LOAD_STORAGE_FORM_DRAFT_SUCCESS
  payload: string
}

export const loadStorageFormDraftSuccessAction = (
  response: string
): LoadStorageFormDraftSuccessAction => ({
  type: LOAD_STORAGE_FORM_DRAFT_SUCCESS,
  payload: response
})

export const FETCH_FORM_DRAFT_SUCCESS = 'FORM/FETCH_FORM_DRAFT_SUCCESS'
export type FetchFormDraftSuccessAction = {
  type: typeof FETCH_FORM_DRAFT_SUCCESS
  payload: {
    formDrafts: GQLFormDraft[]
  }
}

export const fetchFormDraftSuccessAction = ({
  formDrafts
}: {
  formDrafts: GQLFormDraft[]
}): FetchFormDraftSuccessAction => ({
  type: FETCH_FORM_DRAFT_SUCCESS,
  payload: {
    formDrafts
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
  | LoadStorageFormDraftAction
  | FetchFormDraftAction
  | FetchFormDraftSuccessAction
  | FetchFormDraftFailedAction
  | LoadStorageFormDraftSuccessAction

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
import gql from 'graphql-tag'
import { FORM_DRAFT_FIELDS } from '@client/forms/configuration/formDrafts/queries'

export const CHANGE_FORM_DRAFT_STATUS = gql`
  ${FORM_DRAFT_FIELDS}
  mutation changeStatus($event: String!, $status: DraftStatus!) {
    modifyDraftStatus(formDraft: { event: $event, status: $status }) {
      ...FormDraftFields
    }
  }
`

export const DELETE_FORM_DRAFT = gql`
  mutation deleteFormDraft($event: String!) {
    deleteFormDraft(formDraft: { event: $event })
  }
`

export const CREATE_FORM_DRAFT = gql`
  ${FORM_DRAFT_FIELDS}
  mutation createFormDraft(
    $event: String!
    $comment: String!
    $questions: [QuestionInput!]!
  ) {
    createFormDraft(
      formDraft: { event: $event, comment: $comment, questions: $questions }
    ) {
      ...FormDraftFields
    }
  }
`

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
import { IForm, Action } from '@register/forms'
import { IApplication } from '@register/applications'
import { draftToGqlTransformer } from '@register/transformer'

const SUBMIT_BIRTH_APPLICATION = gql`
  mutation submitMutation($details: BirthRegistrationInput!) {
    createBirthRegistration(details: $details) {
      trackingId
      compositionId
    }
  }
`
const APPROVE_BIRTH_APPLICATION = gql`
  mutation submitMutation($id: ID!, $details: BirthRegistrationInput) {
    markBirthAsValidated(id: $id, details: $details)
  }
`
const REGISTER_BIRTH_APPLICATION = gql`
  mutation submitMutation($id: ID!, $details: BirthRegistrationInput) {
    markBirthAsRegistered(id: $id, details: $details)
  }
`
const REJECT_BIRTH_APPLICATION = gql`
  mutation submitMutation($id: String!, $reason: String!, $comment: String!) {
    markEventAsVoided(id: $id, reason: $reason, comment: $comment)
  }
`
const COLLECT_BIRTH_CERTIFICATE = gql`
  mutation submitMutation($id: ID!, $details: BirthRegistrationInput!) {
    markBirthAsCertified(id: $id, details: $details)
  }
`

export function getBirthMutationMappings(
  action: Action,
  payload?: any,
  form?: IForm,
  draft?: IApplication
) {
  switch (action) {
    case Action.SUBMIT_FOR_REVIEW:
      return {
        mutation: SUBMIT_BIRTH_APPLICATION,
        variables:
          form && draft
            ? {
                details: draftToGqlTransformer(form, draft.data)
              }
            : {},
        dataKey: 'createBirthRegistration'
      }
    case Action.APPROVE_APPLICATION:
      return {
        mutation: APPROVE_BIRTH_APPLICATION,
        variables:
          form && draft
            ? {
                id: draft.id,
                details: draftToGqlTransformer(form, draft.data)
              }
            : {},
        dataKey: 'markBirthAsValidated'
      }
    case Action.REGISTER_APPLICATION:
      return {
        mutation: REGISTER_BIRTH_APPLICATION,
        variables:
          form && draft
            ? {
                id: draft.id,
                details: draftToGqlTransformer(form, draft.data)
              }
            : {},
        dataKey: 'markBirthAsRegistered'
      }
    case Action.REJECT_APPLICATION:
      return {
        mutation: REJECT_BIRTH_APPLICATION,
        variables: {
          ...payload
        },
        dataKey: 'markEventAsVoided'
      }
    case Action.COLLECT_CERTIFICATE:
      return {
        mutation: COLLECT_BIRTH_CERTIFICATE,
        variables:
          form && draft
            ? {
                id: draft.id,
                details: draftToGqlTransformer(form, draft.data)
              }
            : {},
        dataKey: 'markBirthAsCertified'
      }
    default:
      return null
  }
}

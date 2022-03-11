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
import { IForm, Action } from '@client/forms'
import { IDeclaration } from '@client/declarations'
import {
  draftToGqlTransformer,
  appendGqlMetadataFromDraft
} from '@client/transformer'
import { REQUEST_BIRTH_REG_CORRECTION } from '@client/forms/correction/mutations'

export const SUBMIT_BIRTH_DECLARATION = gql`
  mutation submitMutation($details: BirthRegistrationInput!) {
    createBirthRegistration(details: $details) {
      trackingId
      compositionId
    }
  }
`
export const APPROVE_BIRTH_DECLARATION = gql`
  mutation submitMutation($id: ID!, $details: BirthRegistrationInput) {
    markBirthAsValidated(id: $id, details: $details)
  }
`
export const REGISTER_BIRTH_DECLARATION = gql`
  mutation submitMutation($id: ID!, $details: BirthRegistrationInput) {
    markBirthAsRegistered(id: $id, details: $details) {
      id
      registration {
        id
        status {
          id
          user {
            id
            name {
              use
              firstNames
              familyName
            }
            role
          }
          location {
            id
            name
            alias
          }
          office {
            name
            alias
            address {
              district
              state
            }
          }
          type
          timestamp
          comments {
            comment
          }
        }
      }
    }
  }
`
export const REJECT_BIRTH_DECLARATION = gql`
  mutation submitMutation($id: String!, $reason: String!, $comment: String!) {
    markEventAsVoided(id: $id, reason: $reason, comment: $comment)
  }
`
export const REINSTATE_BIRTH_DECLARATION = gql`
  mutation submitMutation($id: String!) {
    markEventAsReinstated(id: $id) {
      taskEntryResourceID
      registrationStatus
    }
  }
`
export const ARCHIVE_BIRTH_DECLARATION = gql`
  mutation submitMutation($id: String!) {
    markEventAsArchived(id: $id)
  }
`

export const COLLECT_BIRTH_CERTIFICATE = gql`
  mutation submitMutation($id: ID!, $details: BirthRegistrationInput!) {
    markBirthAsCertified(id: $id, details: $details)
  }
`

export function getBirthMutationMappings(
  action: Action,
  payload?: any,
  form?: IForm,
  draft?: IDeclaration
) {
  let gqlDetails = {}
  if (form && draft) {
    gqlDetails = draftToGqlTransformer(
      form,
      draft.data,
      draft.id,
      draft.originalData
    )
    appendGqlMetadataFromDraft(draft, gqlDetails)
  }

  switch (action) {
    case Action.SUBMIT_FOR_REVIEW:
      return {
        mutation: SUBMIT_BIRTH_DECLARATION,
        variables: { details: gqlDetails },
        dataKey: 'createBirthRegistration'
      }
    case Action.APPROVE_DECLARATION:
      return {
        mutation: APPROVE_BIRTH_DECLARATION,
        variables: {
          id: draft && draft.id,
          details: gqlDetails
        },
        dataKey: 'markBirthAsValidated'
      }
    case Action.REGISTER_DECLARATION:
      return {
        mutation: REGISTER_BIRTH_DECLARATION,
        variables: {
          id: draft && draft.id,
          details: gqlDetails
        },
        dataKey: 'markBirthAsRegistered'
      }
    case Action.REJECT_DECLARATION:
      return {
        mutation: REJECT_BIRTH_DECLARATION,
        variables: {
          ...payload
        },
        dataKey: 'markEventAsVoided'
      }
    case Action.REINSTATE_DECLARATION:
      return {
        mutation: REINSTATE_BIRTH_DECLARATION,
        variables: {
          ...payload
        },
        dataKey: 'markDeclarationAsReinstate'
      }
    case Action.ARCHIVE_DECLARATION:
      return {
        mutation: ARCHIVE_BIRTH_DECLARATION,
        variables: {
          ...payload
        },
        dataKey: 'markEventAsArchived'
      }
    case Action.COLLECT_CERTIFICATE:
      return {
        mutation: COLLECT_BIRTH_CERTIFICATE,
        variables: {
          id: draft && draft.id,
          details: gqlDetails
        },
        dataKey: 'markBirthAsCertified'
      }
    case Action.REQUEST_CORRECTION_DECLARATION:
      return {
        mutation: REQUEST_BIRTH_REG_CORRECTION,
        variables: {
          id: draft && draft.id,
          details: gqlDetails
        },
        dataKey: 'requestBirthRegistrationCorrection'
      }
    default:
      return null
  }
}

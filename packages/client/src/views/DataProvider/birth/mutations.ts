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
import { REQUEST_BIRTH_REG_CORRECTION } from '@client/forms/correction/mutations'
import { SubmissionAction } from '@client/forms'

export const SUBMIT_BIRTH_DECLARATION = gql`
  mutation createBirthRegistration($details: BirthRegistrationInput!) {
    createBirthRegistration(details: $details) {
      trackingId
      compositionId
    }
  }
`
export const APPROVE_BIRTH_DECLARATION = gql`
  mutation markBirthAsValidated($id: ID!, $details: BirthRegistrationInput!) {
    markBirthAsValidated(id: $id, details: $details)
  }
`
export const REGISTER_BIRTH_DECLARATION = gql`
  mutation markBirthAsRegistered($id: ID!, $details: BirthRegistrationInput!) {
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
  mutation markEventAsVoided(
    $id: String!
    $reason: String!
    $comment: String!
  ) {
    markEventAsVoided(id: $id, reason: $reason, comment: $comment)
  }
`

export const ARCHIVE_BIRTH_DECLARATION = gql`
  mutation markEventAsArchived($id: String!) {
    markEventAsArchived(id: $id)
  }
`

export const COLLECT_BIRTH_CERTIFICATE = gql`
  mutation markBirthAsCertified($id: ID!, $details: BirthRegistrationInput!) {
    markBirthAsCertified(id: $id, details: $details)
  }
`

export const MARK_EVENT_UNASSIGNED = gql`
  mutation submitMutation($id: String!) {
    markEventAsUnassigned(id: $id)
  }
`

export function getBirthMutation(action: SubmissionAction) {
  switch (action) {
    case SubmissionAction.SUBMIT_FOR_REVIEW:
      return SUBMIT_BIRTH_DECLARATION
    case SubmissionAction.APPROVE_DECLARATION:
      return APPROVE_BIRTH_DECLARATION
    case SubmissionAction.REGISTER_DECLARATION:
      return REGISTER_BIRTH_DECLARATION
    case SubmissionAction.REJECT_DECLARATION:
      return REJECT_BIRTH_DECLARATION
    case SubmissionAction.ARCHIVE_DECLARATION:
      return ARCHIVE_BIRTH_DECLARATION
    case SubmissionAction.COLLECT_CERTIFICATE:
      return COLLECT_BIRTH_CERTIFICATE
    case SubmissionAction.REQUEST_CORRECTION_DECLARATION:
      return REQUEST_BIRTH_REG_CORRECTION
  }
}

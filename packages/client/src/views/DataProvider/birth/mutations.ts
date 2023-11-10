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
import { gql } from '@apollo/client'
import {
  REQUEST_REG_CORRECTION,
  CREATE_BIRTH_REG_CORRECTION,
  APPROVE_BIRTH_REG_CORRECTION,
  REJECT_REG_CORRECTION
} from '@client/forms/correction/mutations'
import { SubmissionAction } from '@client/forms'

const SUBMIT_BIRTH_DECLARATION = gql`
  mutation createBirthRegistration($details: BirthRegistrationInput!) {
    createBirthRegistration(details: $details) {
      trackingId
      compositionId
      isPotentiallyDuplicate
    }
  }
`
const APPROVE_BIRTH_DECLARATION = gql`
  mutation markBirthAsValidated($id: ID!, $details: BirthRegistrationInput!) {
    markBirthAsValidated(id: $id, details: $details)
  }
`
const REGISTER_BIRTH_DECLARATION = gql`
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
            systemRole
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
const REJECT_BIRTH_DECLARATION = gql`
  mutation markEventAsVoided(
    $id: String!
    $reason: String!
    $comment: String!
  ) {
    markEventAsVoided(id: $id, reason: $reason, comment: $comment)
  }
`

const ARCHIVE_BIRTH_DECLARATION = gql`
  mutation markEventAsArchived(
    $id: String!
    $reason: String
    $comment: String
    $duplicateTrackingId: String
  ) {
    markEventAsArchived(
      id: $id
      reason: $reason
      comment: $comment
      duplicateTrackingId: $duplicateTrackingId
    )
  }
`

const COLLECT_BIRTH_CERTIFICATE = gql`
  mutation markBirthAsCertified($id: ID!, $details: BirthRegistrationInput!) {
    markBirthAsCertified(id: $id, details: $details)
  }
`

const ISSUE_BIRTH_CERTIFICATE = gql`
  mutation markBirthAsIssued($id: ID!, $details: BirthRegistrationInput!) {
    markBirthAsIssued(id: $id, details: $details)
  }
`

export const MARK_EVENT_UNASSIGNED = gql`
  mutation submitMutation($id: String!) {
    markEventAsUnassigned(id: $id)
  }
`

export const MARK_EVENT_AS_DUPLICATE = gql`
  mutation markEventAsDuplicate(
    $id: String!
    $reason: String!
    $comment: String
    $duplicateTrackingId: String
  ) {
    markEventAsDuplicate(
      id: $id
      reason: $reason
      comment: $comment
      duplicateTrackingId: $duplicateTrackingId
    )
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
    case SubmissionAction.CERTIFY_DECLARATION:
    case SubmissionAction.CERTIFY_AND_ISSUE_DECLARATION:
      return COLLECT_BIRTH_CERTIFICATE
    case SubmissionAction.ISSUE_DECLARATION:
      return ISSUE_BIRTH_CERTIFICATE
    case SubmissionAction.APPROVE_CORRECTION:
      return APPROVE_BIRTH_REG_CORRECTION
    case SubmissionAction.REJECT_CORRECTION:
      return REJECT_REG_CORRECTION
    case SubmissionAction.MAKE_CORRECTION:
      return CREATE_BIRTH_REG_CORRECTION
    case SubmissionAction.REQUEST_CORRECTION: {
      return REQUEST_REG_CORRECTION
    }
  }
}

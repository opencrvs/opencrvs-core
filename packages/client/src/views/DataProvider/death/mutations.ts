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
import { SUBMISSION_STATUS } from '@client/declarations'
import { REQUEST_DEATH_REG_CORRECTION } from '@client/forms/correction/mutations'
import { IReadyStatus } from '@client/declarations/submissionMiddleware'

export const SUBMIT_DEATH_DECLARATION = gql`
  mutation createDeathRegistration($details: DeathRegistrationInput!) {
    createDeathRegistration(details: $details) {
      trackingId
      compositionId
    }
  }
`
export const APPROVE_DEATH_DECLARATION = gql`
  mutation markDeathAsValidated($id: ID!, $details: DeathRegistrationInput!) {
    markDeathAsValidated(id: $id, details: $details)
  }
`
export const REGISTER_DEATH_DECLARATION = gql`
  mutation markDeathAsRegistered($id: ID!, $details: DeathRegistrationInput!) {
    markDeathAsRegistered(id: $id, details: $details) {
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
export const REJECT_DEATH_DECLARATION = gql`
  mutation markEventAsVoided(
    $id: String!
    $reason: String!
    $comment: String!
  ) {
    markEventAsVoided(id: $id, reason: $reason, comment: $comment)
  }
`

export const ARCHIVE_DEATH_DECLARATION = gql`
  mutation markEventAsArchived($id: String!) {
    markEventAsArchived(id: $id)
  }
`

export const COLLECT_DEATH_CERTIFICATE = gql`
  mutation markDeathAsCertified($id: ID!, $details: DeathRegistrationInput!) {
    markDeathAsCertified(id: $id, details: $details)
  }
`

export function getDeathMutation(status: IReadyStatus) {
  switch (status) {
    case SUBMISSION_STATUS.READY_TO_SUBMIT:
      return SUBMIT_DEATH_DECLARATION
    case SUBMISSION_STATUS.READY_TO_APPROVE:
      return APPROVE_DEATH_DECLARATION
    case SUBMISSION_STATUS.READY_TO_REGISTER:
      return REGISTER_DEATH_DECLARATION
    case SUBMISSION_STATUS.READY_TO_REJECT:
      return REJECT_DEATH_DECLARATION
    case SUBMISSION_STATUS.READY_TO_ARCHIVE:
      return ARCHIVE_DEATH_DECLARATION
    case SUBMISSION_STATUS.READY_TO_CERTIFY:
      return COLLECT_DEATH_CERTIFICATE
    case SUBMISSION_STATUS.READY_TO_REQUEST_CORRECTION:
      return REQUEST_DEATH_REG_CORRECTION
  }
}

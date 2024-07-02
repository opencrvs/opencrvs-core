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

export const CREATE_BIRTH_REG_CORRECTION = gql`
  mutation createBirthRegistrationCorrection(
    $id: ID!
    $details: BirthRegistrationInput!
  ) {
    createBirthRegistrationCorrection(id: $id, details: $details)
  }
`

export const CREATE_DEATH_REG_CORRECTION = gql`
  mutation createDeathRegistrationCorrection(
    $id: ID!
    $details: DeathRegistrationInput!
  ) {
    createDeathRegistrationCorrection(id: $id, details: $details)
  }
`
export const APPROVE_BIRTH_REG_CORRECTION = gql`
  mutation approveBirthRegistrationCorrection(
    $id: ID!
    $details: BirthRegistrationInput!
  ) {
    approveBirthRegistrationCorrection(id: $id, details: $details)
  }
`

export const APPROVE_DEATH_REG_CORRECTION = gql`
  mutation approveDeathRegistrationCorrection(
    $id: ID!
    $details: DeathRegistrationInput!
  ) {
    approveDeathRegistrationCorrection(id: $id, details: $details)
  }
`

export const REQUEST_REG_CORRECTION = gql`
  mutation requestRegistrationCorrection($id: ID!, $details: CorrectionInput!) {
    requestRegistrationCorrection(id: $id, details: $details)
  }
`

export const REJECT_REG_CORRECTION = gql`
  mutation rejectRegistrationCorrection(
    $id: ID!
    $details: CorrectionRejectionInput!
  ) {
    rejectRegistrationCorrection(id: $id, details: $details)
  }
`

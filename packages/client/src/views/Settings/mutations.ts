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

export const changePhoneMutation = gql`
  mutation changePhone(
    $userId: String!
    $phoneNumber: String!
    $nonce: String!
    $verifyCode: String!
  ) {
    changePhone(
      userId: $userId
      phoneNumber: $phoneNumber
      nonce: $nonce
      verifyCode: $verifyCode
    )
  }
`

export const changeEmailMutation = gql`
  mutation changeEmail(
    $userId: String!
    $email: String!
    $nonce: String!
    $verifyCode: String!
  ) {
    changeEmail(
      userId: $userId
      email: $email
      nonce: $nonce
      verifyCode: $verifyCode
    )
  }
`

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
import { gql } from '@apollo/client'
import { client } from '@client/utils/apolloClient'

export const GET_USER_BY_MOBILE = gql`
  query getUserByMobile($mobile: String) {
    getUserByMobile(mobile: $mobile) {
      id
      username
      mobile
      email
      systemRole
      role {
        _id
      }
      status
    }
  }
`

export const GET_USER_BY_EMAIL = gql`
  query getUserByEmail($email: String) {
    getUserByEmail(emailForNotification: $email) {
      id
      username
      mobile
      emailForNotification
      systemRole
      role {
        _id
      }
      status
    }
  }
`

async function fetchUserDetailsByMobile(mobile: string) {
  return (
    client &&
    client.query({
      query: GET_USER_BY_MOBILE,
      fetchPolicy: 'no-cache',
      variables: { mobile }
    })
  )
}

async function fetchUserDetailsByEmail(email: string) {
  return (
    client &&
    client.query({
      query: GET_USER_BY_EMAIL,
      fetchPolicy: 'no-cache',
      variables: { email }
    })
  )
}

export const queriesForUser = {
  fetchUserDetailsByMobile,
  fetchUserDetailsByEmail
}

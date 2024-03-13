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
import { client } from '@client/utils/apolloClient'

const GET_USER_BY_MOBILE = gql`
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

const GET_USER_BY_EMAIL = gql`
  query getUserByEmail($email: String) {
    getUserByEmail(email: $email) {
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

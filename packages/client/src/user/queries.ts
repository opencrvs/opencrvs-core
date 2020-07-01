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
import { client } from '@client/utils/apolloClient'
import { RefetchQueryDescription } from 'apollo-client/core/watchQueryOptions'

export const SEARCH_USERS = gql`
  query($count: Int, $skip: Int, $primaryOfficeId: String) {
    searchUsers(count: $count, skip: $skip, primaryOfficeId: $primaryOfficeId) {
      totalItems
      results {
        id
        name {
          use
          firstNames
          familyName
        }
        username
        role
        type
        status
        underInvestigation
      }
    }
  }
`

export const GET_USER = gql`
  query($userId: String) {
    getUser(userId: $userId) {
      id
      name {
        use
        firstNames
        familyName
      }
      username
      mobile
      identifier {
        system
        value
      }
      role
      type
      primaryOffice {
        id
        name
        alias
      }
      signature {
        type
        data
      }
    }
  }
`

export const USER_AUDIT_ACTION = gql`
  mutation auditUser(
    $userId: String!
    $action: String!
    $reason: String!
    $comment: String
  ) {
    auditUser(
      userId: $userId
      action: $action
      reason: $reason
      comment: $comment
    )
  }
`
async function searchUsers(primaryOfficeId: string) {
  return (
    client &&
    client.query({
      query: SEARCH_USERS,
      variables: { primaryOfficeId },
      fetchPolicy: 'no-cache'
    })
  )
}

export const userQueries = {
  searchUsers
}

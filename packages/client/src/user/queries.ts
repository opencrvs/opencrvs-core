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

export const SEARCH_USERS = gql`
  query searchUsers($count: Int, $skip: Int, $primaryOfficeId: String) {
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
        systemRole
        mobile
        email
        role {
          _id
        }
        status
        underInvestigation
        avatar {
          type
          data
        }
      }
    }
  }
`

export const GET_USER_AUDIT_LOG = gql`
  query getUserAuditLog(
    $practitionerId: String!
    $count: Int!
    $skip: Int!
    $timeStart: String
    $timeEnd: String
  ) {
    getUserAuditLog(
      practitionerId: $practitionerId
      count: $count
      skip: $skip
      timeStart: $timeStart
      timeEnd: $timeEnd
    ) {
      total
      results {
        ... on UserAuditLogItem {
          time
          userAgent
          practitionerId
          ipAddress
          action
        }
        ... on UserAuditLogItemWithComposition {
          time
          userAgent
          practitionerId
          ipAddress
          action
          data {
            compositionId
            trackingId
          }
        }
      }
    }
  }
`

export const GET_USER = gql`
  query getUser($userId: String) {
    getUser(userId: $userId) {
      id
      name {
        use
        firstNames
        familyName
      }
      username
      mobile
      email
      identifier {
        system
        value
      }
      systemRole
      role {
        _id
        labels {
          lang
          label
        }
      }
      status
      underInvestigation
      practitionerId
      primaryOffice {
        id
        name
        alias
      }
      catchmentArea {
        id
        name
        alias
        identifier {
          system
          value
        }
      }
      creationDate
      signature {
        type
        data
      }
      device
      avatar {
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

const VERIFY_PASSWORD_BY_ID = gql`
  query verifyPasswordById($id: String!, $password: String!) {
    verifyPasswordById(id: $id, password: $password) {
      id
      username
    }
  }
`

async function verifyPasswordById(id: string, password: string) {
  return (
    client &&
    client.query({
      query: VERIFY_PASSWORD_BY_ID,
      variables: { id, password },
      fetchPolicy: 'no-cache'
    })
  )
}
export const userQueries = {
  searchUsers,
  verifyPasswordById
}

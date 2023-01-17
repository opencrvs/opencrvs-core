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
import { ADVANCED_SEARCH_PARAM_FIELDS } from './mutations'

export const FETCH_USER = gql`
  ${ADVANCED_SEARCH_PARAM_FIELDS}
  query fetchUser($userId: String!) {
    getUser(userId: $userId) {
      userMgntUserID
      practitionerId
      mobile
      systemRole
      role
      status
      name {
        use
        firstNames
        familyName
      }
      catchmentArea {
        id
        name
        alias
        status
        identifier {
          system
          value
        }
      }
      primaryOffice {
        id
        name
        alias
        status
      }
      localRegistrar {
        name {
          use
          firstNames
          familyName
        }
        role
        signature {
          data
          type
        }
      }
      avatar {
        type
        data
      }
      searches {
        searchId
        name
        parameters {
          ...AdvancedSeachParameters
        }
      }
    }
  }
`

async function fetchUserDetails(userId: string) {
  return (
    client &&
    client.query({
      query: FETCH_USER,
      variables: { userId }
    })
  )
}

export const queries = {
  fetchUserDetails
}

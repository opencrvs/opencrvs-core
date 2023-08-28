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

export const getSystemRolesQuery = gql`
  query getSystemRoles($value: ComparisonInput) {
    getSystemRoles(active: true, value: $value) {
      id
      value
      roles {
        _id
        labels {
          lang
          label
        }
      }
    }
  }
`

export const updateRoleQuery = gql`
  mutation updateRole($systemRole: SystemRoleInput) {
    updateRole(systemRole: $systemRole) {
      roleIdMap
    }
  }
`
async function fetchRoles(criteria = {}) {
  return (
    client &&
    client.query({
      query: getSystemRolesQuery,
      variables: criteria,
      fetchPolicy: 'no-cache'
    })
  )
}

export const roleQueries = {
  fetchRoles
}

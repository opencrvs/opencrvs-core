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

export const registerSystem = gql`
  mutation registerSystem($system: SystemInput) {
    registerSystem(system: $system) {
      clientSecret
      system {
        _id
        clientId
        name
        shaSecret
        status
        type
      }
    }
  }
`

export const deactivateSystem = gql`
  mutation deactivateSystem($clientId: ID!) {
    deactivateSystem(clientId: $clientId) {
      _id
      clientId
      name
      shaSecret
      status
      type
    }
  }
`
export const activateSystem = gql`
  mutation reactivateSystem($clientId: ID!) {
    reactivateSystem(clientId: $clientId) {
      _id
      clientId
      name
      shaSecret
      status
      type
    }
  }
`
export const refreshClientSecret = gql`
  mutation refreshSystemClientSecret($clientId: String!) {
    refreshSystemClientSecret(clientId: $clientId) {
      clientSecret
      system {
        _id
        clientId
        name
        shaSecret
        status
        type
      }
    }
  }
`

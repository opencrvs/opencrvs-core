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
import { GQLResolver } from '@gateway/graphql/schema'
import fetch from 'node-fetch'
import { USER_MANAGEMENT_URL } from '@gateway/constants'
import { hasScope } from '@gateway/features/user/utils'

export const resolvers: GQLResolver = {
  Mutation: {
    async reactivateSystemClient(_, { clientDetails }, authHeader) {
      if (!hasScope(authHeader, 'sysadmin')) {
        return await Promise.reject(
          new Error('Activate user is only allowed for sysadmin')
        )
      }
      if (clientDetails?.client_id) {
        const res = await fetch(
          `${USER_MANAGEMENT_URL}reactivateSystemClient`,
          {
            method: 'POST',
            body: JSON.stringify(clientDetails),
            headers: {
              'Content-Type': 'application/json',
              ...authHeader
            }
          }
        )
        if (res.status == 200) {
          return await Promise.resolve({ message: 'User status activated' })
        }

        if (res.status !== 201) {
          return await Promise.reject(
            new Error(
              `Something went wrong on config service. Couldn't update application config`
            )
          )
        }
        return await res.json()
      } else {
        return {
          message: 'Client Id is required'
        }
      }
    },
    async deactivateSystemClient(_, { clientDetails }, authHeader) {
      if (!hasScope(authHeader, 'sysadmin')) {
        return await Promise.reject(
          new Error('Deactivate user is only allowed for sysadmin')
        )
      }
      if (clientDetails?.client_id) {
        const res = await fetch(
          `${USER_MANAGEMENT_URL}deactivateSystemClient`,
          {
            method: 'POST',
            body: JSON.stringify(clientDetails),
            headers: {
              'Content-Type': 'application/json',
              ...authHeader
            }
          }
        )
        if (res.status == 200) {
          return await Promise.resolve({ message: 'User status deactivated' })
        }

        if (res.status !== 201) {
          return await Promise.reject(
            new Error(
              `Something went wrong on config service. Couldn't update application config`
            )
          )
        }
        return await res.json()
      } else {
        return {
          message: 'Client Id is required'
        }
      }
    }
  }
}

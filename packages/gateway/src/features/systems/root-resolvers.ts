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
import { getSystem, hasScope } from '@gateway/features/user/utils'

export const resolvers: GQLResolver = {
  Mutation: {
    async reactivateSystem(_, { clientId }, authHeader) {
      if (!hasScope(authHeader, 'sysadmin')) {
        return new Error('Activate user is only allowed for sysadmin')
      }
      const res = await fetch(`${USER_MANAGEMENT_URL}reactivateSystem`, {
        method: 'POST',
        body: JSON.stringify({ clientId }),
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        }
      })

      if (res.status !== 200) {
        return new Error(
          `Something went wrong on user management service. Couldn't activate system`
        )
      }
      return res.json()
    },
    async deactivateSystem(_, { clientId }, authHeader) {
      if (!hasScope(authHeader, 'sysadmin')) {
        return await Promise.reject(
          new Error('Deactivate user is only allowed for sysadmin')
        )
      }
      const res = await fetch(`${USER_MANAGEMENT_URL}deactivateSystem`, {
        method: 'POST',
        body: JSON.stringify({ clientId }),
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        }
      })

      if (res.status !== 200) {
        return Promise.reject(
          new Error(
            `Something went wrong on user management service. Couldn't deactivate system`
          )
        )
      }
      return res.json()
    },
    async registerSystem(_, { system }, authHeader) {
      if (!hasScope(authHeader, 'sysadmin')) {
        return Promise.reject(
          new Error('Only sysadmin is allowed to create client')
        )
      }

      const res = await fetch(`${USER_MANAGEMENT_URL}registerSystem`, {
        method: 'POST',
        body: JSON.stringify(system),
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        }
      })

      if (res.status !== 201) {
        return await Promise.reject(
          new Error(
            `Something went wrong on user management service. Couldn't register new system`
          )
        )
      }
      return res.json()
    }
  },

  Query: {
    async fetchSystem(_, { clientId }, authHeader) {
      if (authHeader && !hasScope(authHeader, 'sysadmin')) {
        return await Promise.reject(
          new Error('Fetch integration is only allowed for sysadmin')
        )
      }

      return getSystem({ clientId }, authHeader)
    }
  }
}

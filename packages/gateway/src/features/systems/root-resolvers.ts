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
import { GQLResolver } from '@gateway/graphql/schema'
import fetch from '@gateway/fetch'
import { USER_MANAGEMENT_URL, WEBHOOKS_URL } from '@gateway/constants'
import { getSystem, hasScope } from '@gateway/features/user/utils'

export const resolvers: GQLResolver = {
  Mutation: {
    async reactivateSystem(_, { clientId }, { headers: authHeader }) {
      if (!hasScope(authHeader, 'natlsysadmin')) {
        return Promise.reject(
          new Error('Activate user is only allowed for natlsysadmin')
        )
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
    async deactivateSystem(_, { clientId }, { headers: authHeader }) {
      if (!hasScope(authHeader, 'natlsysadmin')) {
        return await Promise.reject(
          new Error('Deactivate user is only allowed for natlsysadmin')
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
    async registerSystem(_, { system }, { headers: authHeader }) {
      if (!hasScope(authHeader, 'natlsysadmin')) {
        return Promise.reject(
          new Error('Only natlsysadmin is allowed to create client')
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
    },
    async refreshSystemSecret(_, { clientId }, { headers: authHeader }) {
      if (!hasScope(authHeader, 'natlsysadmin')) {
        throw new Error('Only system user can update refresh client secret')
      }
      const res = await fetch(`${USER_MANAGEMENT_URL}refreshSystemSecret`, {
        method: 'POST',
        body: JSON.stringify({ clientId: clientId }),
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        }
      })
      if (res.status !== 200) {
        throw new Error(`No user details found by given clientId`)
      }

      return res.json()
    },
    async updatePermissions(_, { setting }, { headers: authHeader }) {
      if (!hasScope(authHeader, 'natlsysadmin')) {
        throw new Error('Only system user can update refresh client secret')
      }
      const res = await fetch(`${USER_MANAGEMENT_URL}updatePermissions`, {
        method: 'POST',
        body: JSON.stringify(setting),
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        }
      })
      if (res.status !== 200) {
        throw new Error(`Something went wrong`)
      }

      return res.json()
    },
    async deleteSystem(_, { clientId }, { headers: authHeader }) {
      if (!hasScope(authHeader, 'natlsysadmin')) {
        throw new Error('Only system user can delete the system')
      }
      const res = await fetch(`${USER_MANAGEMENT_URL}deleteSystem`, {
        method: 'POST',
        body: JSON.stringify({ clientId: clientId }),
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        }
      })
      if (res.status !== 200) {
        throw new Error(`No System found by given clientId`)
      }

      await fetch(`${WEBHOOKS_URL}deleteWebhooksByClientId`, {
        method: 'POST',
        body: JSON.stringify({ clientId: clientId }),
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        }
      })

      return res.json()
    }
  },

  Query: {
    async fetchSystem(_, { clientId }, { headers: authHeader }) {
      if (authHeader && !hasScope(authHeader, 'natlsysadmin')) {
        return await Promise.reject(
          new Error('Fetch integration is only allowed for natlsysadmin')
        )
      }

      return getSystem({ clientId }, authHeader)
    }
  }
}

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
import { USER_MANAGEMENT_URL } from '@gateway/constants'
import { IRoleSearchPayload } from '@gateway/features/role/type-resolvers'
import { transformMongoComparisonObject } from '@gateway/features/role/utils'
import { hasScope } from '@gateway/features/user/utils'

export const resolvers: GQLResolver = {
  Query: {
    async getSystemRoles(
      _,
      {
        title = null,
        value = null,
        role = null,
        active = null,
        sortBy = null,
        sortOrder = null
      },
      { headers: authHeader }
    ) {
      let payload: IRoleSearchPayload = {}
      if (title) {
        payload = { ...payload, title }
      }
      if (value) {
        payload = {
          ...payload,
          value: transformMongoComparisonObject(value)
        }
      }
      if (role) {
        payload = { ...payload, role }
      }
      if (sortBy) {
        payload = { ...payload, sortBy }
      }
      if (sortOrder) {
        payload = { ...payload, sortOrder }
      }
      if (active !== null) {
        payload = { ...payload, active }
      }
      const res = await fetch(`${USER_MANAGEMENT_URL}getSystemRoles`, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        }
      })
      return await res.json()
    }
  },
  Mutation: {
    async updateRole(_, { systemRole }, { headers: authHeader }) {
      if (!hasScope(authHeader, 'natlsysadmin')) {
        return Promise.reject(
          new Error(' Update Role is only allowed for natlsysadmin')
        )
      }
      const res = await fetch(`${USER_MANAGEMENT_URL}updateRole`, {
        method: 'POST',
        body: JSON.stringify(systemRole),
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        }
      })

      if (res.status !== 200) {
        return new Error(
          `Something went wrong on user management service. Couldn't update system role`
        )
      }
      return res.json()
    }
  }
}

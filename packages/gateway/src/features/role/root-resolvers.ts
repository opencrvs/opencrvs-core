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
import { IRoleSearchPayload } from '@gateway/features/role/type-resolvers'
import { transformMongoComparisonObject } from '@gateway/features/role/utils'

export const resolvers: GQLResolver = {
  Query: {
    async getRoles(
      _,
      {
        title = null,
        value = null,
        type = null,
        active = null,
        sortBy = null,
        sortOrder = null
      },
      authHeader
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
      if (type) {
        payload = { ...payload, type }
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
      const res = await fetch(`${USER_MANAGEMENT_URL}getRoles`, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        }
      })
      return await res.json()
    }
  }
}

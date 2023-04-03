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

import { APPLICATION_CONFIG_URL } from '@gateway/constants'
import { GQLResolver } from '@gateway/graphql/schema'
import fetch from 'node-fetch'

export const resolvers: GQLResolver = {
  Query: {
    async getFormDataset(_, {}, { headers: authHeader }) {
      const resp = await fetch(`${APPLICATION_CONFIG_URL}getFormDataset`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        }
      })

      return await resp.json()
    }
  },
  Mutation: {
    async createFormDataset(_, { formDataset }, { headers: authHeader }) {
      try {
        const resp = await fetch(`${APPLICATION_CONFIG_URL}createFormDataset`, {
          method: 'POST',
          body: JSON.stringify(formDataset),
          headers: {
            'Content-Type': 'application/json',
            ...authHeader
          }
        })

        const result = await resp.json()
        if (!result.status) throw Error(result.msg)
        return result
      } catch (ex) {
        throw Error(ex.message)
      }
    }
  }
}

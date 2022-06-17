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
import fetch from 'node-fetch'
import { APPLICATION_CONFIG_URL } from '@gateway/constants'
import { hasScope } from '@gateway/features/user/utils'
import { GQLResolver } from '@gateway/graphql/schema'

export const resolvers: GQLResolver = {
  Query: {
    async getFormDraft(_, {}, authHeader) {
      const res = await fetch(`${APPLICATION_CONFIG_URL}formDraft`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        }
      })
      return await res.json()
    }
  },

  Mutation: {
    async createFormDraft(_, { formDraft }, authHeader) {
      // Only natlsysadmin should be able to create a formDraft
      if (!hasScope(authHeader, 'natlsysadmin')) {
        return await Promise.reject(
          new Error(
            'Create or update form draft is only allowed for natlsysadmin'
          )
        )
      }
      const res = await fetch(`${APPLICATION_CONFIG_URL}formDraft`, {
        method: 'POST',
        body: JSON.stringify(formDraft),
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        }
      })

      if (res.status !== 201) {
        return await Promise.reject(
          new Error(
            `Something went wrong on config service. Couldn't mofify form draft`
          )
        )
      }
      return await res.json()
    },

    async modifyDraftStatus(_, { formDraft }, authHeader) {
      // Only natlsysadmin should be able to modify a formDraft
      if (!hasScope(authHeader, 'natlsysadmin')) {
        return await Promise.reject(
          new Error(
            'Modifying form draft status is only allowed for natlsysadmin'
          )
        )
      }

      const res = await fetch(`${APPLICATION_CONFIG_URL}formDraft`, {
        method: 'PUT',
        body: JSON.stringify(formDraft),
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        }
      })

      if (res.status !== 201) {
        return await Promise.reject(
          new Error(
            `Something went wrong on config service. Couldn't update form draft status`
          )
        )
      }
      return await res.json()
    },

    async deleteFormDraft(_, { formDraft }, authHeader) {
      // Only natlsysadmin should be able to delete a formDraft
      if (!hasScope(authHeader, 'natlsysadmin')) {
        return await Promise.reject(
          new Error('Deleting form draft is only allowed for natlsysadmin')
        )
      }
      const res = await fetch(`${APPLICATION_CONFIG_URL}formDraft`, {
        method: 'DELETE',
        body: JSON.stringify(formDraft),
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        }
      })

      if (res.status !== 204) {
        return await Promise.reject(
          new Error(
            `Something went wrong on config service. Couldn't delete form draft`
          )
        )
      }
      return formDraft.event
    }
  }
}

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
import fetch from '@gateway/fetch'
import { inScope } from '@gateway/features/user/utils'
import { GQLResolver } from '@gateway/graphql/schema'
import { USER_MANAGEMENT_URL } from '@gateway/constants'

export const resolvers: GQLResolver = {
  Mutation: {
    async bookmarkAdvancedSearch(
      _,
      { bookmarkSearchInput },
      { headers: authHeader }
    ) {
      // Only registrar or registration agent should be able to search user
      if (!inScope(authHeader, ['register', 'validate'])) {
        return await Promise.reject(
          new Error(
            'Advanced search is only allowed for registrar or registration agent'
          )
        )
      }

      const res = await fetch(`${USER_MANAGEMENT_URL}searches`, {
        method: 'POST',
        body: JSON.stringify(bookmarkSearchInput),
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        }
      })

      if (res.status !== 201) {
        return await Promise.reject(
          new Error(
            `Something went wrong on user management service. Couldn't bookmark advanced search.`
          )
        )
      }
      const response = await res.json()
      return response
    },
    async removeBookmarkedAdvancedSearch(
      _,
      { removeBookmarkedSearchInput },
      { headers: authHeader }
    ) {
      // Only registrar or registration agent should be able to search user
      if (!inScope(authHeader, ['register', 'validate'])) {
        return await Promise.reject(
          new Error(
            'Advanced search is only allowed for registrar or registration agent'
          )
        )
      }

      const removeBookmarkedSearchPayload = {
        userId: removeBookmarkedSearchInput.userId,
        searchId: removeBookmarkedSearchInput.searchId
      }

      const res = await fetch(`${USER_MANAGEMENT_URL}searches`, {
        method: 'DELETE',
        body: JSON.stringify(removeBookmarkedSearchPayload),
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        }
      })

      if (res.status !== 200) {
        return await Promise.reject(
          new Error(
            `Something went wrong on user management service. Couldn't unbookmarked advanced search.`
          )
        )
      }
      const response = res.json()
      return await response
    }
  }
}

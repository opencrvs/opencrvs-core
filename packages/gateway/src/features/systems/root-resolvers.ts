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
import { hasScope } from '@gateway/features/user/utils'
import { SCOPES } from '@opencrvs/commons/authentication'
import {
  getSystemScopesFromType,
  getInMemoryEventConfigurations,
  isValidSystemIntegrationType
} from './scopes'
import { api } from '@gateway/v2-events/events/service'

export const resolvers: GQLResolver = {
  Mutation: {
    async registerSystem(_, { system }, { headers: authHeader }) {
      if (!hasScope(authHeader, SCOPES.CONFIG_UPDATE_ALL)) {
        return Promise.reject(new Error('User is not allowed to create client'))
      }

      const { type, name } = system!

      // Validate the type
      if (!isValidSystemIntegrationType(type)) {
        throw new Error(`Invalid system integration type: ${type}`)
      }

      // Get event configurations to build configurable scopes
      const eventConfigurations =
        await getInMemoryEventConfigurations(authHeader)
      const eventIds = eventConfigurations.map((config) => config.id)

      // Convert type to scopes
      const scopes = getSystemScopesFromType(type, eventIds)

      // Call events service integrations.create via TRPC
      const result = await api.integrations.create.mutate(
        { name, scopes },
        { context: { headers: authHeader } }
      )

      return result
    }
  }
}

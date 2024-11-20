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
import { type AppRouter } from '@opencrvs/events/src/router'
import { createTRPCClient, httpBatchLink } from '@trpc/client'

import superjson from 'superjson'

const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:5555',
      transformer: superjson
    })
  ]
})
export const resolvers: GQLResolver = {
  Query: {
    async getEvent(_, { eventId }, { headers: authHeader }) {
      return trpc.getEvent.query(eventId)
    }
  },
  Mutation: {
    async createEvent(_, { eventInput }, { headers: authHeader }) {
      const event = await trpc.createEvent.mutate({
        event: eventInput,
        transactionId: '@todo'
      })

      return { id: event.id }
    }
  }
}

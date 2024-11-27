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
import { env } from '@gateway/environment'
import { GQLResolver } from '@gateway/graphql/schema'
import type { AppRouter } from '@opencrvs/events/src/router'
import { createTRPCClient, httpBatchLink, HTTPHeaders } from '@trpc/client'

import superjson from 'superjson'
import uuid from 'uuid'

const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: env.EVENTS_URL,
      transformer: superjson,
      headers({ opList }) {
        const headers = opList[0].context?.headers
        return headers as HTTPHeaders
      }
    })
  ]
})

export const resolvers: GQLResolver = {
  Query: {
    async getEvent(_, { eventId }, { headers }) {
      return trpc.event.get.query(eventId, { context: { headers } })
    }
  },
  Mutation: {
    async createEvent(_, { event }, { headers }) {
      const createdEvent = await trpc.event.create.mutate(
        {
          type: event.type,
          transactionId: uuid.v4()
        },
        { context: { headers } }
      )
      return createdEvent
    },
    async notifyEvent(_, { eventId, input }, { headers }) {
      return trpc.event.actions.notify.mutate(
        {
          eventId: eventId,
          type: 'NOTIFY',
          data: input.data,
          createdAtLocation: '123',
          transactionId: uuid.v4()
        },
        { context: { headers } }
      )
    },
    async declareEvent(_, { eventId, input }, { headers }) {
      const data = await trpc.event.actions.declare.mutate(
        {
          eventId: eventId,
          data: Object.fromEntries(input.data.map((d) => [d.id, d.value])),
          transactionId: uuid.v4()
        },
        { context: { headers } }
      )

      return data
    }
  }
}

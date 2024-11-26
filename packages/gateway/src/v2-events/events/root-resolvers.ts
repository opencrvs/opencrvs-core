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
    async getEvent(_, { eventId }, { headers: authHeader }) {
      return trpc.event.get.query(eventId)
    }
  },
  Mutation: {
    async createEvent(_, { event }, { headers }) {
      const createdEvent = await trpc.event.create.mutate(
        {
          type: event.type,
          fields: [],
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
          fields: input.fields,
          transactionId: uuid.v4()
        },
        { context: { headers } }
      )
    },
    async declareEvent(_, { eventId, input }, { headers }) {
      return trpc.event.actions.declare.mutate(
        {
          eventId: eventId,
          type: 'DECLARE',
          fields: input.fields,
          transactionId: uuid.v4()
        },
        { context: { headers } }
      )
    }
  }
}

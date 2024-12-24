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

import uuid from 'uuid'
import { api } from './service'

export const resolvers: GQLResolver = {
  Query: {
    async getEvent(_, { eventId }, { headers }) {
      return api.event.get.query(eventId, { context: { headers } })
    }
  },
  Mutation: {
    async createEvent(_, { event }, { headers }) {
      const createdEvent = await api.event.create.mutate(
        {
          type: event.type,
          transactionId: uuid.v4()
        },
        { context: { headers } }
      )
      return createdEvent
    },
    async notifyEvent(_, { eventId, input }, { headers }) {
      return api.event.actions.notify.mutate(
        {
          eventId: eventId,
          data: Object.fromEntries(input.data.map((d) => [d.id, d.value])),
          createdAtLocation: '123',
          transactionId: uuid.v4()
        },
        { context: { headers } }
      )
    },
    async declareEvent(_, { eventId, input }, { headers }) {
      const data = await api.event.actions.declare.mutate(
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

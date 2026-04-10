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
import { UUID } from '@opencrvs/commons'
import { createTRPCClient, httpBatchLink } from '@trpc/client'
import superjson from 'superjson'
import { env } from '@user-mgnt/environment'
import { AppRouter } from '@opencrvs/events/src/router'

function getEventsClient(token: string) {
  return createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: env.EVENTS_URL,
        transformer: superjson,
        headers: { Authorization: token }
      })
    ]
  })
}

export async function resolveLocationChildren(locationId: UUID, token: string) {
  const client = getEventsClient(token)
  const locations = await client.locations.list.query()
  return locations
    .filter((location) => location.administrativeAreaId === locationId)
    .map((location) => location.id)
}

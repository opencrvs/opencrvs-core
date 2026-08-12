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

/** Lives here rather than in `./index`, which runs the seed at import time:
 * importing a seeding module for this factory would otherwise authenticate,
 * seed and deactivate the superuser. */
import superjson from 'superjson'
import { createTRPCClient, httpLink } from '@trpc/client'
import { env } from './environment'
import type { InitialisationRouter } from '@opencrvs/events/src/router'

export const createInitialisationClient = (token: string) => {
  return createTRPCClient<InitialisationRouter>({
    links: [
      httpLink({
        url: new URL('events/initialisation/', env.GATEWAY_HOST).href,
        transformer: superjson,
        async headers() {
          return { authorization: `Bearer ${token}` }
        }
      })
    ]
  })
}

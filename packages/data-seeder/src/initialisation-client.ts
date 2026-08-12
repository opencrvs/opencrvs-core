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

/**
 * The client every seeding module talks to core through.
 *
 * It lives here rather than in `./index` because `./index` runs the seed at
 * import time: while the seeding modules imported it for this factory,
 * importing any of them authenticated against a live gateway, seeded, and
 * deactivated the superuser. Keeping the factory out of the entry point is
 * what makes the package importable by a test at all — see
 * `./importable.test.ts`.
 */
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

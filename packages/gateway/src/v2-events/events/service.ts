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
import { jsonTransformer } from '@opencrvs/commons/events'
import { AppRouter } from './router'
import { env } from '@gateway/environment'

import { createTRPCClient, httpLink, HTTPHeaders } from '@trpc/client'

export const api = createTRPCClient<AppRouter>({
  links: [
    // One request for each call: gateway calls events for many users at once,
    // and a batch would send all its calls with the headers of the first one.
    httpLink({
      url: env.EVENTS_URL,
      transformer: jsonTransformer,
      headers({ op }) {
        // A call without context, e.g. for public configuration, sends none.
        return (op.context?.headers ?? {}) as HTTPHeaders
      }
    })
  ]
})

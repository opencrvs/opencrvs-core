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
import { AppRouter } from './router'
import { env } from '@gateway/environment'

import { createTRPCClient, httpBatchLink, HTTPHeaders } from '@trpc/client'

import superjson from 'superjson'

export const api = createTRPCClient<AppRouter>({
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

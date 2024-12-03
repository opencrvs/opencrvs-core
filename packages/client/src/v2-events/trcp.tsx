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
import React from 'react'
import { createTRPCReact } from '@trpc/react-query'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpBatchLink } from '@trpc/client'
import superjson from 'superjson'
import type { AppRouter } from '@gateway/v2-events/events/router'
import { getToken } from '@client/utils/authUtils'

export const trpc = createTRPCReact<AppRouter>()

let queryClient: QueryClient
let trpcClient: ReturnType<typeof trpc.createClient>

const getTrpcClient = () => {
  if (!trpcClient) {
    trpcClient = trpc.createClient({
      links: [
        httpBatchLink({
          url: '/api/events',
          transformer: superjson,
          async headers() {
            return {
              authorization: `Bearer ${getToken()}`
            }
          }
        })
      ]
    })
  }

  return trpcClient
}

const getQueryClient = () => {
  if (!queryClient) {
    queryClient = new QueryClient()
  }

  return queryClient
}

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const trpcClient = getTrpcClient()
  const queryClient = getQueryClient()
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  )
}

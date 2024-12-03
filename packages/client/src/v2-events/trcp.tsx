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
import { storage } from '@client/storage'
import { getToken } from '@client/utils/authUtils'
import type { AppRouter } from '@gateway/v2-events/events/router'
import { QueryClient } from '@tanstack/react-query'
import {
  PersistQueryClientProvider,
  type PersistedClient,
  type Persister
} from '@tanstack/react-query-persist-client'
import { httpLink, loggerLink } from '@trpc/client'
import { createTRPCQueryUtils, createTRPCReact } from '@trpc/react-query'
import React, { useEffect } from 'react'
import superjson from 'superjson'
import { preloadData } from './features/events/useEvents'

export const api = createTRPCReact<AppRouter>()

const getTrpcClient = () => {
  return api.createClient({
    links: [
      httpLink({
        url: '/api/events',
        transformer: superjson,
        async headers() {
          return {
            authorization: `Bearer ${getToken()}`
          }
        }
      }),
      loggerLink({
        enabled: (op) =>
          process.env.NODE_ENV === 'development' ||
          (op.direction === 'down' && op.result instanceof Error)
      })
    ]
  })
}

const getQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {}
    }
  })
}

function createIDBPersister(idbValidKey = 'reactQuery') {
  return {
    persistClient: async (client: PersistedClient) => {
      await storage.setItem(idbValidKey, client)
    },
    restoreClient: async () => {
      return (await storage.getItem<PersistedClient>(idbValidKey)) || undefined
    },
    removeClient: async () => {
      await storage.removeItem(idbValidKey)
    }
  } satisfies Persister
}

const trpcClient = getTrpcClient()
const queryClient = getQueryClient()

export const utils = createTRPCQueryUtils({ queryClient, client: trpcClient })

const persister = createIDBPersister()

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    preloadData()
  }, [])

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 1000 * 60 * 60 * 4,
        buster: 'persisted-indexed-db'
      }}
    >
      <api.Provider client={trpcClient} queryClient={queryClient}>
        {children}
      </api.Provider>
    </PersistQueryClientProvider>
  )
}

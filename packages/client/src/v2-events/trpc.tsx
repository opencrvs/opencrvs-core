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
import React from 'react'
import superjson from 'superjson'

export const api = createTRPCReact<AppRouter>()

const getTrpcClient = () => {
  return api.createClient({
    links: [
      loggerLink({
        enabled: (op) =>
          process.env.NODE_ENV === 'development' ||
          (op.direction === 'down' && op.result instanceof Error)
      }),
      httpLink({
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

const getQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: Infinity,
        retry: 1
      },
      mutations: {
        gcTime: Infinity,
        retry: 1
      }
    }
  })
}

function createIDBPersister(idbValidKey = 'reactQuery') {
  return {
    persistClient: async (client: PersistedClient) => {
      await storage.setItem(idbValidKey, client)
    },
    restoreClient: async () => {
      const client = await storage.getItem<PersistedClient>(idbValidKey)
      return client || undefined
    },
    removeClient: async () => {
      await storage.removeItem(idbValidKey)
    }
  } satisfies Persister
}

const trpcClient = getTrpcClient()
const persister = createIDBPersister()

export const queryClient = getQueryClient()

export const utils = createTRPCQueryUtils({ queryClient, client: trpcClient })

utils.event.create.setMutationDefaults(({ canonicalMutationFn }) => ({
  mutationFn: canonicalMutationFn
}))

utils.event.actions.declare.setMutationDefaults(({ canonicalMutationFn }) => ({
  mutationFn: canonicalMutationFn
}))

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      onSuccess={async () => {
        queryClient.resumePausedMutations()

        queryClient
          .getMutationCache()
          .getAll()
          .map((m) => m.continue())
      }}
      persistOptions={{
        persister,
        maxAge: 1000 * 60 * 60 * 4,
        buster: 'persisted-indexed-db',
        dehydrateOptions: {
          shouldDehydrateMutation: (mut) => {
            return mut.state.status !== 'success'
          }
        }
      }}
    >
      <api.Provider client={trpcClient} queryClient={queryClient}>
        {children}
      </api.Provider>
    </PersistQueryClientProvider>
  )
}

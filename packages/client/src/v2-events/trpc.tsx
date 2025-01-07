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
import type { AppRouter } from '@gateway/v2-events/events/router'
import { QueryClient } from '@tanstack/react-query'
import {
  PersistQueryClientProvider,
  type PersistedClient,
  type Persister
} from '@tanstack/react-query-persist-client'
import { httpLink, loggerLink, TRPCClientError } from '@trpc/client'
import { createTRPCQueryUtils, createTRPCReact } from '@trpc/react-query'
import React from 'react'
import superjson from 'superjson'

import { storage } from '@client/storage'
import { getToken } from '@client/utils/authUtils'

export const api = createTRPCReact<AppRouter>()

function getTrpcClient() {
  return api.createClient({
    links: [
      loggerLink({
        enabled: (op) => op.direction === 'down' && op.result instanceof Error
      }),
      httpLink({
        url: '/api/events',
        transformer: superjson,
        headers() {
          return {
            authorization: `Bearer ${getToken()}`
          }
        }
      })
    ]
  })
}

function getQueryClient() {
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

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: undefined,
        buster: 'persisted-indexed-db',
        dehydrateOptions: {
          shouldDehydrateMutation: (mutation) => {
            if (mutation.state.status === 'error') {
              const error = mutation.state.error
              if (error instanceof TRPCClientError && error.data?.httpStatus) {
                return !error.data.httpStatus.toString().startsWith('4')
              }
              return true
            }

            return mutation.state.status !== 'success'
          }
        }
      }}
      onSuccess={async () => {
        await queryClient.resumePausedMutations()

        queryClient
          .getMutationCache()
          .getAll()
          .map(async (m) => m.continue())
      }}
    >
      <api.Provider client={trpcClient} queryClient={queryClient}>
        {children}
      </api.Provider>
    </PersistQueryClientProvider>
  )
}

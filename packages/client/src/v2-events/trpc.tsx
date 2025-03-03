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
import {
  createTRPCClient,
  httpLink,
  loggerLink,
  TRPCClientError
} from '@trpc/client'
import {
  createTRPCContext,
  createTRPCOptionsProxy
} from '@trpc/tanstack-react-query'
import React from 'react'
import superjson from 'superjson'
import { storage } from '@client/storage'
import { getToken } from '@client/utils/authUtils'

const { TRPCProvider: TRPCProviderRaw, useTRPC } =
  createTRPCContext<AppRouter>()

export { AppRouter, useTRPC }

function getTrpcClient() {
  return createTRPCClient<AppRouter>({
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

const persister = createIDBPersister()

export const trpcClient = getTrpcClient()

export const queryClient = getQueryClient()
export const utils = createTRPCOptionsProxy({ queryClient, client: trpcClient })

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
            console.log('dehdrate mutation', mutation)
            if (mutation.state.status === 'error') {
              const error = mutation.state.error
              if (error instanceof TRPCClientError && error.data?.httpStatus) {
                return !error.data.httpStatus.toString().startsWith('4')
              }

              console.log('should dehydrate true')
              return true
            }

            console.log('should dehydrate state', mutation.state.status)
            return mutation.state.status !== 'success'
          }
        }
      }}
      onSuccess={async () => {
        console.log('foo-bar')
        console.log('queryClient', queryClient)
        try {
          console.log('1')
          await queryClient.resumePausedMutations().finally(() => {
            console.log('jj')
          })
          console.log('2')
        } catch (err) {
          console.log('err', err)
        }

        const mutations = queryClient.getMutationCache().getAll()

        console.log('mutations', mutations)

        for (const mutation of mutations) {
          console.log('mutation', mutation)
          await mutation.continue()
        }
      }}
    >
      <TRPCProviderRaw queryClient={queryClient} trpcClient={trpcClient}>
        {children}
      </TRPCProviderRaw>
    </PersistQueryClientProvider>
  )
}

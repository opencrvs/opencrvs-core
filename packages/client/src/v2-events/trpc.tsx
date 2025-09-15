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
import { onlineManager, QueryClient } from '@tanstack/react-query'
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
import { useSelector } from 'react-redux'
import { storage } from '@client/storage'
import { getToken } from '@client/utils/authUtils'
import { getUserDetails } from '@client/profile/profileSelectors'

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

function createIDBPersister(storageIdentifier: string) {
  const fullStorageIdentifier = `react-query-${storageIdentifier}`
  return {
    persistClient: async (client) => {
      await storage.setItem(fullStorageIdentifier, client)
    },
    restoreClient: async () => {
      const client = await storage.getItem<PersistedClient>(
        fullStorageIdentifier
      )
      return client || undefined
    },
    removeClient: async () => {
      await storage.removeItem(fullStorageIdentifier)
    }
  } satisfies Persister
}

export const trpcClient = getTrpcClient()

export const queryClient = getQueryClient()
export const trpcOptionsProxy = createTRPCOptionsProxy({
  queryClient,
  client: trpcClient
})

export function TRPCProvider({
  children,
  /*
   * Should never be "false" outside test environments where we might want to get access
   * to the query client before the client is restored from the persisted storage.
   */
  waitForClientRestored = true,
  storeIdentifier = 'DEFAULT_IDENTIFIER_FOR_TESTS_ONLY__THIS_SHOULD_NEVER_SHOW_OUTSIDE_STORYBOOK'
}: {
  children: React.ReactNode
  storeIdentifier?: string
  waitForClientRestored?: boolean
}) {
  const [queriesRestored, setQueriesRestored] = React.useState(false)

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: createIDBPersister(storeIdentifier),
        buster: 'persisted-indexed-db',
        maxAge: undefined,
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
          },
          shouldDehydrateQuery: (query) => {
            // Stale time compares the values through a function like this: Math.max(updatedAt + (staleTime || 0) - Date.now(), 0);
            // If the result is > 0, the query is fresh, otherwise it's stale. The main point goal is to avoid dehydrating large amounts of data (say locations) which will block the thread constantly (every second by default)
            // @ts-expect-error - staleTime is not recognized for some reason, even when it's available through trpc.
            if (query.isStaleByTime(query.options.staleTime)) {
              return true
            }

            return false
          }
        }
      }}
      onSuccess={async () => {
        setQueriesRestored(true)
        await queryClient.resumePausedMutations()

        const mutations = queryClient.getMutationCache().getAll()

        for (const mutation of mutations) {
          await mutation.continue()
        }
      }}
    >
      <TRPCProviderRaw queryClient={queryClient} trpcClient={trpcClient}>
        {!waitForClientRestored || queriesRestored ? children : null}
      </TRPCProviderRaw>
    </PersistQueryClientProvider>
  )
}

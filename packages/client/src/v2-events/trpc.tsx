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
import partition from 'lodash-es/partition'
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

function createIDBPersister(storageIdentifier: string) {
  const fullStorageIdentifier = `react-query-${storageIdentifier}`
  const largeQueryStorageIdentifier = `react-query-large-query-${storageIdentifier}`

  /** In-memory representation of the persisted large queries. Map<hashKey, timestamp>. */
  const lastPersistedLargeQueries = new Map<string, number>()

  return {
    /** By default, client is persisted whenever a query/mutation occurs */
    persistClient: async (client) => {
      /* 1. Since queries are persisted frequently, we separate out the ones that are flagged as large.
       * Serializing data is a synchronous process and freezes the client, so we want to minimise how often it happens.
       * For large payloads, ensure staleTime is set for queries to avoid frequent updates.
       */
      const [largeQueries, normalQueries] = partition(
        client.clientState.queries,
        (query) => query.meta?.useLargeQueryStorage === true
      )

      const clientWithoutLargeQueries = {
        ...client,
        clientState: {
          ...client.clientState,
          queries: normalQueries
        }
      }

      // 2. Persist the main client without large queries
      await storage.setItem(fullStorageIdentifier, clientWithoutLargeQueries)

      // 3. Persist large queries only if they have changed since the last persist to avoid unnecessary serialization.
      const changed = largeQueries.some((q) => {
        const last = lastPersistedLargeQueries.get(q.queryHash) ?? 0
        return q.state.dataUpdatedAt > last
      })

      if (changed) {
        for (const q of largeQueries) {
          lastPersistedLargeQueries.set(q.queryHash, q.state.dataUpdatedAt)
        }

        await storage.setItem(largeQueryStorageIdentifier, largeQueries)
      }
    },

    /** Restore client from storage on page change / refresh. Expected to happen more rarely. */
    restoreClient: async () => {
      const client = await storage.getItem<PersistedClient>(
        fullStorageIdentifier
      )

      if (!client) {
        return undefined
      }

      const largeQueries = await storage.getItem<
        PersistedClient['clientState']['queries']
      >(largeQueryStorageIdentifier)

      // 4. Re-attach large queries to the client to provide consistent state.
      if (largeQueries) {
        return {
          ...client,
          clientState: {
            ...client.clientState,
            queries: [...client.clientState.queries, ...largeQueries]
          }
        }
      }

      return client
    },
    removeClient: async () => {
      await storage.removeItem(fullStorageIdentifier)
      await storage.removeItem(largeQueryStorageIdentifier)
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

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
import {
  ApolloClient,
  InMemoryCache,
  ApolloLink,
  from,
  createHttpLink,
  NormalizedCacheObject
} from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import { showSessionExpireConfirmation } from '@client/notification/actions'

import { IStoreState } from '@client/store'
import { AnyAction, Store } from 'redux'
// eslint-disable-next-line no-restricted-imports
import * as Sentry from '@sentry/react'
import TimeoutLink from '@client/utils/timeoutLink'
import * as React from 'react'
import { CachePersistor, LocalForageWrapper } from 'apollo3-cache-persist'
import localforage from 'localforage'
import {
  createPersistLink,
  persistenceMapper,
  clearOldCacheEntries
} from '@client/utils/persistence'

export let client: ApolloClient<NormalizedCacheObject>

export const createClient = (
  store: Store<IStoreState, AnyAction>,
  restoredCache?: InMemoryCache
) => {
  const httpLink = createHttpLink({
    uri: new URL('graphql', window.config.API_GATEWAY_URL).toString()
  })

  const authLink = setContext((_, { headers }) => {
    const token = localStorage.getItem('opencrvs')
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : ''
      }
    }
  })

  const errorLink = onError((error: any) => {
    if (
      (error.networkError &&
        error.networkError.statusCode &&
        error.networkError.statusCode === 401) ||
      (error.graphQLErrors &&
        error.graphQLErrors[0] &&
        error.graphQLErrors[0].extensions &&
        error.graphQLErrors[0].extensions.code &&
        error.graphQLErrors[0].extensions.code === 'UNAUTHENTICATED')
    ) {
      store.dispatch(showSessionExpireConfirmation())
    } else if (error.graphQLErrors?.[0]?.extensions?.code === 'UNASSIGNED') {
      return error.forward(error.operation)
    } else {
      Sentry.captureException(error)
    }
  })

  const timeoutLink = new TimeoutLink() as ApolloLink
  const persistLink = createPersistLink()
  const cache = restoredCache || new InMemoryCache()

  client = new ApolloClient({
    link: from([errorLink, timeoutLink, authLink, persistLink, httpLink]),
    cache
  })
  return client
}

async function createPersistentClient(store: Store<IStoreState, AnyAction>) {
  const cache = new InMemoryCache()
  const newPersistor = new CachePersistor({
    cache,
    storage: new LocalForageWrapper(localforage),
    trigger: 'write',
    persistenceMapper
  })
  await newPersistor.restore()
  return {
    client: createClient(store, cache),
    persistor: newPersistor
  }
}

export function useApolloClient(store: Store<IStoreState, AnyAction>) {
  const [client, setClient] =
    React.useState<ApolloClient<NormalizedCacheObject> | null>(null)
  const [persistor, setPersistor] =
    React.useState<CachePersistor<NormalizedCacheObject>>()
  const clearCache = React.useCallback(() => {
    if (!persistor) {
      return
    }
    persistor.purge()
  }, [persistor])

  React.useEffect(() => {
    async function init() {
      const { client, persistor } = await createPersistentClient(store)
      setPersistor(persistor)
      setClient(client)
      clearOldCacheEntries(client.cache)
    }

    // skipping the persistent client in tests for now
    if (import.meta.env.MODE !== 'test') {
      init()
    }
  }, [store])

  return {
    client,
    clearCache
  }
}

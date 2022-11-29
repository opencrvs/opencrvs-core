/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import {
  ApolloClient,
  InMemoryCache,
  ApolloLink,
  from,
  createHttpLink
} from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import { resolve } from 'url'
import { showSessionExpireConfirmation } from '@client/notification/actions'

import { IStoreState } from '@client/store'
import { AnyAction, Store } from 'redux'
// eslint-disable-next-line no-restricted-imports
import * as Sentry from '@sentry/react'
import TimeoutLink from '@client/utils/timeoutLink'

export let client: any = { mutate: () => {} }

export const createClient = (store: Store<IStoreState, AnyAction>) => {
  const httpLink = createHttpLink({
    uri: resolve(window.config.API_GATEWAY_URL, 'graphql')
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

  client = new ApolloClient({
    link: from([errorLink, timeoutLink, authLink, httpLink]),
    cache: new InMemoryCache()
  })
  return client
}

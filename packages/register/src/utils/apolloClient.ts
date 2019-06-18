import ApolloClient from 'apollo-client'
import { setContext } from 'apollo-link-context'
import { ApolloLink, from } from 'apollo-link'
import { createHttpLink } from 'apollo-link-http'
import {
  InMemoryCache,
  IntrospectionFragmentMatcher
} from 'apollo-cache-inmemory'
import { resolve } from 'url'
import { onError } from 'apollo-link-error'
import { showSessionExpireConfirmation } from '@register/notification/actions'

import { IStoreState } from '@register/store'
import { AnyAction, Store } from 'redux'
import * as Sentry from '@sentry/browser'
import TimeoutLink from '@register/utils/timeoutLink'

export let client: any
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
      error &&
      error.networkError &&
      error.networkError.statusCode &&
      error.networkError.statusCode === 401
    ) {
      store.dispatch(showSessionExpireConfirmation())
    } else {
      Sentry.captureException(error)
    }
  })

  const timeoutLink = new TimeoutLink() as ApolloLink
  /*
  Use IntrospectionFragmentMatcher to remove the warning of using inteface in GraphQL Query
  This change is suggested in the following link:
  https://www.apollographql.com/docs/react/advanced/fragments.html#fragment-matcher
   */
  const fragmentMatcher = new IntrospectionFragmentMatcher({
    introspectionQueryResultData: {
      __schema: {
        types: [] // no types provided
      }
    }
  })
  client = new ApolloClient({
    link: from([errorLink, timeoutLink, authLink, httpLink]),
    cache: new InMemoryCache({ fragmentMatcher })
  })
  return client
}

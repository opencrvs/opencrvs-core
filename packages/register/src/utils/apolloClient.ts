import ApolloClient from 'apollo-client'
import { setContext } from 'apollo-link-context'
import { createHttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { resolve } from 'url'
import { config } from 'src/config'
import { onError } from 'apollo-link-error'
import { showSessionExpireConfirmation } from 'src/notification/actions'
import { from } from 'apollo-link'
import { IStoreState } from 'src/store'
import { AnyAction, Store } from 'redux'

export let client: any
export const createClient = (store: Store<IStoreState, AnyAction>) => {
  const httpLink = createHttpLink({
    uri: resolve(config.API_GATEWAY_URL, 'graphql')
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
    if (error.networkError.statusCode === 401) {
      store.dispatch(showSessionExpireConfirmation())
    }
  })

  client = new ApolloClient({
    link: from([errorLink, authLink, httpLink]),
    cache: new InMemoryCache()
  })
  return client
}

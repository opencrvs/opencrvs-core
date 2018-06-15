import * as React from 'react'

import { graphql, print } from 'graphql'
import ApolloClient from 'apollo-client'
import { ApolloLink, Observable } from 'apollo-link'
import { InMemoryCache } from 'apollo-cache-inmemory'

import { mount, configure } from 'enzyme'
import * as Adapter from 'enzyme-adapter-react-16'

import { App } from '../App'
import { getSchema } from './graphql-schema-mock'

configure({ adapter: new Adapter() })

function createGraphQLClient() {
  const schema = getSchema()

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new ApolloLink(operation => {
      return new Observable(observer => {
        const { query, operationName, variables } = operation

        graphql(schema, print(query), null, null, variables, operationName)
          .then(result => {
            observer.next(result)
            observer.complete()
          })
          .catch(observer.error.bind(observer))
      })
    })
  })
}

export function createTestApp() {
  return mount(<App client={createGraphQLClient()} />)
}

import * as React from 'react'

import { Provider } from 'react-redux'
import { graphql, print } from 'graphql'
import ApolloClient from 'apollo-client'

import { ApolloLink, Observable } from 'apollo-link'
import { IStoreState, createStore } from '../store'
import { InMemoryCache } from 'apollo-cache-inmemory'
import * as en from 'react-intl/locale-data/en'
import { mount, configure, shallow } from 'enzyme'
import * as Adapter from 'enzyme-adapter-react-16'
import { addLocaleData, IntlProvider, intlShape } from 'react-intl'
import { App } from '../App'
import { getSchema } from './graphql-schema-mock'
import { ThemeProvider } from 'styled-components'
import { ENGLISH_STATE } from '../i18n/locales/en'
import { getTheme } from '@opencrvs/components/lib/theme'
import { config } from '../config'
import { I18nContainer } from '@opencrvs/register/src/i18n/components/I18nContainer'

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

addLocaleData([...en])

export function getInitialState(): IStoreState {
  const { store: mockStore } = createStore()

  mockStore.dispatch({ type: 'NOOP' })

  return mockStore.getState()
}

export function createTestApp() {
  const { store, history } = createStore()
  const app = mount(
    <App store={store} history={history} client={createGraphQLClient()} />
  )

  return { history, app, store }
}

interface ITestView {
  intl: ReactIntl.InjectedIntl
}

const intlProvider = new IntlProvider(
  { locale: 'en', messages: ENGLISH_STATE.messages },
  {}
)
const { intl } = intlProvider.getChildContext()

function nodeWithIntlProp(node: React.ReactElement<ITestView>) {
  return React.cloneElement(node, { intl })
}

export function createTestComponent(node: React.ReactElement<ITestView>) {
  const { store } = createStore()
  const component = mount(
    <Provider store={store}>
      <I18nContainer>
        <ThemeProvider theme={getTheme(config.LOCALE)}>
          {nodeWithIntlProp(node)}
        </ThemeProvider>
      </I18nContainer>
    </Provider>,
    {
      context: { intl },
      childContextTypes: { intl: intlShape }
    }
  )

  return { component, store }
}

export function createShallowRenderedComponent(
  node: React.ReactElement<ITestView>
) {
  return shallow(node)
}

export const wait = () => new Promise(res => process.nextTick(res))

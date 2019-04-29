import * as React from 'react'
import { Provider } from 'react-redux'
import { IStoreState, createStore, AppStore } from 'store'
import { mount, configure, shallow } from 'enzyme'
import { graphql, print } from 'graphql'
import ApolloClient from 'apollo-client'
import { getSchema } from './graphql-schema-mock'
import { ApolloLink, Observable } from 'apollo-link'
import { InMemoryCache } from 'apollo-cache-inmemory'
import * as Adapter from 'enzyme-adapter-react-16'
import { ThemeProvider } from 'styled-components'
import { getTheme } from '@opencrvs/components/lib/theme'
import { ENGLISH_STATE } from 'i18n/locales/en'
import { IntlProvider, intlShape } from 'react-intl'
import { I18nContainer } from 'i18n/components/I18nContainer'
import { App } from '../App'
import { MockedProvider } from 'react-apollo/test-utils'
// @ts-ignore
configure({ adapter: new Adapter() })

export function getInitialState(): IStoreState {
  const { store: mockStore } = createStore()

  mockStore.dispatch({ type: 'NOOP' })

  return mockStore.getState()
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

export function createShallowRenderedComponent(
  node: React.ReactElement<ITestView>
) {
  return shallow(node)
}

export function createTestComponent(
  node: React.ReactElement<ITestView>,
  store: AppStore,
  graphqlMocks: any = null
) {
  const component = mount(
    <MockedProvider mocks={graphqlMocks} addTypename={false}>
      <Provider store={store}>
        <I18nContainer>
          <ThemeProvider theme={getTheme(window.config.COUNTRY)}>
            {nodeWithIntlProp(node)}
          </ThemeProvider>
        </I18nContainer>
      </Provider>
    </MockedProvider>,
    {
      context: { intl },
      childContextTypes: { intl: intlShape }
    }
  )

  return { component, store }
}

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
  const { store, history } = createStore()
  const app = mount(
    <App store={store} history={history} client={createGraphQLClient()} />
  )

  return { history, app, store }
}

export const user = {
  id: '0',
  role: 'DISTRICT_REGISTRAR',
  name: [
    {
      use: 'en',
      firstNames: 'Muhammad Abdul Muid',
      familyName: 'Khan',
      __typename: 'HumanName'
    },
    { use: 'bn', firstNames: '', familyName: '', __typename: 'HumanName' }
  ],
  catchmentArea: [
    {
      id: 'a590de84-1d84-4dcf-a20b-8e60c7c66130',
      name: 'Dhaka',
      status: 'active',
      identifier: [
        {
          system: 'http://opencrvs.org/specs/id/a2i-internal-id',
          value: '3',
          __typename: 'Identifier'
        },
        {
          system: 'http://opencrvs.org/specs/id/bbs-code',
          value: '30',
          __typename: 'Identifier'
        },
        {
          system: 'http://opencrvs.org/specs/id/jurisdiction-type',
          value: 'DIVISION',
          __typename: 'Identifier'
        }
      ],
      __typename: 'Location'
    },
    {
      id: '3e769963-2d07-48f6-9d5a-8aa12c1a66b9',
      name: 'GAZIPUR',
      status: 'active',
      identifier: [
        {
          system: 'http://opencrvs.org/specs/id/a2i-internal-id',
          value: '20',
          __typename: 'Identifier'
        },
        {
          system: 'http://opencrvs.org/specs/id/bbs-code',
          value: '33',
          __typename: 'Identifier'
        },
        {
          system: 'http://opencrvs.org/specs/id/jurisdiction-type',
          value: 'DISTRICT',
          __typename: 'Identifier'
        }
      ],
      __typename: 'Location'
    }
  ],
  primaryOffice: undefined,
  __typename: 'User'
}

export const userDetails = {
  name: [
    {
      use: 'en',
      firstNames: 'Muhammad Abdul Muid',
      familyName: 'Khan',
      __typename: 'HumanName'
    },
    { use: 'bn', firstNames: '', familyName: '', __typename: 'HumanName' }
  ],
  role: 'DISTRICT_REGISTRAR',
  catchmentArea: [
    {
      id: 'a590de84-1d84-4dcf-a20b-8e60c7c66130',
      name: 'Dhaka',
      status: 'active',
      identifier: [
        { system: 'http://opencrvs.org/specs/id/a2i-internal-id', value: '3' },
        { system: 'http://opencrvs.org/specs/id/bbs-code', value: '30' },
        {
          system: 'http://opencrvs.org/specs/id/jurisdiction-type',
          value: 'DIVISION'
        }
      ]
    },
    {
      id: '3e769963-2d07-48f6-9d5a-8aa12c1a66b9',
      name: 'GAZIPUR',
      status: 'active',
      identifier: [
        { system: 'http://opencrvs.org/specs/id/a2i-internal-id', value: '20' },
        { system: 'http://opencrvs.org/specs/id/bbs-code', value: '33' },
        {
          system: 'http://opencrvs.org/specs/id/jurisdiction-type',
          value: 'DISTRICT'
        }
      ]
    }
  ]
}

export const mockUserResponse = {
  data: {
    getUser: user
  }
}

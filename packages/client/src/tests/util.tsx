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
  ApolloLink,
  ApolloProvider,
  InMemoryCache,
  Observable
} from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { App, routesConfig } from '@client/App'
import { offlineDataReady } from '@client/offline/actions'
import { AppStore, createStore, IStoreState } from '@client/store'
import { getSchema } from '@client/tests/graphql-schema-mock'
import { EventType } from '@client/utils/gateway'
import { UserDetails } from '@client/utils/userUtils'
import { I18nContainer } from '@opencrvs/client/src/i18n/components/I18nContainer'
import { TestUserRole, TokenUserType, UUID } from '@opencrvs/commons/client'
import { getTheme } from '@opencrvs/components/lib/theme'
import Adapter from '@wojtekmaj/enzyme-adapter-react-17'
import {
  configure,
  mount,
  MountRendererProps,
  ReactWrapper,
  shallow
} from 'enzyme'
import { readFileSync } from 'fs'
import { graphql, print } from 'graphql'
import * as jwt from 'jsonwebtoken'
import { join } from 'path'
import * as React from 'react'
import { IntlShape } from 'react-intl'
import { Provider } from 'react-redux'
import { ThemeProvider } from 'styled-components'
import { waitForElement } from './wait-for-element'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { vi } from 'vitest'
import { mockOfflineData, validImageB64String } from './mock-offline-data'

export const validToken =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJpYXQiOjE1MzMxOTUyMjgsImV4cCI6MTU0MzE5NTIyNywiYXVkIjpbImdhdGV3YXkiXSwic3ViIjoiMSJ9.G4KzkaIsW8fTkkF-O8DI0qESKeBI332UFlTXRis3vJ6daisu06W5cZsgYhmxhx_n0Q27cBYt2OSOnjgR72KGA5IAAfMbAJifCul8ib57R4VJN8I90RWqtvA0qGjV-sPndnQdmXzCJx-RTumzvr_vKPgNDmHzLFNYpQxcmQHA-N8li-QHMTzBHU4s9y8_5JOCkudeoTMOd_1021EDAQbrhonji5V1EOSY2woV5nMHhmq166I1L0K_29ngmCqQZYi1t6QBonsIowlXJvKmjOH5vXHdCCJIFnmwHmII4BK-ivcXeiVOEM_ibfxMWkAeTRHDshOiErBFeEvqd6VWzKvbKAH0UY-Rvnbh4FbprmO4u4_6Yd2y2HnbweSo-v76dVNcvUS0GFLFdVBt0xTay-mIeDy8CKyzNDOWhmNUvtVi9mhbXYfzzEkwvi9cWwT1M8ZrsWsvsqqQbkRCyBmey_ysvVb5akuabenpPsTAjiR8-XU2mdceTKqJTwbMU5gz-8fgulbTB_9TNJXqQlH7tyYXMWHUY3uiVHWg2xgjRiGaXGTiDgZd01smYsxhVnPAddQOhqZYCrAgVcT1GBFVvhO7CC-rhtNlLl21YThNNZNpJHsCgg31WA9gMQ_2qAJmw2135fAyylO8q7ozRUvx46EezZiPzhCkPMeELzLhQMEIqjo'

export function flushPromises() {
  return new Promise((resolve) => setImmediate(resolve))
}

export const getItem = vi.fn()
export const setItem = vi.fn()

configure({ adapter: new Adapter() })

function createGraphQLClient() {
  const schema = getSchema()
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new ApolloLink((operation) => {
      return new Observable((observer) => {
        const { query, operationName, variables } = operation

        graphql(schema, print(query), null, null, variables, operationName)
          .then((result) => {
            observer.next(result)
            observer.complete()
          })
          .catch(observer.error.bind(observer))
      })
    })
  })
}

export function getInitialState(): IStoreState {
  const { store: mockStore } = createStore()

  mockStore.dispatch({ type: 'NOOP' })

  return mockStore.getState()
}

function waitForReady(app: ReactWrapper) {
  return waitForElement(app, '#readyDeclaration')
}

export async function createTestApp(
  config = { waitUntilOfflineCountryConfigLoaded: true },
  initialEntries?: string[]
) {
  const { store } = await createTestStore()
  const router = createMemoryRouter(routesConfig, { initialEntries })

  const app = mount(
    <App store={store} router={router} client={createGraphQLClient()} />
  )

  if (config.waitUntilOfflineCountryConfigLoaded) {
    await waitForReady(app)
  }
  return { app, store, router }
}

interface ITestView {
  intl: IntlShape
}

export function createShallowRenderedComponent(
  node: React.ReactElement<ITestView>
) {
  return shallow(node)
}

export const resizeWindow = (width: number, height: number) => {
  const resizeEvent = document.createEvent('Event')
  resizeEvent.initEvent('resize', true, true)
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width
  })
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height
  })
  window.dispatchEvent(resizeEvent)
}

export const selectOption = (
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  wrapper: ReactWrapper<{}, {}, React.Component<{}, {}, any>>,
  selector: string,
  option: string
): ReactWrapper => {
  const input = wrapper.find(selector).hostNodes()

  input.find('input').simulate('focus').update()
  input.find('.react-select__control').first().simulate('mousedown').update()

  const availableOptions: string[] = []

  const nodes = input
    .update()
    .find('.react-select__option')
    .findWhere((el: ReactWrapper) => {
      const text = el.text()
      availableOptions.push(text)
      return text === option
    })
    .hostNodes()

  if (nodes.length === 0) {
    throw new Error(
      `Couldn't find an option "${option}" from select.\nAvailable options are:\n${availableOptions.join(
        ',\n'
      )}`
    )
  }

  nodes.first().simulate('click').update()

  return input.find('.react-select__control').first()
}

export const userDetails: UserDetails = {
  id: 'b77b78af-a259-4bc1-85d5-b1e8c1382273',
  type: 'user',
  status: 'active',
  name: [
    {
      use: 'en',
      given: ['Shakib'],
      family: 'Al Hasan'
    },
    { use: 'bn', given: [''], family: '' }
  ],
  role: TestUserRole.enum.FIELD_AGENT,
  mobile: '01677701431',
  primaryOfficeId: '6327dbd9-e118-4dbe-9246-cb0f7649a666' as UUID
}

export const mockUserResponse = {
  data: {
    getUser: {
      userMgntUserID: '123',
      primaryOffice: {
        id: '2a83cf14-b959-47f4-8097-f75a75d1867f',
        name: 'Kaliganj Union Sub Center',
        status: 'active',
        __typename: 'Location'
      },
      __typename: 'User',
      signature: {
        data: `data:image/png;base64,${validImageB64String}`,
        type: 'image/png'
      },
      localRegistrar: {
        role: 'LOCAL_REGISTRAR',
        signature: {
          data: `data:image/png;base64,${validImageB64String}`,
          type: 'image/png'
        },
        name: [
          {
            use: 'en',
            firstNames: 'Mohammad',
            familyName: 'Ashraful',
            __typename: 'HumanName'
          }
        ]
      },
      role: {
        label: {
          id: 'userRoles.localRegistar',
          defaultMessage: 'Local Registrar',
          description: 'Label for local registrar'
        }
      },
      practitionerId: '9202fa3c-7eb7-4898-bea5-5895f7f99534'
    }
  }
}

export const mockRegistrarUserResponse = {
  data: {
    getUser: {
      userMgntUserID: '123',
      primaryOffice: {
        id: '2a83cf14-b959-47f4-8097-f75a75d1867f',
        name: 'Kaliganj Union Sub Center',
        status: 'active',
        __typename: 'Location'
      },
      label: {
        defaultMessage: 'Local Registrar',
        description: 'Name for user role Local Registrar',
        id: 'userRole.localRegistrar'
      },
      signature: {
        data: `data:image/png;base64,${validImageB64String}`,
        type: 'image/png'
      },
      localRegistrar: {
        role: 'LOCAL_REGISTRAR',
        signature: {
          data: `data:image/png;base64,${validImageB64String}`,
          type: 'image/png'
        },
        name: [
          {
            use: 'en',
            given: ['Mohammad'],
            family: 'Ashraful'
          }
        ]
      },
      __typename: 'User'
    }
  }
}

const mockFetchCertificatesTemplatesDefinition = [
  {
    id: 'birth-certificate',
    event: 'birth' as EventType,
    label: {
      id: 'certificates.birth.certificate',
      defaultMessage: 'Birth Certificate',
      description: 'The label for a birth certificate'
    },
    fee: {
      onTime: 0,
      late: 5.5,
      delayed: 15
    },
    isDefault: true,
    svgUrl: '/api/countryconfig/certificates/birth-certificate.svg',
    svg: '<svg></svg>',
    fonts: {
      'Noto Sans': {
        normal: '/api/countryconfig/fonts/NotoSans-Regular.ttf',
        bold: '/api/countryconfig/fonts/NotoSans-Bold.ttf',
        italics: '/api/countryconfig/fonts/NotoSans-Regular.ttf',
        bolditalics: '/api/countryconfig/fonts/NotoSans-Regular.ttf'
      }
    }
  },
  {
    id: 'birth-certificate-copy',
    event: 'birth' as EventType,
    label: {
      id: 'certificates.birth-certificate-copy',
      defaultMessage: 'Birth Certificate certified copy',
      description: 'The label for a birth certificate'
    },
    fee: {
      onTime: 0,
      late: 5.5,
      delayed: 15
    },
    isDefault: false,
    svgUrl: '/api/countryconfig/certificates/birth-certificate-copy.svg',
    svg: '<svg></svg>',
    fonts: {
      'Noto Sans': {
        normal: '/api/countryconfig/fonts/NotoSans-Regular.ttf',
        bold: '/api/countryconfig/fonts/NotoSans-Bold.ttf',
        italics: '/api/countryconfig/fonts/NotoSans-Regular.ttf',
        bolditalics: '/api/countryconfig/fonts/NotoSans-Regular.ttf'
      }
    }
  },
  {
    id: 'death-certificate',
    event: 'death' as EventType,
    label: {
      id: 'certificates.death.certificate',
      defaultMessage: 'Death Certificate',
      description: 'The label for a death certificate'
    },
    fee: {
      onTime: 0,
      late: 5.5,
      delayed: 15
    },
    isDefault: true,
    svgUrl: '/api/countryconfig/certificates/death-certificate.svg',
    svg: '<svg></svg>',
    fonts: {
      'Noto Sans': {
        normal: '/api/countryconfig/fonts/NotoSans-Regular.ttf',
        bold: '/api/countryconfig/fonts/NotoSans-Bold.ttf',
        italics: '/api/countryconfig/fonts/NotoSans-Regular.ttf',
        bolditalics: '/api/countryconfig/fonts/NotoSans-Regular.ttf'
      }
    }
  },
  {
    id: 'marriage-certificate',
    event: 'marriage' as EventType,
    label: {
      id: 'certificates.marriage.certificate',
      defaultMessage: 'Marriage Certificate',
      description: 'The label for a marriage certificate'
    },
    fee: {
      onTime: 0,
      late: 5.5,
      delayed: 15
    },
    isDefault: true,
    svgUrl: '/api/countryconfig/certificates/marriage-certificate.svg',
    svg: '<svg></svg>',
    fonts: {
      'Noto Sans': {
        normal: '/api/countryconfig/fonts/NotoSans-Regular.ttf',
        bold: '/api/countryconfig/fonts/NotoSans-Bold.ttf',
        italics: '/api/countryconfig/fonts/NotoSans-Regular.ttf',
        bolditalics: '/api/countryconfig/fonts/NotoSans-Regular.ttf'
      }
    }
  }
]

export const mockConfigResponse = {
  config: mockOfflineData.config,
  anonymousConfig: mockOfflineData.anonymousConfig,
  certificates: mockFetchCertificatesTemplatesDefinition
}

const mockOfflineDataDispatch = {
  languages: mockOfflineData.languages,
  templates: mockOfflineData.templates,
  locations: mockOfflineData.locations,
  facilities: mockOfflineData.facilities,
  activeFacilities: mockOfflineData.facilities,
  offices: mockOfflineData.offices,
  activeOffices: mockOfflineData.offices,
  assets: mockOfflineData.assets,
  config: mockOfflineData.config,
  anonymousConfig: mockOfflineData.anonymousConfig,
  forms: JSON.parse(readFileSync(join(__dirname, './forms.json')).toString())
    .forms
}

export async function createTestStore() {
  const { store } = createStore()
  store.dispatch(offlineDataReady(mockOfflineDataDispatch))
  await flushPromises()
  return { store }
}

export async function createTestComponent(
  node: React.ReactElement<ITestView>,
  {
    store,
    graphqlMocks,
    apolloClient,
    initialEntries,
    path = '*'
  }: {
    store: AppStore
    graphqlMocks?: MockedProvider['props']['mocks']
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    apolloClient?: ApolloClient<any>
    initialEntries?:
      | string[]
      | {
          pathname: string
          state: Record<
            string,
            | string
            | boolean
            | number
            | Record<string, string | boolean | number>
          >
        }[]
    path?: string
  },
  options?: MountRendererProps
) {
  store.dispatch(offlineDataReady(mockOfflineDataDispatch))
  await flushPromises()

  const withGraphQL = (node: JSX.Element) => {
    if (apolloClient) {
      return <ApolloProvider client={apolloClient}>{node}</ApolloProvider>
    }

    return (
      <MockedProvider
        mocks={graphqlMocks}
        addTypename={false}
        defaultOptions={{
          watchQuery: { fetchPolicy: 'no-cache' },
          query: { fetchPolicy: 'no-cache' }
        }}
      >
        {node}
      </MockedProvider>
    )
  }
  const router = createMemoryRouter(
    [
      {
        path,
        element: node
      }
    ],
    { initialEntries }
  )

  function PropProxy() {
    return withGraphQL(
      <Provider store={store}>
        <I18nContainer>
          <ThemeProvider theme={getTheme()}>
            <RouterProvider router={router} />
          </ThemeProvider>
        </I18nContainer>
      </Provider>
    )
  }

  return { component: mount(<PropProxy />, options), router }
}

export {
  mockOfflineData,
  mockOfflineLocationsWithHierarchy
} from './mock-offline-data'

export function generateToken({
  scope,
  userType,
  role,
  subject
}: {
  scope: string[]
  subject?: string
  userType?: TokenUserType
  role?: TestUserRole
}) {
  if (subject) {
    return jwt.sign(
      { scope, userType, role },
      readFileSync('./test/cert.key'),
      {
        subject,
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:gateway-user'
      }
    )
  }

  return jwt.sign({ scope }, readFileSync('./test/cert.key'), {
    algorithm: 'RS256',
    issuer: 'opencrvs:auth-service',
    audience: 'opencrvs:gateway-user'
  })
}

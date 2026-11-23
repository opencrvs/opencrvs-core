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
import { App, routesConfig } from '@client/App'
import { offlineDataReady } from '@client/offline/actions'
import { AppStore, createStore, IStoreState } from '@client/store'
import { EventType } from '@client/utils/gateway-types'
import { UserDetails } from '@client/utils/userUtils'
import { I18nContainer } from '@client/i18n/components/I18nContainer'
import { TestUserRole, UUID } from '@opencrvs/commons/client'
import { getTheme } from '@opencrvs/components'
import Adapter from '@wojtekmaj/enzyme-adapter-react-17'
import {
  configure,
  mount,
  MountRendererProps,
  ReactWrapper,
  shallow
} from 'enzyme'
import { readFileSync } from 'fs'
import { join } from 'path'
import * as React from 'react'
import { IntlShape } from 'react-intl'
import { Provider } from 'react-redux'
import { ThemeProvider } from 'styled-components'
import { waitForElement } from './wait-for-element'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { vi } from 'vitest'
import { mockOfflineData, validImageB64String } from './mock-offline-data'
import testUserTokens from 'virtual:test-tokens'
import { userIds } from './test-users'

/**
 * Default token for legacy tests: the `userDetails` user below, with no scopes.
 */
export const validToken = testUserTokens.legacyDefault

export function flushPromises() {
  return new Promise((resolve) => setImmediate(resolve))
}

export const getItem = vi.fn()
export const setItem = vi.fn()

configure({ adapter: new Adapter() })

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

  const app = mount(<App store={store} router={router} />)

  if (config.waitUntilOfflineCountryConfigLoaded) {
    await waitForReady(app)
  }
  return { app, store, router }
}

interface ITestView {
  intl: IntlShape
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
  wrapper: ReactWrapper<any, any, any>,
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
  id: userIds.legacyDefault,
  type: 'user',
  status: 'active',
  name: { firstname: 'Shakib', surname: 'Al Hasan' },
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
    initialEntries,
    path = '*'
  }: {
    store: AppStore
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
    return (
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

export { generateToken } from './generate-token'

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
import { storage } from '@client/storage'
import { IUserData } from './declarations'
import * as CommonUtils from '@client/utils/commonUtils'
import { referenceApi } from './utils/referenceApi'
// eslint-disable-next-line import/no-unassigned-import
import 'core-js/features/array/flat'
// eslint-disable-next-line import/no-unassigned-import
import 'jsdom-worker'
import { mockOfflineData } from './tests/mock-offline-data'
// eslint-disable-next-line import/no-unassigned-import
import './tests/queryMock'
import { vi } from 'vitest'
import createFetchMock from 'vitest-fetch-mock'

/*
 * Navigator & Window
 */
window.HTMLElement.prototype.scrollIntoView = vi.fn()
const config = {
  APPLICATION_NAME: 'Farajaland CRVS',
  COUNTRY: 'BGD',
  CURRENCY: {
    isoCode: 'ZMW',
    languagesAndCountry: ['en-ZM']
  },
  ADMIN_STRUCTURE: [
    {
      id: 'province',
      label: {
        id: 'field.address.province.label',
        defaultMessage: 'Province',
        description: 'Label for province in address'
      }
    },
    {
      id: 'district',
      label: {
        id: 'field.address.district.label',
        defaultMessage: 'District',
        description: 'Label for district in address'
      }
    }
  ],
  DASHBOARDS: [
    {
      id: 'test',
      title: {
        id: 'navigation.dashboard',
        defaultMessage: 'Test Dashboard',
        description: 'Title for the test dashboard'
      },
      url: '/'
    }
  ],
  FEATURES: {
    V2_EVENTS: false
  },
  LANGUAGES: ['en', 'bn', 'fr'],
  USER_NOTIFICATION_DELIVERY_METHOD: 'sms',
  INFORMANT_NOTIFICATION_DELIVERY_METHOD: 'sms',
  SENTRY: 'https://2ed906a0ba1c4de2ae3f3f898ec9df0b@sentry.io/1774551',
  PHONE_NUMBER_PATTERN: /^01[1-9][0-9]{8}$/
}

vi.stubGlobal('config', config)

/*
 * GraphQL Queries
 */
import { queries } from './profile/queries'

/*
 * Country configuration
 */
import {
  mockUserResponse,
  mockConfigResponse,
  userDetails,
  validToken,
  getItem,
  setItem
} from './tests/util'

vi.doMock('@client/forms/user/fieldDefinitions/createUser', () => ({
  createUserForm: mockOfflineData.userForms
}))

vi.mock('@client/v2-events/hooks/useLocations')
vi.mock('@client/v2-events/hooks/useAdministrativeAreas')

vi.mock('@client/forms/handlebarHelpers', async () => {
  return {
    initHandlebarHelpers: () => Promise.resolve(),
    getHandlebarHelpers: () => ({})
  }
})

vi.mock('@client/forms/conditionals', async () => {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const actual = (await vi.importActual('@client/forms/conditionals')) as any
  return {
    ...actual,
    conditionals: actual.builtInConditionals,
    initConditionals: () => Promise.resolve()
  }
})

vi.mock('@client/forms/handlebarHelpers', async () => {
  const actual = (await vi.importActual(
    '@client/forms/handlebarHelpers'
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  )) as any
  return {
    ...actual,
    handlebarHelpers: {},
    initHandlebarHelpers: () => Promise.resolve()
  }
})

/*
 * Initialize mocks
 */
const fetchMock = createFetchMock(vi)
fetchMock.enableMocks()

const localStorageMock = {
  getItem,
  setItem,
  removeItem: vi.fn(),
  clear: vi.fn()
}

vi.stubGlobal('localStorage', localStorageMock)

/*
 * Page Visibility
 */

const hiddenMock = vi.fn()
Object.defineProperty(document, 'hidden', {
  get() {
    return hiddenMock()
  },
  set(bool) {
    hiddenMock.mockReturnValue(Boolean(bool))
  }
})

/*
 * Storage module
 */

const storageGetItemMock = vi.fn()
const storageSetItemMock = vi.fn()
const storageRemoveItemMock = vi.fn()
storage.getItem = storageGetItemMock
storage.setItem = storageSetItemMock
storage.removeItem = storageRemoveItemMock

/*
 * Console
 */

const warn = vi.fn()
const error = vi.fn()
const debug = vi.fn()
/* eslint-disable no-console */
console.warn = warn
console.error = error
console.debug = debug
queries.fetchUserDetails = vi.fn()

vi.doMock(
  '@client/utils/referenceApi',
  (): {
    referenceApi: typeof referenceApi
  } => ({
    referenceApi: {
      loadLocations: () => Promise.resolve(mockOfflineData.locations),
      loadFacilities: () => Promise.resolve(mockOfflineData.facilities),
      loadContent: () =>
        Promise.resolve({
          languages: mockOfflineData.languages
        }),
      loadConfig: () => Promise.resolve(mockConfigResponse),
      loadConfigAnonymousUser: () => Promise.resolve(mockConfigResponse),
      importConditionals: () => Promise.resolve({}),
      importHandlebarHelpers: () => Promise.resolve({})
    }
  })
)

vi.mock('@client/utils/authApi', () => ({
  invalidateToken: () => Promise.resolve()
}))
vi.mock('@client/pdfRenderer', () => ({
  printPDF: () => Promise.resolve()
}))

beforeEach(() => {
  /*
   * Reset all mocks
   */

  getItem.mockReturnValue(validToken)
  storageGetItemMock.mockReset()
  storageSetItemMock.mockReset()
  storageRemoveItemMock.mockReset()
  warn.mockReset()
  error.mockReset()
  debug.mockReset()
  hiddenMock.mockReset()

  Date.now = vi.fn(() => 1487076708000) // 2017-02-14

  /*
   * Assign sane defaults for everything
   * These should cover 99% of use cases, but can be overwritten
   * in the test suite
   */

  vi.spyOn(CommonUtils, 'isMobileDevice').mockReturnValue(true)
  window.history.replaceState({}, '', '/')

  queries.fetchUserDetails = vi.fn().mockReturnValue(mockUserResponse)

  const userData: IUserData[] = [
    {
      userID: userDetails.id,
      userPIN: '$2a$10$xQBLcbPgGQNu9p6zVchWuu6pmCrQIjcb6k2W1PIVUxVTE/PumWM82'
    }
  ]

  const indexedDB = {
    USER_DETAILS: JSON.stringify(userDetails),
    USER_DATA: JSON.stringify(userData)
  }

  storageGetItemMock.mockImplementation((key: keyof typeof indexedDB) =>
    Promise.resolve(indexedDB[key])
  )

  storageSetItemMock.mockImplementation(
    (key: keyof typeof indexedDB, value: string) => (indexedDB[key] = value)
  )
})
vi.mock('lodash/debounce', () => ({
  default: vi.fn().mockImplementation((arg) => arg)
}))

vi.mock('./utils', async () => ({
  useOnlineStatus: () => true,
  isNavigatorOnline: () => true,
  getUserRole: vi.fn().mockImplementation((lang, role) => 'ENTREPENEUR')
}))

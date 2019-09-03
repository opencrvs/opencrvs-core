/* eslint-disable @typescript-eslint/no-var-requires */
import { GlobalWithFetchMock } from 'jest-fetch-mock'
import { storage } from '@register/storage'
import { IUserData } from './applications'
import { noop } from 'lodash'
import * as CommonUtils from '@register/utils/commonUtils'
import { referenceApi } from './utils/referenceApi'

if (process.env.CI) {
  jest.setTimeout(30000)
}

/*
 * Initialize mocks
 */

const customGlobal: GlobalWithFetchMock = global as GlobalWithFetchMock
customGlobal.fetch = require('jest-fetch-mock')
customGlobal.fetchMock = customGlobal.fetch
jest.mock('lodash/debounce', () => jest.fn(fn => fn))

/*
 * Local storage
 */

const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
})

/*
 * Storage module
 */

const storageGetItemMock = jest.fn()
const storageSetItemMock = jest.fn()
storage.getItem = storageGetItemMock
storage.setItem = storageSetItemMock

/*
 * Console
 */

const warn = jest.fn()
const error = jest.fn()
const debug = jest.fn()

console.warn = warn
console.error = error
console.debug = debug

const log = console.log.bind(console)

const BLOCKED_MESSAGES = ['Warning: Setting up fake worker.']

console.log = jest.fn().mockImplementation((...messages) => {
  if (BLOCKED_MESSAGES.includes(messages.join(' '))) {
    return
  }
  log(...messages)
})

/*
 * GraphQL Queries
 */

const { queries } = require('./profile/queries')
queries.fetchUserDetails = jest.fn()

/*
 * Navigator & Window
 */

const navigatorMock = {
  onLine: true
}
;(window as any).location.assign = jest.fn()
;(window as any).navigator = navigatorMock
;(window as any).location.reload = jest.fn()
;(window as any).scrollTo = noop
;(window as any).config = {
  API_GATEWAY_URL: 'http://localhost:7070/',
  BACKGROUND_SYNC_BROADCAST_CHANNEL: 'backgroundSynBroadCastChannel',
  COUNTRY: 'bgd',
  COUNTRY_LOGO_FILE: 'logo.png',
  LANGUAGES: 'en,bn',
  LOGIN_URL: 'http://localhost:3020',
  PERFORMANCE_URL: 'http://localhost:3001',
  RESOURCES_URL: 'http://localhost:3040/bgd',
  HEALTH_FACILITY_FILTER: 'UPAZILA',
  CERTIFICATE_PRINT_CHARGE_FREE_PERIOD: 45,
  CERTIFICATE_PRINT_CHARGE_UP_LIMIT: 1825,
  CERTIFICATE_PRINT_LOWEST_CHARGE: 25,
  CERTIFICATE_PRINT_HIGHEST_CHARGE: 50
}

/*
 * Country configuration
 */

const {
  mockUserResponse,
  mockOfflineData,
  userDetails,
  validToken,
  getItem,
  assign
} = require('./tests/util')

jest.mock('@register/utils/referenceApi', (): {
  referenceApi: typeof referenceApi
} => ({
  referenceApi: {
    loadLocations: () => Promise.resolve(mockOfflineData.locations),
    loadFacilities: () => Promise.resolve(mockOfflineData.facilities),
    loadDefinitions: () =>
      Promise.resolve({
        languages: mockOfflineData.languages,
        forms: mockOfflineData.forms
      }),
    loadAssets: () => Promise.resolve(mockOfflineData.assets)
  }
}))

beforeEach(() => {
  /*
   * Reset all mocks
   */

  storageGetItemMock.mockReset()
  storageSetItemMock.mockReset()
  assign.mockClear()
  warn.mockReset()
  error.mockReset()
  debug.mockReset()

  /*
   * Assign sane defaults for everything
   * These should cover 99% of use cases, but can be overwritten
   * in the test suite
   */

  jest.spyOn(CommonUtils, 'isMobileDevice').mockReturnValue(true)
  window.history.replaceState({}, '', '/')

  getItem.mockReturnValue(validToken)
  queries.fetchUserDetails.mockReturnValue(mockUserResponse)

  const userData: IUserData[] = [
    {
      userID: userDetails.userMgntUserID,
      userPIN: '$2a$10$xQBLcbPgGQNu9p6zVchWuu6pmCrQIjcb6k2W1PIVUxVTE/PumWM82',
      applications: []
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

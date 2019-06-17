import { GlobalWithFetchMock } from 'jest-fetch-mock'

const customGlobal: GlobalWithFetchMock = global as GlobalWithFetchMock
customGlobal.fetch = require('jest-fetch-mock')
customGlobal.fetchMock = customGlobal.fetch
jest.mock('lodash/debounce', () => jest.fn(fn => fn))

const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
}
const navigatorMock = {
  onLine: true
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
})
;(window as any).location.assign = jest.fn()
;(window as any).navigator = navigatorMock
;(window as any).location.reload = jest.fn()
// eslint-disable-line no-empty
;(window as any).scrollTo = () => {}
;(window as any).config = {
  API_GATEWAY_URL: 'http://localhost:7070/',
  BACKGROUND_SYNC_BROADCAST_CHANNEL: 'backgroundSynBroadCastChannel',
  COUNTRY: 'bgd',
  LANGUAGE: 'en',
  LOGIN_URL: 'http://localhost:3020',
  PERFORMANCE_URL: 'http://localhost:3001',
  RESOURCES_URL: 'http://localhost:3040/',
  HEALTH_FACILITY_FILTER: 'UPAZILA'
}

import { GlobalWithFetchMock } from 'jest-fetch-mock'

const customGlobal: GlobalWithFetchMock = global as GlobalWithFetchMock
// tslint:disable no-var-requires
customGlobal.fetch = require('jest-fetch-mock')
customGlobal.fetchMock = customGlobal.fetch

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
// tslint:disable-next-line no-empty
;(window as any).scrollTo = () => {}

import * as fetch from 'jest-fetch-mock'

jest.setMock('node-fetch', { default: fetch })

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

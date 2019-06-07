// @ts-ignore
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
;(window as any).scrollTo = () => {}
;(window as any).config = {
  API_GATEWAY_URL: 'http://localhost:7070/',
  COUNTRY: 'bgd',
  LANGUAGE: 'en',
  LOGIN_URL: 'http://localhost:3020',
  REGISTER_URL: 'http://localhost:3000'
}

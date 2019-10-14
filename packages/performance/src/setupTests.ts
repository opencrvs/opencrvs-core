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
;(window as Window).config = {
  API_GATEWAY_URL: 'http://localhost:7070/',
  COUNTRY: 'bgd',
  LANGUAGES: 'en,bn',
  LOGIN_URL: 'http://localhost:3020',
  REGISTER_URL: 'http://localhost:3000',
  SENTRY: 'https://2ed906a0ba1c4de2ae3f3f898ec9df0b@sentry.io/1774551',
  LOGROCKET: 'opencrvs-foundation/opencrvs-bangladesh'
}

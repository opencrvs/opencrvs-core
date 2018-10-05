const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn()
}
const navigatorMock = {
  onLine: true
}
;(window as any).localStorage = localStorageMock
;(window as any).location.assign = jest.fn()
;(window as any).navigator = navigatorMock
// tslint:disable-next-line no-empty
;(window as any).scrollTo = () => {}

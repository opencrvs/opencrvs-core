const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn()
}
;(window as any).localStorage = localStorageMock
;(window as any).location.assign = jest.fn()
;(window as any).location.reload = jest.fn()
// tslint:disable-next-line no-empty
;(window as any).scrollTo = () => {}

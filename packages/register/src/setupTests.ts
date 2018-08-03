const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn()
}
;(window as any).localStorage = localStorageMock
;(window as any).location.assign = jest.fn()

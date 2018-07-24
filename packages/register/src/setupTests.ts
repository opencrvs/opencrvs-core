export interface IGlobal extends NodeJS.Global {
  document: Document
  window: Window
  localStorage: any
}

declare var global: IGlobal

const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn()
}
global.localStorage = localStorageMock

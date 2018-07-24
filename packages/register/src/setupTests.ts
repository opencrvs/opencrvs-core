export interface IGlobal extends NodeJS.Global {
  document: Document
  window: Window
  localStorage: any
}

const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn()
}
global.localStorage = localStorageMock

declare var global: IGlobal

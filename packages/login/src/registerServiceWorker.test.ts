import register from '@login/registerServiceWorker'

describe('registerServiceWorker module', () => {
  beforeEach(() => {
    window.addEventListener = jest.fn()
    // @ts-ignore
    navigator.serviceWorker = {}
    process.env.NODE_ENV = 'production'
  })

  it('registers a load event to install the service worker', () => {
    register()
    expect(window.addEventListener).toBeCalled()
  })

  it('does not register a load event when Cypress is present so the service worker is not loaded for e2e testing', () => {
    // @ts-ignore
    window.Cypress = {}
    register()
    expect(window.addEventListener).not.toBeCalled()
  })
})

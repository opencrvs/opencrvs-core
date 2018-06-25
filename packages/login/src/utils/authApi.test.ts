import { authApi, client } from './authApi'
import * as moxios from 'moxios'

describe('authApi', () => {
  beforeEach(() => {
    moxios.install(client)
  })
  afterEach(() => {
    moxios.uninstall(client)
  })
  it('authenticates with the server and return a nonce!  Love that word!', async () => {
    const data = {
      mobile: '27845829934',
      password: 'test'
    }

    const expectedResponse = { nonce: '12345' }

    moxios.wait(() => {
      const request = moxios.requests.mostRecent()
      request.respondWith({ status: 200, response: expectedResponse })
    })

    const result = await authApi.submitStepOne(data)

    expect(result).toEqual(expectedResponse)
  })
})

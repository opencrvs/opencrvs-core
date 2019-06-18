import { authApi, client } from '@login/utils/authApi'
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

    const result = await authApi.authenticate(data)

    expect(result).toEqual(expectedResponse)
  })
  it('requests a resend of the SMS code', async () => {
    const data = '12345'

    const expectedResponse = { nonce: '12345' }

    moxios.wait(() => {
      const request = moxios.requests.mostRecent()
      request.respondWith({ status: 200, response: expectedResponse })
    })

    const result = await authApi.resendSMS(data)

    expect(result).toEqual(expectedResponse)
  })
  it('submits the SMS code', async () => {
    const data = {
      nonce: '12345',
      code: '123456'
    }

    const expectedResponse = { nonce: '12345' }

    moxios.wait(() => {
      const request = moxios.requests.mostRecent()
      request.respondWith({ status: 200, response: expectedResponse })
    })

    const result = await authApi.verifyCode(data)

    expect(result).toEqual(expectedResponse)
  })
})

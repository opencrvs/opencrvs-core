/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
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
      username: '27845829934',
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

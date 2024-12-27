/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import * as routes from '@login/navigation/routes'
import { createTestApp, flushPromises } from '@login/tests/util'
import { ReactWrapper } from 'enzyme'
import { rest } from 'msw'
import { setupServer } from 'msw/node'

//mock api calls
const server = setupServer(
  rest.post(`${window.config.AUTH_API_URL}/changePassword`, (_, res, _2) => {
    return res()
  })
)

// Enable API mocking before tests.
beforeAll(() => {
  server.listen()
})

// Reset any runtime request handlers we may add during the tests.
afterEach(() => server.resetHandlers())

// Disable API mocking after the tests are done.
afterAll(() => server.close())

describe('Test password update form', () => {
  let app: ReactWrapper

  beforeEach(async () => {
    const appBundle = await createTestApp({
      initialEntries: [
        {
          pathname: routes.UPDATE_PASSWORD,
          state: {
            nonce: '123456789'
          }
        }
      ]
    })
    app = appBundle.app

    app.update()
  })

  it('it shows passwords missmatch error when Continue button is pressed', () => {
    app
      .find('#NewPassword')
      .hostNodes()
      .simulate('change', {
        target: { value: '0crvsPassword' }
      })
    app
      .find('#ConfirmPassword')
      .hostNodes()
      .simulate('change', {
        target: { value: 'missmatch' }
      })
    app.find('#continue-button').hostNodes().simulate('submit')
    expect(app.find('#GlobalError').hostNodes().text()).toEqual(
      'Passwords do not match'
    )
  })

  it('it passes validations', async () => {
    app
      .find('#NewPassword')
      .hostNodes()
      .simulate('change', {
        target: { value: '0crvsPassword' }
      })
    app
      .find('#ConfirmPassword')
      .hostNodes()
      .simulate('change', {
        target: { value: '0crvsPassword' }
      })
    app.find('#continue-button').hostNodes().simulate('submit')
    await flushPromises()
    expect(app.text()).toContain('Passwords match')
  })

  it('it shows passwords required error when Continue button is pressed', () => {
    app.find('#continue-button').hostNodes().simulate('submit')
    expect(app.find('#GlobalError').hostNodes().text()).toEqual(
      'New password is not valid'
    )
  })
})

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
import { FORGOTTEN_ITEMS } from '@login/login/actions'
import * as routes from '@login/navigation/routes'
import { createTestApp, flushPromises, waitFor } from '@login/tests/util'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { ReactWrapper } from 'enzyme'
import { History } from 'history'

//mock api calls
const server = setupServer(
  rest.get(
    `${window.config.COUNTRY_CONFIG_URL}/content/login`,
    (req, res, ctx) => {
      return res(
        ctx.json({
          languages: [
            {
              lang: 'en',
              displayName: 'Français',
              messages: {
                defaultMessage: 'Bangladesh'
              }
            }
          ]
        })
      )
    }
  ),
  rest.get(`${window.config.CONFIG_API_URL}/loginConfig`, (req, res, ctx) => {
    return res(
      ctx.json({
        config: {
          APPLICATION_NAME: 'Dummy App',
          COUNTRY: 'FAR',
          COUNTRY_LOGO: {
            fileName: 'dummy-file-name',
            file: 'dummy-logo'
          },
          SENTRY: '',
          LOGROCKET: ''
        }
      })
    )
  }),
  rest.post(`${window.config.AUTH_API_URL}/verifyUser`, (req, res, ctx) => {
    return res(
      ctx.json({
        nonce: 'KkcVYTRVC6usF7Vjdi3FSw==',
        securityQuestionKey: 'FAVORITE_MOVIE'
      })
    )
  })
)

// Enable API mocking before tests.
beforeAll(() => server.listen())

// Reset any runtime request handlers we may add during the tests.
afterEach(() => server.resetHandlers())

// Disable API mocking after the tests are done.
afterAll(() => server.close())

describe('Test phone number verification form', () => {
  let app: ReactWrapper
  let history: History

  beforeEach(async () => {
    const testApp = await createTestApp()
    app = testApp.app
    history = testApp.history

    history.replace('')
    app.update()

    window.config.PHONE_NUMBER_PATTERN = /^0(1)[0-9]{1}[0-9]{8}$/
  })

  describe('Page title', () => {
    it('loads title when username is chosen as the forgotten item', async () => {
      history.replace(routes.PHONE_NUMBER_VERIFICATION, {
        forgottenItem: FORGOTTEN_ITEMS.USERNAME
      })

      expect(app.update().find('#page-title').hostNodes().text()).toContain(
        'Username reminder request'
      )
    })

    it('loads title when password is chosen as the forgotten item', async () => {
      const { app, history } = await createTestApp()
      history.replace(routes.PHONE_NUMBER_VERIFICATION, {
        forgottenItem: FORGOTTEN_ITEMS.PASSWORD
      })

      expect(app.update().find('#page-title').hostNodes().text()).toContain(
        'Password reset'
      )
    })
  })

  describe('Error handling', () => {
    beforeEach(() => {
      history.replace(routes.PHONE_NUMBER_VERIFICATION, {
        forgottenItem: FORGOTTEN_ITEMS.USERNAME
      })
      app.update()
    })

    it('shows field error when invalid phone number is given', () => {
      app
        .find('#phone-number-input')
        .hostNodes()
        .simulate('change', { target: { value: '123' } })
      expect(app.find('#phone-number_error').hostNodes()).toHaveLength(1)
    })

    it("continue button doesn't forward to next form when invalid phone number is given", () => {
      app
        .find('#phone-number-input')
        .hostNodes()
        .simulate('change', { target: { value: '123' } })
      app.find('#continue').hostNodes().simulate('click')
      expect(history.location.pathname).toContain(
        routes.PHONE_NUMBER_VERIFICATION
      )
    })
  })

  describe('Valid submission', () => {
    beforeEach(() => {
      history.replace(routes.PHONE_NUMBER_VERIFICATION, {
        forgottenItem: FORGOTTEN_ITEMS.USERNAME
      })
      app.update()
    })

    it("doesn't shows field error when valid phone number is given", () => {
      app
        .find('#phone-number-input')
        .hostNodes()
        .simulate('change', { target: { value: '01711111111' } })
      expect(app.find('#phone-number_error').hostNodes()).toHaveLength(0)
    })

    it('continue button will redirect to SECURITY_QUESTION route', async () => {
      app
        .find('#phone-number-input')
        .hostNodes()
        .simulate('change', { target: { value: '01755555155' } })
      app.find('#continue').hostNodes().simulate('submit')
      await flushPromises()
      await waitFor(() =>
        window.location.pathname.includes(routes.SECURITY_QUESTION)
      )
      expect(window.location.pathname).toContain(routes.SECURITY_QUESTION)
    })
    it('continue button will redirect to RECOVERY_CODE_ENTRY route', async () => {
      //change verifyUser api response
      server.use(
        rest.post(
          `${window.config.AUTH_API_URL}/verifyUser`,
          (req, res, ctx) => {
            return res(
              ctx.status(200),
              ctx.json({
                nonce: 'KkcVYTRVC6usF7Vjdi3FSw=='
              })
            )
          }
        )
      )
      app
        .find('#phone-number-input')
        .hostNodes()
        .simulate('change', { target: { value: '01755555155' } })
      app.update()
      app.find('#continue').hostNodes().simulate('submit')
      await flushPromises()
      app.update()
      await waitFor(() =>
        window.location.pathname.includes(routes.RECOVERY_CODE_ENTRY)
      )
      expect(window.location.pathname).toContain(routes.RECOVERY_CODE_ENTRY)
    })
  })

  describe('Valid phone number, invalid submission', () => {
    it('should show error message if number is not found', async () => {
      //change verifyUser api response
      server.use(
        rest.post(
          `${window.config.AUTH_API_URL}/verifyUser`,
          (req, res, ctx) => {
            return res(
              ctx.status(401),
              ctx.json({ message: 'Internal Server Error' })
            )
          }
        )
      )
      history.replace(routes.PHONE_NUMBER_VERIFICATION, {
        forgottenItem: FORGOTTEN_ITEMS.USERNAME
      })
      app.update()
      app
        .find('#phone-number-input')
        .hostNodes()
        .simulate('change', { target: { value: '01755555155' } })
      app.find('#continue').hostNodes().simulate('submit')
      await waitFor(() => !!app.find('#phone-number_error').hostNodes())
      app.update()
      expect(app.find('#phone-number_error').hostNodes().text()).toBe(
        'Mobile phone number not found.'
      )
    })
  })
})

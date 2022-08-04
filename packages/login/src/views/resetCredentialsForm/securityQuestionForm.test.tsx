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
import { createTestApp } from '@login/tests/util'
import { client, QUESTION_KEYS } from '@login/utils/authApi'
import { ReactWrapper } from 'enzyme'
import { History } from 'history'
import * as moxios from 'moxios'
import { rest } from 'msw'
import { setupServer } from 'msw/node'

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
  })

  describe('Page title', () => {
    const nonce = '123456789'
    const securityQuestionKey = QUESTION_KEYS.BIRTH_TOWN

    it('loads title when username is chosen as the forgotten item', async () => {
      history.replace(routes.SECURITY_QUESTION, {
        forgottenItem: FORGOTTEN_ITEMS.USERNAME,
        nonce,
        securityQuestionKey
      })

      expect(app.update().find('#page-title').hostNodes().text()).toContain(
        'Username reminder request'
      )
    })

    it('loads title when password is chosen as the forgotten item', async () => {
      history.replace(routes.SECURITY_QUESTION, {
        forgottenItem: FORGOTTEN_ITEMS.PASSWORD,
        nonce,
        securityQuestionKey
      })

      expect(app.update().find('#page-title').hostNodes().text()).toContain(
        'Password reset'
      )
    })
  })

  describe('Body header', () => {
    const nonce = '123456789'
    const securityQuestionKey = QUESTION_KEYS.BIRTH_TOWN

    it('loads valid header for corresponding question key', async () => {
      history.replace(routes.SECURITY_QUESTION, {
        forgottenItem: FORGOTTEN_ITEMS.USERNAME,
        nonce,
        securityQuestionKey
      })

      expect(app.update().text()).toContain('What city were you born in?')
    })
  })

  describe('Form submission', () => {
    const nonce = '123456789'
    const securityQuestionKey = QUESTION_KEYS.BIRTH_TOWN

    beforeEach(() => {
      moxios.install(client)
    })

    it('redirects to success page for a valid submission when username is chosen as forgotten item', () =>
      new Promise<void>((done) => {
        history.replace(routes.SECURITY_QUESTION, {
          forgottenItem: FORGOTTEN_ITEMS.USERNAME,
          nonce,
          securityQuestionKey
        })
        app.update()
        app
          .find('#security-answer-input')
          .hostNodes()
          .simulate('change', { target: { value: 'Gotham' } })
        app.find('#continue').hostNodes().simulate('submit')
        moxios.wait(() => {
          const request = moxios.requests.mostRecent()
          request
            .respondWith({
              status: 200,
              response: {
                matched: true,
                nonce: 'KkcVYTRVC6usF7Vjdi3FSw=='
              }
            })
            .then(() => {
              moxios.wait(() => {
                const request = moxios.requests.mostRecent()
                request
                  .respondWith({
                    status: 200
                  })
                  .then(() => {
                    expect(window.location.pathname).toContain(routes.SUCCESS)
                    done()
                  })
              })
            })
        })
      }))

    it('redirects to password update for for a valid submission when password is chosen as forgotten item', () =>
      new Promise<void>((done) => {
        history.replace(routes.SECURITY_QUESTION, {
          forgottenItem: FORGOTTEN_ITEMS.PASSWORD,
          nonce,
          securityQuestionKey
        })
        app.update()
        app
          .find('#security-answer-input')
          .hostNodes()
          .simulate('change', { target: { value: 'Gotham' } })
        app.find('#continue').hostNodes().simulate('submit')
        moxios.wait(() => {
          const request = moxios.requests.mostRecent()
          request
            .respondWith({
              status: 200,
              response: {
                matched: true,
                nonce: 'KkcVYTRVC6usF7Vjdi3FSw=='
              }
            })
            .then(() => {
              expect(window.location.pathname).toContain(routes.UPDATE_PASSWORD)
              done()
            })
        })
      }))

    it('updates header as the answer for the given question is wrong and another question key is sent as response', () =>
      new Promise<void>((done) => {
        history.replace(routes.SECURITY_QUESTION, {
          forgottenItem: FORGOTTEN_ITEMS.USERNAME,
          nonce,
          securityQuestionKey
        })

        app.update()

        app.find('#continue').hostNodes().simulate('submit')

        moxios.wait(() => {
          const request = moxios.requests.mostRecent()
          request
            .respondWith({
              status: 200,
              response: {
                matched: false,
                nonce: 'tzKZutCOJfgz+3nRnyehCQ==',
                securityQuestionKey: QUESTION_KEYS.FAVORITE_FOOD
              }
            })
            .then(() => {
              expect(app.text()).toContain('What is your favorite food?')
              done()
            })
        })
      }))
  })
})

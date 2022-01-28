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
import { createTestApp, wait } from '@login/tests/util'
import { client } from '@login/utils/authApi'
import { ReactWrapper } from 'enzyme'
import { History } from 'history'
import * as moxios from 'moxios'

describe('Test phone number verification form', () => {
  let app: ReactWrapper
  let history: History

  beforeEach(async () => {
    const testApp = await createTestApp()
    app = testApp.app
    history = testApp.history

    history.replace('')
    app.update()

    window.config.PHONE_NUMBER_PATTERN = {
      pattern: /^0(1)[0-9]{1}[0-9]{8}$/i,
      example: '01741234567',
      start: '0[7|9]',
      num: '11',
      mask: {
        startForm: 4,
        endBefore: 1
      }
    }
  })

  describe('Page title', () => {
    it('loads title when username is chosen as the forgotten item', async () => {
      history.replace(routes.PHONE_NUMBER_VERIFICATION, {
        forgottenItem: FORGOTTEN_ITEMS.USERNAME
      })

      expect(app.update().find('#page-title').hostNodes().text()).toContain(
        'ব্যবহারকারীর নাম পুনরুদ্ধারের অনুরোধ'
      )
    })

    it('loads title when password is chosen as the forgotten item', async () => {
      const { app, history } = await createTestApp()
      history.replace(routes.PHONE_NUMBER_VERIFICATION, {
        forgottenItem: FORGOTTEN_ITEMS.PASSWORD
      })

      expect(app.update().find('#page-title').hostNodes().text()).toContain(
        'পাসওয়ার্ড পুনরায় সেট করুন'
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
      moxios.install(client)
      history.replace(routes.PHONE_NUMBER_VERIFICATION, {
        forgottenItem: FORGOTTEN_ITEMS.USERNAME
      })
      app.update()
    })
    afterEach(() => {
      moxios.uninstall(client)
    })

    it("doesn't shows field error when valid phone number is given", () => {
      app
        .find('#phone-number-input')
        .hostNodes()
        .simulate('change', { target: { value: '01711111111' } })
      expect(app.find('#phone-number_error').hostNodes()).toHaveLength(0)
    })

    it('continue button call valid endpoint when valid phone number is given', async () => {
      app
        .find('#phone-number-input')
        .hostNodes()
        .simulate('change', { target: { value: '01711111111' } })
      app.find('#continue').hostNodes().simulate('submit')
      await wait()

      const request = moxios.requests.mostRecent()
      expect(request.url).toMatch(/verifyUser/)
    })
  })

  describe('Valid phone number, invalid submission', () => {
    beforeEach(() => {
      moxios.install(client)
    })
    afterEach(() => {
      moxios.uninstall(client)
    })

    it('should show error message', (done) => {
      history.replace(routes.PHONE_NUMBER_VERIFICATION, {
        forgottenItem: FORGOTTEN_ITEMS.PASSWORD
      })
      app.update()
      app
        .find('#phone-number-input')
        .hostNodes()
        .simulate('change', { target: { value: '01712345679' } })
      app.find('#continue').hostNodes().simulate('submit')
      app.update()

      moxios.wait(() => {
        const request = moxios.requests.mostRecent()
        request
          .respondWith({
            err: {
              response: {
                status: 401
              }
            }
          })
          .then(() => {
            app.update()
            expect(app.find('#phone-number_error').hostNodes()).toHaveLength(1)
            done()
          })
      })
    })
  })

  describe('Form redirection', () => {
    beforeEach(() => {
      moxios.install(client)
    })
    afterEach(() => {
      moxios.uninstall(client)
    })

    it('redirects to security question form when username is chosen as forgotten item', (done) => {
      history.replace(routes.PHONE_NUMBER_VERIFICATION, {
        forgottenItem: FORGOTTEN_ITEMS.USERNAME
      })
      app.update()
      app
        .find('#phone-number-input')
        .hostNodes()
        .simulate('change', { target: { value: '01712345678' } })
      app.find('#continue').hostNodes().simulate('submit')
      moxios.wait(() => {
        const request = moxios.requests.mostRecent()
        request
          .respondWith({
            status: 200,
            response: {
              nonce: 'KkcVYTRVC6usF7Vjdi3FSw==',
              securityQuestionKey: 'FAVORITE_SONG'
            }
          })
          .then(() => {
            expect(window.location.pathname).toContain(routes.SECURITY_QUESTION)
            done()
          })
      })
    })

    it('redirects to recovery code entry form form when password is chosen as forgotten item', (done) => {
      history.replace(routes.PHONE_NUMBER_VERIFICATION, {
        forgottenItem: FORGOTTEN_ITEMS.PASSWORD
      })
      app.update()
      app
        .find('#phone-number-input')
        .hostNodes()
        .simulate('change', { target: { value: '01712345678' } })
      app.find('#continue').hostNodes().simulate('submit')
      moxios.wait(() => {
        const request = moxios.requests.mostRecent()
        request
          .respondWith({
            status: 200,
            response: {
              nonce: 'KkcVYTRVC6usF7Vjdi3FSw=='
            }
          })
          .then(() => {
            expect(window.location.pathname).toContain(
              routes.RECOVERY_CODE_ENTRY
            )
            done()
          })
      })
    })
  })
})

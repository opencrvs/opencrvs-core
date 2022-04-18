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
import { ReactWrapper } from 'enzyme'
import { History } from 'history'

describe('Test reset credentials success page', () => {
  let app: ReactWrapper
  let history: History

  describe('Page content when username is chosen as forgotten item', () => {
    beforeEach(async () => {
      const testApp = await createTestApp()
      app = testApp.app
      history = testApp.history

      history.replace(routes.SUCCESS, {
        forgottenItem: FORGOTTEN_ITEMS.USERNAME
      })
      app.update()
    })

    it('loads correct header', () => {
      expect(app.text()).toContain('Username reminder sent')
    })

    it('loads corrent subheader', () => {
      expect(app.text()).toContain(
        'Check your phone for a reminder of your username'
      )
    })
  })

  describe('Page content when password is chosen as forgotten item', () => {
    beforeEach(async () => {
      const testApp = await createTestApp()
      app = testApp.app
      history = testApp.history

      history.replace(routes.SUCCESS, {
        forgottenItem: FORGOTTEN_ITEMS.PASSWORD
      })
      app.update()
    })

    it('loads correct header', () => {
      expect(app.text()).toContain('Passowrd reset successful')
    })

    it('loads corrent subheader', () => {
      expect(app.text()).toContain('You can now login with your new password')
    })
  })

  describe('Login button', () => {
    beforeEach(async () => {
      const testApp = await createTestApp()
      app = testApp.app
      history = testApp.history

      history.replace(routes.SUCCESS, {
        forgottenItem: FORGOTTEN_ITEMS.USERNAME
      })
      app.update()
    })

    it('login button redirects to home page', () => {
      app.find('#login-button').hostNodes().simulate('click')
      expect(window.location.pathname).toContain(routes.STEP_ONE)
    })
  })
})

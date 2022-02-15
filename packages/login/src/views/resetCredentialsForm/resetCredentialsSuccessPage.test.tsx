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
      expect(app.text()).toContain('ব্যবহারকারীর নাম পাঠানো হয়েছে')
    })

    it('loads corrent subheader', () => {
      expect(app.text()).toContain(
        'আপনার ব্যবহারকারীর নামের জন্য আপনার ফোনটি পরীক্ষা করুন'
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
      expect(app.text()).toContain('সফলভাবে পাসওয়ার্ড পুনরায় সেট হয়েছে')
    })

    it('loads corrent subheader', () => {
      expect(app.text()).toContain(
        'আপনি এখন আপনার নতুন পাসওয়ার্ড দিয়ে লগইন করতে পারেন'
      )
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

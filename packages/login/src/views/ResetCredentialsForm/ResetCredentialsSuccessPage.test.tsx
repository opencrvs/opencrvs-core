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
import { FORGOTTEN_ITEMS } from '@login/login/actions'
import * as routes from '@login/navigation/routes'
import { createTestApp } from '@login/tests/util'
import { ReactWrapper } from 'enzyme'
import { createMemoryRouter } from 'react-router-dom'

describe('Test reset credentials success page', () => {
  let app: ReactWrapper
  let router: ReturnType<typeof createMemoryRouter>

  describe('Page content when username is chosen as forgotten item', () => {
    beforeEach(async () => {
      const testApp = await createTestApp({
        initialEntries: [
          {
            pathname: routes.SUCCESS,
            state: {
              forgottenItem: FORGOTTEN_ITEMS.USERNAME
            }
          }
        ]
      })
      app = testApp.app
      router = testApp.router

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
      const testApp = await createTestApp({
        initialEntries: [
          {
            pathname: routes.SUCCESS,
            state: {
              forgottenItem: FORGOTTEN_ITEMS.PASSWORD
            }
          }
        ]
      })
      app = testApp.app
      router = testApp.router

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
      const testApp = await createTestApp({
        initialEntries: [
          {
            pathname: routes.SUCCESS,
            state: {
              forgottenItem: FORGOTTEN_ITEMS.USERNAME
            }
          }
        ]
      })

      app = testApp.app
      router = testApp.router

      app.update()
    })

    it('login button redirects to home page', () => {
      app.find('#login-button').hostNodes().simulate('click')
      expect(router.state.location.pathname).toContain(routes.STEP_ONE)
    })
  })
})

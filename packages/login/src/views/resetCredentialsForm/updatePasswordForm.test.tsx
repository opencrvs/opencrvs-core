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
import * as routes from '@login/navigation/routes'
import { createStore } from '@login/store'
import { createTestApp } from '@login/tests/util'
import { ReactWrapper } from 'enzyme'
import { History } from 'history'

describe('Test password update form', () => {
  let app: ReactWrapper
  let history: History

  beforeEach(async () => {
    const appBundle = await createTestApp()
    app = appBundle.app
    history = appBundle.history

    history.replace(routes.UPDATE_PASSWORD, {
      nonce: '123456789'
    })
    app.update()
  })

  it('it shows passwords missmatch error when Continue button is pressed', async () => {
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
      'উল্লেখিত পাসওয়ার্ড মিলে নি'
    )
  })

  it('it passes validations', () => {
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
    expect(app.text()).toContain('উল্লেখিত পাসওয়ার্ড মিলেছে')
  })

  it('it shows passwords required error when Continue button is pressed', () => {
    app.find('#continue-button').hostNodes().simulate('submit')
    expect(app.find('#GlobalError').hostNodes().text()).toEqual(
      'নতুন পাসওয়ার্ডটি সঠিক নয়'
    )
  })
})

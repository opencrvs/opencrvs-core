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
      'Passwords do not match'
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
    expect(app.text()).toContain('Passwords match')
  })

  it('it shows passwords required error when Continue button is pressed', () => {
    app.find('#continue-button').hostNodes().simulate('submit')
    expect(app.find('#GlobalError').hostNodes().text()).toEqual(
      'New password is not valid'
    )
  })
})

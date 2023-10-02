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
import { createTestComponent, wait } from '@login/tests/util'
import { ReactWrapper } from 'enzyme'
import * as React from 'react'
import { ForgottenItem } from './forgottenItemForm'

describe('Test forgotten item form', () => {
  let component: ReactWrapper
  beforeEach(() => {
    component = createTestComponent(<ForgottenItem />)
  })

  it('shows error when no option is chosen and pressed continue', async () => {
    component.find('form').simulate('submit')
    await wait()
    expect(component.find('#error-text').hostNodes()).toHaveLength(1)
  })

  it('redirect to phone number confirmation form for valid form submision', async () => {
    component
      .find('#usernameOption')
      .hostNodes()
      .simulate('change', { target: { value: 'username' } })
    await wait()
    component.find('form').simulate('submit')
    await wait()

    expect(window.location.href).toContain('/phone-number-verification')
  })
})

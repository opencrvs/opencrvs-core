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
import * as React from 'react'
import { createTestComponent } from '@client/tests/util'
import { SecureAccount } from '@client/views/SecureAccount/SecureAccountView'
import { createStore } from '@client/store'
import { ReactWrapper } from 'enzyme'

describe('Login app > Secure Account Page', () => {
  let component: ReactWrapper

  beforeEach(async () => {
    const { store, history } = createStore()
    const testComponent = await createTestComponent(
      <SecureAccount onComplete={() => null} />,
      { store, history }
    )
    component = testComponent
  })
  it('Renders the secure account page successfully', () => {
    const elem = component.find('#createPinBtn').hostNodes()
    expect(elem).toHaveLength(1)
  })
  it('Create pin button click takes user to create pin screen', async () => {
    component.find('#createPinBtn').hostNodes().simulate('click')
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve()
      }, 50)
    })

    component.update()
    expect(component.find('#keypad-1').hostNodes()).toHaveLength(1)
  })
})

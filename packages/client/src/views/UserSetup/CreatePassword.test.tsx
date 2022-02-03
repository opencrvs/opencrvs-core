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
import { createStore } from '@client/store'
import { CreatePassword } from './CreatePassword'
import { ReactWrapper } from 'enzyme'

const { store } = createStore()

describe('CreatePassword page tests', () => {
  let component: ReactWrapper
  beforeEach(async () => {
    const testComponent = await createTestComponent(
      // @ts-ignore
      <CreatePassword goToStep={() => {}} setupData={{ userId: '123' }} />,
      store
    )

    component = testComponent.component
  })

  it('it shows passwords missmatch error when Continue button is pressed', async () => {
    component.find('input#NewPassword').simulate('change', {
      target: { id: 'NewPassword', value: '0crvsPassword' }
    })
    component.find('input#ConfirmPassword').simulate('change', {
      target: { id: 'ConfirmPassword', value: 'missmatch' }
    })
    component.find('button#Continue').simulate('click')
    expect(component.find('#GlobalError').hostNodes().text()).toEqual(
      'Passwords do not match'
    )
  })
  it('it passes validations', () => {
    component.find('input#NewPassword').simulate('change', {
      target: { id: 'NewPassword', value: '0crvsPassword' }
    })
    component.find('input#ConfirmPassword').simulate('change', {
      target: { id: 'ConfirmPassword', value: '0crvsPassword' }
    })
    component.find('button#Continue').simulate('click')
  })
  it('it shows passwords required error when Continue button is pressed', () => {
    component.find('button#Continue').simulate('click')
    expect(component.find('#GlobalError').hostNodes().text()).toEqual(
      'New password is not valid'
    )
  })
})

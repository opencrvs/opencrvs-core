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
import * as React from 'react'
import { createTestComponent } from '@client/tests/util'
import { createStore } from '@client/store'
import { CreatePassword } from './CreatePassword'
import { ReactWrapper } from 'enzyme'

const { store } = createStore()

describe('CreatePassword page tests', () => {
  let component: ReactWrapper
  beforeEach(async () => {
    const { component: testComponent } = await createTestComponent(
      // @ts-ignore
      <CreatePassword goToStep={() => {}} setupData={{ userId: '123' }} />,
      { store }
    )

    component = testComponent
  })

  it('it shows passwords missmatch error when Continue button is clicked', async () => {
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
  it('it shows passwords mismatch error when Enter/Return key is pressed on ConfirmPassword field', async () => {
    component.find('input#NewPassword').simulate('change', {
      target: { id: 'NewPassword', value: '0crvsPassword' }
    })
    component.find('input#ConfirmPassword').simulate('change', {
      target: { id: 'ConfirmPassword', value: 'missmatch' }
    })
    component.find('input#ConfirmPassword').simulate('keyDown', {
      key: 'Enter',
      keyCode: 13,
      which: 13
    })
    expect(component.find('#GlobalError').hostNodes().text()).toEqual(
      'Passwords do not match'
    )
  })
  it('it shows passwords mismatch error when Enter/Return key is pressed on NewPassword field', async () => {
    component.find('input#NewPassword').simulate('change', {
      target: { id: 'NewPassword', value: '0crvsPassword' }
    })
    component.find('input#NewPassword').simulate('keyDown', {
      key: 'Enter',
      keyCode: 13,
      which: 13
    })
    expect(component.find('#GlobalError').hostNodes().text()).toEqual(
      'Passwords do not match'
    )
  })
  it('it passes validations when Continue button is clicked', () => {
    component.find('input#NewPassword').simulate('change', {
      target: { id: 'NewPassword', value: '0crvsPassword' }
    })
    component.find('input#ConfirmPassword').simulate('change', {
      target: { id: 'ConfirmPassword', value: '0crvsPassword' }
    })
    component.find('button#Continue').simulate('click')
    expect(component.find('#GlobalError').hostNodes().text().length).toBe(0)
  })
  it('it passes validations when Enter/Return key is pressed on ConfirmPassword field', () => {
    component.find('input#NewPassword').simulate('change', {
      target: { id: 'NewPassword', value: '0crvsPassword' }
    })
    component.find('input#ConfirmPassword').simulate('change', {
      target: { id: 'ConfirmPassword', value: '0crvsPassword' }
    })
    component.find('input#ConfirmPassword').simulate('keyDown', {
      key: 'Enter',
      keyCode: 13,
      which: 13
    })
    expect(component.find('#GlobalError').hostNodes().text().length).toBe(0)
  })
  it('it passes validations when Enter/Return key is pressed on NewPassword field', () => {
    component.find('input#NewPassword').simulate('change', {
      target: { id: 'NewPassword', value: '0crvsPassword' }
    })
    component.find('input#ConfirmPassword').simulate('change', {
      target: { id: 'ConfirmPassword', value: '0crvsPassword' }
    })
    component.find('input#NewPassword').simulate('keyDown', {
      key: 'Enter',
      keyCode: 13,
      which: 13
    })
    expect(component.find('#GlobalError').hostNodes().text().length).toBe(0)
  })
  it('it shows disabled continue button when no password is given', () => {
    expect(
      component.find('button#Continue').hostNodes().props().disabled
    ).toBeTruthy()
  })
  it('it shows disabled continue button when password is not valid', () => {
    component.find('input#NewPassword').simulate('change', {
      target: { id: 'NewPassword', value: '0ocrvs' }
    })
    component.find('input#ConfirmPassword').simulate('change', {
      target: { id: 'ConfirmPassword', value: '0ocrvs' }
    })
    expect(
      component.find('button#Continue').hostNodes().props().disabled
    ).toBeTruthy()
  })
})

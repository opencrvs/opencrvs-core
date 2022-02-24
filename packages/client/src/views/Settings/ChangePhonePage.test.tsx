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
import {
  createTestComponent,
  createRouterProps,
  userDetails
} from '@client/tests/util'
import { AppStore, createStore } from '@client/store'
import { getStorageUserDetailsSuccess } from '@opencrvs/client/src/profile/profileActions'
import { ReactWrapper } from 'enzyme'
import { changePhoneMutation, ChangePhonePage } from './ChangePhonePage'
import { waitForElement } from '@client/tests/wait-for-element'
import { History } from 'history'

const graphqlMocks = [
  {
    request: {
      query: changePhoneMutation,
      variables: {
        userId: '123',
        phoneNumber: '0755555555',
        nonce: '000000',
        verifyCode: '000000'
      }
    },
    result: {
      data: []
    }
  }
]

describe('Change phone page tests', () => {
  let component: ReactWrapper
  const { history } = createRouterProps('/settings/phone')
  const { store } = createStore(history)
  beforeEach(async () => {
    store.dispatch(getStorageUserDetailsSuccess(JSON.stringify(userDetails)))

    const testComponent = await createTestComponent(<ChangePhonePage />, {
      store,
      history,
      graphqlMocks
    })
    component = testComponent
  })

  it('Continue button should be disabled', () => {
    expect(
      component.find('#continue-button').hostNodes().prop('disabled')
    ).toBe(true)
  })

  it('should enable continue button when input valid phone number', async () => {
    const textInput = component.find('#PhoneNumber').hostNodes()
    expect(textInput).toHaveLength(1)

    component.find('input').simulate('change', {
      target: { name: 'PhoneNumber', value: '0970545855' }
    })
    await waitForElement(component, '#continue-button')
    component.update()
    expect(
      component.find('#continue-button').hostNodes().prop('disabled')
    ).toBe(false)
  })

  it('should go to verify code page', async () => {
    const phoneTextInput = component.find('#PhoneNumber').hostNodes()
    expect(phoneTextInput).toHaveLength(1)

    component.find('input').simulate('change', {
      target: { name: 'PhoneNumber', value: '0970545855' }
    })
    await waitForElement(component, '#continue-button')
    component.update()
    component.find('#continue-button').hostNodes().simulate('click')
    expect(component.find('#verify-button').hostNodes().prop('disabled')).toBe(
      true
    )
  })

  it('should go to settings page after change phone number', async () => {
    const phoneTextInput = component.find('#PhoneNumber').hostNodes()
    expect(phoneTextInput).toHaveLength(1)

    component.find('input').simulate('change', {
      target: { name: 'PhoneNumber', value: '0970545855' }
    })
    await waitForElement(component, '#continue-button')
    component.update()
    component.find('#continue-button').hostNodes().simulate('click')
    expect(component.find('#verify-button').hostNodes().prop('disabled')).toBe(
      true
    )
    const VerifyTextInput = component.find('#verifyCode').hostNodes()
    expect(VerifyTextInput).toHaveLength(1)
    component.find('input').simulate('change', {
      target: { name: 'verifyCode', value: '000000' }
    })
    expect(component.find('#verify-button').hostNodes().prop('disabled')).toBe(
      false
    )
    component.find('#verify-button').hostNodes().simulate('click')
    expect(history.location.pathname).toContain('/')
  })
})

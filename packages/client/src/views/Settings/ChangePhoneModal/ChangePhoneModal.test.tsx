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
import {
  createTestComponent,
  createRouterProps,
  userDetails
} from '@client/tests/util'
import { createStore } from '@client/store'
import { getStorageUserDetailsSuccess } from '@opencrvs/client/src/profile/profileActions'
import { ReactWrapper } from 'enzyme'
import { ChangePhoneModal } from '@client/views/Settings/ChangePhoneModal/ChangePhoneModal'
import { changePhoneMutation } from '@client/views/Settings/mutations'
import { queriesForUser } from '@client/views/Settings/queries'
import { waitForElement } from '@client/tests/wait-for-element'
import { vi } from 'vitest'
import { NetworkStatus } from '@apollo/client'

const graphqlMocks = [
  {
    request: {
      query: changePhoneMutation,
      variables: {
        userId: '123',
        phoneNumber: '+8801741234567',
        nonce: '',
        verifyCode: '000000'
      }
    },
    result: {
      data: []
    }
  }
]

describe('Change phone modal tests', () => {
  let component: ReactWrapper
  const onSuccessMock = vi.fn()
  const { history } = createRouterProps('/settings')
  const { store } = createStore(history)
  beforeEach(async () => {
    store.dispatch(getStorageUserDetailsSuccess(JSON.stringify(userDetails)))

    const testComponent = await createTestComponent(
      <ChangePhoneModal
        show={true}
        onSuccess={onSuccessMock}
        onClose={vi.fn()}
      />,
      {
        store,
        history,
        graphqlMocks
      }
    )
    component = testComponent
  })

  it('Continue button should be disabled', () => {
    expect(
      component.find('#continue-button').hostNodes().prop('disabled')
    ).toBe(true)
  })

  it('should enable continue button when input valid phone number', async () => {
    component.find('input').simulate('change', {
      target: { name: 'PhoneNumber', value: '01741234567' }
    })
    component.update()
    expect(
      component.find('#continue-button').hostNodes().prop('disabled')
    ).toBe(false)
  })

  it('should render verify code view', async () => {
    queriesForUser.fetchUserDetailsByMobile = vi.fn(() =>
      Promise.resolve({
        data: {
          getUserByMobile: null
        },
        loading: false,
        networkStatus: NetworkStatus.ready
      })
    )
    component.find('input').simulate('change', {
      target: { name: 'PhoneNumber', value: '01741234567' }
    })
    component.update()
    component.find('#continue-button').hostNodes().simulate('click')
    component.update()
    await waitForElement(component, '#verify-button')
    expect(component.find('#verify-button').hostNodes().prop('disabled')).toBe(
      true
    )
  })

  it('should trigger onSuccess callback after change phone number', async () => {
    queriesForUser.fetchUserDetailsByMobile = vi.fn(() =>
      Promise.resolve({
        data: {
          getUserByMobile: null
        },
        loading: false,
        networkStatus: NetworkStatus.ready
      })
    )
    component
      .find('#PhoneNumber')
      .hostNodes()
      .simulate('change', {
        target: { value: '01741234567' }
      })
    component.update()
    component.find('#continue-button').hostNodes().simulate('click')
    await waitForElement(component, '#VerifyCode')

    component
      .find('#VerifyCode')
      .hostNodes()
      .simulate('change', {
        target: { value: '000000' }
      })
    component.update()

    await waitForElement(component, '#verify-button')
    expect(component.find('#verify-button').hostNodes().prop('disabled')).toBe(
      false
    )
    component.find('#verify-button').hostNodes().simulate('click')

    // wait for mocked data to load mockedProvider
    await new Promise((resolve) => {
      setTimeout(resolve, 100)
    })

    component.update()
    expect(onSuccessMock).toBeCalledTimes(1)
  })
})

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
import { changeEmailMutation } from '@client/views/Settings/mutations'
import { queriesForUser } from '@client/views/Settings/queries'
import { waitForElement } from '@client/tests/wait-for-element'
import { vi } from 'vitest'
import { NetworkStatus } from '@apollo/client'
import { ChangeEmailModal } from './ChangeEmailModal'

const graphqlMocks = [
  {
    request: {
      query: changeEmailMutation,
      variables: {
        userId: '123',
        email: 'rabiul@gmail.com',
        nonce: '',
        verifyCode: '000000'
      }
    },
    result: {
      data: []
    }
  }
]

describe('Change email modal tests', () => {
  let component: ReactWrapper
  const onSuccessMock = vi.fn()
  const { history } = createRouterProps('/settings')
  const { store } = createStore(history)
  beforeEach(async () => {
    store.dispatch(getStorageUserDetailsSuccess(JSON.stringify(userDetails)))

    const testComponent = await createTestComponent(
      <ChangeEmailModal
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

  it('should enable continue button when input valid email address', async () => {
    component.find('input').simulate('change', {
      target: { name: 'emailAddress', value: 'test@test.org' }
    })
    component.update()
    expect(
      component.find('#continue-button').hostNodes().prop('disabled')
    ).toBe(false)
  })

  it('should render verify code view', async () => {
    queriesForUser.fetchUserDetailsByEmail = vi.fn(() =>
      Promise.resolve({
        data: {
          getUserByEmail: null
        },
        loading: false,
        networkStatus: NetworkStatus.ready
      })
    )
    component.find('input').simulate('change', {
      target: { name: 'emailAddress', value: 'test@test.org' }
    })
    component.update()
    component.find('#continue-button').hostNodes().simulate('click')
    component.update()
    await waitForElement(component, '#verify-button')
    expect(component.find('#verify-button').hostNodes().prop('disabled')).toBe(
      true
    )
  })

  it('should trigger onSuccess callback after change email address', async () => {
    queriesForUser.fetchUserDetailsByEmail = vi.fn(() =>
      Promise.resolve({
        data: {
          getUserByEmail: null
        },
        loading: false,
        networkStatus: NetworkStatus.ready
      })
    )
    component
      .find('#EmailAddressTextInput')
      .hostNodes()
      .simulate('change', {
        target: { value: 'rabiul@gmail.com' }
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
      setTimeout(resolve, 1000)
    })

    component.update()
    expect(onSuccessMock).toBeCalledTimes(1)
  })
})

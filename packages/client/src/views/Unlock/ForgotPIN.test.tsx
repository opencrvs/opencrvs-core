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
import React from 'react'
import { ReactWrapper } from 'enzyme'
import { AppStore, createStore } from '@client/store'
import {
  createTestComponent,
  flushPromises,
  userDetails
} from '@client/tests/util'
import { ForgotPIN } from '@client/views/Unlock/ForgotPIN'
import { waitForElement } from '@client/tests/wait-for-element'
import { setUserDetails } from '@client/profile/profileActions'
import { UUID } from '@opencrvs/commons/client'
import { storage } from '@client/storage'
import { SCREEN_LOCK } from '@client/components/ProtectedPage'
import { SECURITY_PIN_EXPIRED_AT } from '@client/utils/constants'
import { vi, Mock } from 'vitest'

describe('ForgotPIN tests', () => {
  let component: ReactWrapper
  let store: AppStore
  const goBackMock: Mock = vi.fn()
  const onVerifyPasswordMock = vi.fn()

  beforeAll(async () => {
    ;({ store } = await createStore())

    store.dispatch(
      setUserDetails({
        ...userDetails,
        id: '5eba726866458970cf2e23c2',
        mobile: '+8801711111111',
        primaryOfficeId: '895cc945-94a9-4195-9a29-22e9310f3385' as UUID,
        name: [{ use: 'en', given: ['Shakib'], family: 'Al Hasan' }]
      })
    )
  })

  beforeEach(async () => {
    const { component: testComponent } = await createTestComponent(
      <ForgotPIN goBack={goBackMock} onVerifyPassword={onVerifyPasswordMock} />,
      { store }
    )
    component = testComponent

    // wait for mocked data to load mockedProvider
    await new Promise((resolve) => {
      setTimeout(resolve, 100)
    })

    component.update()
  })

  it('renders forgotPIN overlay', () => {
    expect(component.find('#forgotPinPage').hostNodes()).toHaveLength(1)
  })

  it('clicking on back triggers goBack', async () => {
    const backButton = await waitForElement(component, '#action_back')
    backButton.hostNodes().simulate('click')
    expect(goBackMock).toBeCalledTimes(1)
  })

  it('clicking on verify with empty password field shows error', async () => {
    const formElement = await waitForElement(
      component,
      '#password_verification_form'
    )
    formElement.hostNodes().simulate('submit')
    component.update()
    const formError = await waitForElement(component, '#form_error')
    expect(formError.hostNodes()).toHaveLength(1)
    expect(formError.hostNodes().text()).toBe('This field is required')
  })

  it('clicking on logout removes indexedDB entries', async () => {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const indexeddb: Record<string, any> = {
      [SCREEN_LOCK]: true,
      [SECURITY_PIN_EXPIRED_AT]: 1234
    }

    storage.removeItem = vi.fn((key: string) => {
      delete indexeddb[key]
      return Promise.resolve()
    })

    const logoutButton = await waitForElement(component, '#logout')

    logoutButton.hostNodes().simulate('click')

    expect(indexeddb[SCREEN_LOCK]).toBeFalsy()

    expect(indexeddb[SECURITY_PIN_EXPIRED_AT]).toBeFalsy()
  })

  it('clicking on forgot password logs out and redirects to forgot password screen of login app', async () => {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const indexeddb: Record<string, any> = {
      [SCREEN_LOCK]: true,
      [SECURITY_PIN_EXPIRED_AT]: 1234
    }

    storage.removeItem = vi.fn((key: string) => {
      delete indexeddb[key]
      return Promise.resolve()
    })

    const originalLocation = window.location
    delete (window as { location?: Location }).location
    window.location = {
      ...originalLocation,
      assign: vi.fn()
    }

    const forgotPasswordButton = await waitForElement(
      component,
      '#forgot_password'
    )

    forgotPasswordButton.hostNodes().simulate('click')

    expect(indexeddb[SCREEN_LOCK]).toBeFalsy()

    expect(indexeddb[SECURITY_PIN_EXPIRED_AT]).toBeFalsy()
    expect(window.location.assign).toBeCalledWith(
      '/login/forgotten-item?lang=en'
    )
    window.location = originalLocation
  })
})

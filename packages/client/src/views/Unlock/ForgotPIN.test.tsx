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
import { createTestComponent, flushPromises } from '@client/tests/util'
import { ForgotPIN } from '@client/views/Unlock/ForgotPIN'
import { waitForElement } from '@client/tests/wait-for-element'
import { setUserDetails } from '@client/profile/profileActions'
import { NetworkStatus } from '@apollo/client'
import { userQueries } from '@client/user/queries'
import { storage } from '@client/storage'
import { SCREEN_LOCK } from '@client/components/ProtectedPage'
import { SECURITY_PIN_EXPIRED_AT } from '@client/utils/constants'
import { History } from 'history'
import { vi, Mock } from 'vitest'
import { SystemRoleType, Status } from '@client/utils/gateway'

describe('ForgotPIN tests', () => {
  let component: ReactWrapper
  let store: AppStore
  let history: History
  const goBackMock: Mock = vi.fn()
  const onVerifyPasswordMock = vi.fn()
  userQueries.verifyPasswordById = vi.fn()

  beforeAll(async () => {
    ;({ store, history } = await createStore())

    store.dispatch(
      setUserDetails({
        loading: false,
        networkStatus: NetworkStatus.ready,
        data: {
          getUser: {
            id: '5eba726866458970cf2e23c2',
            username: 'a.alhasan',
            creationDate: '2022-10-03T10:42:46.920Z',
            userMgntUserID: '5eba726866458970cf2e23c2',
            practitionerId: '778464c0-08f8-4fb7-8a37-b86d1efc462a',
            mobile: '+8801711111111',
            systemRole: SystemRoleType.FieldAgent,
            role: {
              _id: '778464c0-08f8-4fb7-8a37-b86d1efc462a',
              labels: [
                {
                  lang: 'en',
                  label: 'CHA'
                }
              ]
            },
            status: Status.Active,
            name: [
              {
                use: 'en',
                firstNames: 'Shakib',
                familyName: 'Al Hasan'
              }
            ],
            catchmentArea: [
              {
                id: '514cbc3a-cc99-4095-983f-535ea8cb6ac0',
                name: 'Baniajan',
                alias: ['বানিয়াজান'],
                status: 'active',
                identifier: [
                  {
                    system:
                      'http://opencrvs.org/specs/id/a2i-internal-reference',
                    value: 'division=9&district=30&upazila=233&union=4194'
                  }
                ]
              }
            ],
            primaryOffice: undefined,
            localRegistrar: {
              name: [
                {
                  use: 'en',
                  firstNames: 'Mohammad',
                  familyName: 'Ashraful'
                }
              ],
              role: SystemRoleType.LocalRegistrar,
              signature: undefined
            }
          }
        }
      })
    )
  })

  beforeEach(async () => {
    component = await createTestComponent(
      <ForgotPIN goBack={goBackMock} onVerifyPassword={onVerifyPasswordMock} />,
      { store, history }
    )

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

  it('wrong password submission shows error', async () => {
    ;(userQueries.verifyPasswordById as Mock).mockRejectedValueOnce({
      data: {
        verifyPasswordById: null
      },
      errors: [
        {
          message: 'Unauthorized to verify password',
          path: ['verifyPasswordById'],
          extensions: {
            code: 'INTERNAL_SERVER_ERROR'
          }
        }
      ]
    })
    const passwordInput = await waitForElement(component, 'input#password')
    passwordInput.hostNodes().simulate('change', {
      target: { id: 'password', value: 'wrongPassword' }
    })

    const formElement = await waitForElement(
      component,
      '#password_verification_form'
    )

    formElement.hostNodes().simulate('submit')

    await flushPromises()

    const formError = await waitForElement(component, '#form_error')
    expect(formError.hostNodes()).toHaveLength(1)
    expect(formError.hostNodes().text()).toBe(
      'The password you entered was incorrect'
    )
  })

  it('correct password submission triggers onVerifyPassword', async () => {
    ;(userQueries.verifyPasswordById as Mock).mockReturnValueOnce({
      data: {
        verifyPasswordById: {
          id: '5eba726866458970cf2e23c2',
          username: 'sakibal.hasan'
        }
      }
    })
    const passwordInput = await waitForElement(component, 'input#password')
    passwordInput.hostNodes().simulate('change', {
      target: { id: 'password', value: 'correctPassword' }
    })

    const formElement = await waitForElement(
      component,
      '#password_verification_form'
    )

    formElement.hostNodes().simulate('submit')

    await flushPromises()

    expect(onVerifyPasswordMock).toBeCalledTimes(1)
  })

  it('clicking on logout removes indexedDB entries', async () => {
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
      'http://localhost:3020/forgotten-item?lang=en'
    )
    window.location = originalLocation
  })
})

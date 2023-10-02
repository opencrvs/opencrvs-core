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
import { ReactWrapper } from 'enzyme'
import { createTestComponent, flushPromises } from '@client/tests/util'
import { createStore } from '@client/store'
import { Unlock } from '@client/views/Unlock/Unlock'
import { storage } from '@client/storage'
import { pinValidator } from '@client/views/Unlock/ComparePINs'
import { SCREEN_LOCK } from '@client/components/ProtectedPage'
import { SECURITY_PIN_EXPIRED_AT } from '@client/utils/constants'
import { waitForElement } from '@client/tests/wait-for-element'
import { vi, Mock } from 'vitest'

const clearPassword = (component: ReactWrapper) => {
  const pinInput = component.find('#pin-input').hostNodes().first()

  pinInput.simulate('keypress', { key: 'Backspace' })
  pinInput.simulate('keypress', { key: 'Backspace' })
  pinInput.simulate('keypress', { key: 'Backspace' })
  pinInput.simulate('keypress', { key: 'Backspace' })
  component.update()
}
const pressPin = (component: ReactWrapper, keyCode: number) => {
  component
    .find('#pin-input')
    .hostNodes()
    .first()
    .simulate('keyDown', { keyCode })
  component.update()
}

describe('Unlock page loads Properly', () => {
  let testComponent: ReactWrapper
  const onForgetPinMock: Mock = vi.fn()
  beforeEach(async () => {
    await flushPromises()

    // mock indexeddb
    const indexedDB = {
      USER_DETAILS: JSON.stringify({ userMgntUserID: 'shakib75' }),
      USER_DATA: JSON.stringify([
        {
          userID: 'shakib75',
          userPIN:
            '$2a$10$xQBLcbPgGQNu9p6zVchWuu6pmCrQIjcb6k2W1PIVUxVTE/PumWM82',
          drafts: []
        }
      ]),
      screenLock: undefined,
      USER_ID: 'shakib75',
      locked_time: undefined
    }

    storage.getItem = vi.fn(async (key: string) =>
      // @ts-ignore
      Promise.resolve(indexedDB[key])
    )

    storage.setItem = vi.fn(
      // @ts-ignore
      async (key: string, value: string) => (indexedDB[key] = value)
    )

    const { store, history } = createStore()
    testComponent = await createTestComponent(
      <Unlock onCorrectPinMatch={() => null} onForgetPin={onForgetPinMock} />,
      { store, history }
    )
  })

  it('Should load the Unlock page properly', () => {
    const elem = testComponent.find('#unlockPage').hostNodes().length
    expect(elem).toBe(1)
  })

  it('There should be no error message after providing successfully Pin', () => {
    clearPassword(testComponent)
    pressPin(testComponent, 48)
    pressPin(testComponent, 48)
    pressPin(testComponent, 48)
    pressPin(testComponent, 48)

    testComponent.update()

    expect(testComponent.find('#errorMsg').hostNodes()).toHaveLength(0)
  })

  it('Should trigger onForgetPin when click on forgotten pin link', () => {
    const forgottenPinElement = testComponent.find('#forgotten_pin')
    forgottenPinElement.hostNodes().simulate('click')
    expect(onForgetPinMock).toBeCalledTimes(1)
  })
})

describe('For wrong inputs', () => {
  let testComponent: ReactWrapper
  const onForgetPinMock: Mock = vi.fn()

  beforeEach(async () => {
    await flushPromises()
    vi.clearAllMocks()
    const { store, history } = createStore()
    testComponent = await createTestComponent(
      <Unlock onCorrectPinMatch={() => null} onForgetPin={onForgetPinMock} />,
      { store, history }
    )

    // These tests are only for wrong inputs, so this mock fn only returns a promise of false
    pinValidator.isValidPin = vi.fn(async (pin) => Promise.resolve(false))
  })
  it('Should Display Incorrect error message', async () => {
    pressPin(testComponent, 54)
    pressPin(testComponent, 54)
    pressPin(testComponent, 54)
    pressPin(testComponent, 54)

    testComponent.update()

    const errorMsg = await waitForElement(testComponent, '#errorMsg')

    expect(errorMsg.hostNodes().text()).toBe('Incorrect pin. Please try again')
  })

  it('Should display the Last try message', async () => {
    testComponent.find('UnlockView').instance().setState({ attempt: 2 })

    pressPin(testComponent, 54)
    pressPin(testComponent, 54)
    pressPin(testComponent, 54)
    pressPin(testComponent, 54)

    const errorMsg = await waitForElement(testComponent, '#errorMsg')

    expect(errorMsg.hostNodes().text()).toBe('Last Try')
  })
})

describe('Pin locked session', () => {
  let testComponent: ReactWrapper
  const onForgetPinMock: Mock = vi.fn()
  beforeEach(async () => {
    await flushPromises()
    vi.clearAllMocks()

    Date.now = vi.fn(() => 1578308937586)
    // mock indexeddb
    const indexedDB = {
      USER_DETAILS: JSON.stringify({ userMgntUserID: 'shakib75' }),
      USER_DATA: JSON.stringify([
        {
          userID: 'shakib75',
          userPIN:
            '$2a$10$xQBLcbPgGQNu9p6zVchWuu6pmCrQIjcb6k2W1PIVUxVTE/PumWM82',
          drafts: []
        }
      ]),
      screenLock: undefined,
      USER_ID: 'shakib75',
      locked_time: '1578308927392'
    }

    storage.getItem = vi.fn(async (key: string) =>
      // @ts-ignore
      Promise.resolve(indexedDB[key])
    )

    storage.setItem = vi.fn(
      // @ts-ignore
      async (key: string, value: string) => (indexedDB[key] = value)
    )

    const { store, history } = createStore()
    testComponent = await createTestComponent(
      <Unlock onCorrectPinMatch={() => null} onForgetPin={onForgetPinMock} />,
      { store, history }
    )
  })

  it('Should not accept correct pin while the account is locked', async () => {
    testComponent.find('UnlockView').instance().setState({ attempt: 4 })

    pressPin(testComponent, 54)
    pressPin(testComponent, 54)
    pressPin(testComponent, 54)
    pressPin(testComponent, 54)

    const errorMsg = await waitForElement(testComponent, '#errorMsg')

    expect(errorMsg.hostNodes().text()).toBe(
      'Your account has been locked. Please try again in 1 minute.'
    )
  })
})

describe('Logout Sequence', () => {
  const onForgetPinMock: Mock = vi.fn()

  it('should clear lock-related indexeddb entries upon logout', async () => {
    const { store, history } = createStore()
    const redirect = vi.fn()
    const testComponent = await createTestComponent(
      <Unlock
        onCorrectPinMatch={() => redirect}
        onForgetPin={onForgetPinMock}
      />,
      { store, history }
    )
    const indexeddb = {
      SCREEN_LOCK: true,
      SECURITY_PIN_EXPIRED_AT: 1234
    }
    // @ts-ignore
    storage.removeItem = vi.fn((key: string) => {
      // @ts-ignore
      delete indexeddb[key]
    })
    testComponent.find('#logout').hostNodes().simulate('click')
    testComponent.update()
    // @ts-ignore
    expect(indexeddb[SCREEN_LOCK]).toBeFalsy()
    // @ts-ignore
    expect(indexeddb[SECURITY_PIN_EXPIRED_AT]).toBeFalsy()
  })
})

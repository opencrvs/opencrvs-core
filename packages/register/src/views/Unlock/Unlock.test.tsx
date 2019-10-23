import * as React from 'react'
import { ReactWrapper } from 'enzyme'
import { createTestComponent, flushPromises } from '@register/tests/util'
import { createStore } from '@register/store'
import { Unlock } from '@register/views/Unlock/Unlock'
import { storage } from '@register/storage'
import { pinOps } from '@register/views/Unlock/ComparePINs'
import { SCREEN_LOCK } from '@register/components/ProtectedPage'
import { SECURITY_PIN_EXPIRED_AT } from '@register/utils/constants'

const clearPassword = (component: ReactWrapper) => {
  const backSpaceElem = component.find('#keypad-backspace').hostNodes()
  backSpaceElem.update()
  backSpaceElem.simulate('click')
  backSpaceElem.simulate('click')
  backSpaceElem.simulate('click')
  backSpaceElem.simulate('click')
}

describe('Unlock page loads Properly', () => {
  let testComponent: { component: ReactWrapper }
  beforeEach(async () => {
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
      // eslint-disable-next-line @typescript-eslint/camelcase
      locked_time: undefined
    }

    storage.getItem = jest.fn(async (key: string) =>
      // @ts-ignore
      Promise.resolve(indexedDB[key])
    )

    storage.setItem = jest.fn(
      // @ts-ignore
      async (key: string, value: string) => (indexedDB[key] = value)
    )

    const { store } = createStore()
    testComponent = await createTestComponent(
      <Unlock onCorrectPinMatch={() => null} />,
      store
    )
  })

  it('Should load the Unlock page properly', () => {
    const elem = testComponent.component.find('#unlockPage').hostNodes().length
    expect(elem).toBe(1)
  })

  it('There should be no error message after providing successfull Pin', () => {
    clearPassword(testComponent.component)
    const numberElem = testComponent.component.find('#keypad-0').hostNodes()

    numberElem.simulate('click')
    numberElem.simulate('click')
    numberElem.simulate('click')
    numberElem.simulate('click')
    testComponent.component.update()

    const errorElem = testComponent.component.find('#errorMsg').hostNodes()
      .length
    expect(errorElem).toBe(0)
  })
})

describe('For wrong inputs', () => {
  let testComponent: { component: ReactWrapper }
  beforeEach(async () => {
    const { store } = createStore()
    testComponent = await createTestComponent(
      <Unlock onCorrectPinMatch={() => null} />,
      store
    )

    // These tests are only for wrong inputs, so this mock fn only returns a promise of false
    pinOps.comparePins = jest.fn(async (pin1, pin2) => Promise.resolve(false))
  })
  it('Should Display Incorrect error message', async () => {
    clearPassword(testComponent.component)
    const numberElem = testComponent.component.find('#keypad-1').hostNodes()
    numberElem.simulate('click')
    numberElem.simulate('click')
    numberElem.simulate('click')
    numberElem.simulate('click')
    testComponent.component.update()

    setTimeout(() => {
      const errorElem = testComponent.component
        .find('#errorMsg')
        .hostNodes()
        .text()
      expect(errorElem).toBe('Incorrect pin. Please try again')
    }, 2000)
  })

  it('Should display the Last try message', async () => {
    await flushPromises()
    testComponent.component.update()
    const numberElem = testComponent.component.find('#keypad-1').hostNodes()
    numberElem.simulate('click')
    numberElem.simulate('click')
    numberElem.simulate('click')
    numberElem.simulate('click')

    await flushPromises()
    testComponent.component.update()

    clearPassword(testComponent.component)
    numberElem.simulate('click')
    numberElem.simulate('click')
    numberElem.simulate('click')
    numberElem.simulate('click')

    await flushPromises()
    testComponent.component.update()

    setTimeout(() => {
      const errorElem = testComponent.component
        .find('#errorMsg')
        .hostNodes()
        .text()
      expect(errorElem).toBe('Last Try')
    }, 2000)
  })

  it('Should display Locked Message', async () => {
    const numberElem = testComponent.component.find('#keypad-1').hostNodes()
    numberElem.simulate('click')
    numberElem.simulate('click')
    numberElem.simulate('click')
    numberElem.simulate('click')

    await flushPromises()
    testComponent.component.update()

    setTimeout(() => {
      const errorElem = testComponent.component
        .find('#errorMsg')
        .hostNodes()
        .text()
      expect(errorElem).toBe('Locked')
    }, 2000)
  })

  it('Should not accept any attempt during timeout', async () => {
    const numberElem = testComponent.component.find('#keypad-1').hostNodes()
    numberElem.simulate('click')
    numberElem.simulate('click')
    numberElem.simulate('click')
    numberElem.simulate('click')

    await flushPromises()
    testComponent.component.update()

    setTimeout(() => {
      const errorElem = testComponent.component
        .find('#errorMsg')
        .hostNodes()
        .text()
      expect(errorElem).toBe('Locked')
    }, 2000)
  })

  it('Should not accept correct pin while locked', async () => {
    clearPassword(testComponent.component)
    const numberElem = testComponent.component.find('#keypad-0').hostNodes()
    numberElem.simulate('click')
    numberElem.simulate('click')
    numberElem.simulate('click')
    numberElem.simulate('click')

    await flushPromises()
    testComponent.component.update()

    setTimeout(() => {
      const errorElem = testComponent.component
        .find('#errorMsg')
        .hostNodes()
        .text()
      expect(errorElem).toBe('Locked')
    }, 2000)
  })
})

describe('Logout Sequence', () => {
  it('should clear lock-related indexeddb entries upon logout', async () => {
    const { store } = createStore()
    const redirect = jest.fn()
    const testComponent = await createTestComponent(
      <Unlock onCorrectPinMatch={() => redirect} />,
      store
    )
    const indexeddb = {
      SCREEN_LOCK: true,
      SECURITY_PIN_EXPIRED_AT: 1234
    }
    // @ts-ignore
    storage.removeItem = jest.fn((key: string) => {
      // @ts-ignore
      delete indexeddb[key]
    })
    testComponent.component
      .find('#logout')
      .hostNodes()
      .simulate('click')
    testComponent.component.update()
    // @ts-ignore
    expect(indexeddb[SCREEN_LOCK]).toBeFalsy()
    // @ts-ignore
    expect(indexeddb[SECURITY_PIN_EXPIRED_AT]).toBeFalsy()
  })
})

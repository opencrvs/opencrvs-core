import * as React from 'react'
import { createTestComponent } from '@register/tests/util'
import { CreatePin } from '@register/views/PIN/CreatePin'
import { createStore } from '@register/store'
import { storage } from '@opencrvs/register/src/storage'
import { ReactWrapper } from 'enzyme'

storage.setItem = jest.fn()

describe('Create PIN view', async () => {
  let c: ReactWrapper

  beforeEach(() => {
    const { store } = createStore()
    const testComponent = createTestComponent(
      <CreatePin onComplete={() => null} />,
      store
    )

    c = testComponent.component
  })

  it("shows and error when PINs don't match", async () => {
    c.find('span#keypad-1').simulate('click')
    c.find('span#keypad-1').simulate('click')
    c.find('span#keypad-1').simulate('click')
    c.find('span#keypad-2').simulate('click')

    await new Promise(resolve => {
      setTimeout(() => {
        resolve()
      }, 50)
    })

    c.update()

    c.find('span#keypad-2').simulate('click')
    c.find('span#keypad-2').simulate('click')
    c.find('span#keypad-3').simulate('click')
    c.find('span#keypad-2').simulate('click')

    await new Promise(resolve => {
      setTimeout(() => {
        resolve()
      }, 50)
    })

    c.update()

    expect(c.find('div#error-text')).toHaveLength(1)
  })

  it('allows the user to backspace keypresses', async () => {
    c.find('span#keypad-1').simulate('click')
    c.find('span#keypad-1').simulate('click')
    c.find('span#keypad-1').simulate('click')
    c.find('span#keypad-backspace').simulate('click')
    c.find('span#keypad-1').simulate('click')

    await new Promise(resolve => {
      setTimeout(() => {
        resolve()
      }, 50)
    })

    c.update()

    expect(c.find('span#title-text').text()).toBe('Create a PIN')

    c.find('span#keypad-2').simulate('click')

    await new Promise(resolve => {
      setTimeout(() => {
        resolve()
      }, 50)
    })

    c.update()

    expect(c.find('span#title-text').text()).toBe('Re-enter your new PIN')
  })

  it('prevents the user from using 4 sequential digits as PIN', async () => {
    c.find('span#keypad-1').simulate('click')
    c.find('span#keypad-1').simulate('click')
    c.find('span#keypad-1').simulate('click')
    c.find('span#keypad-1').simulate('click')

    await new Promise(resolve => {
      setTimeout(() => {
        resolve()
      }, 50)
    })

    c.update()

    expect(c.find('div#error-text').text()).toBe(
      'PIN cannot have same 4 digits'
    )
  })

  it('prevents the user from using 4 sequential digits as PIN', async () => {
    c.find('span#keypad-1').simulate('click')
    c.find('span#keypad-2').simulate('click')
    c.find('span#keypad-3').simulate('click')
    c.find('span#keypad-4').simulate('click')

    await new Promise(resolve => {
      setTimeout(() => {
        resolve()
      }, 50)
    })

    c.update()

    expect(c.find('div#error-text').text()).toBe(
      'PIN cannot contain sequential digits'
    )
  })

  it('stores the hashed PIN in storage if PINs match', async () => {
    c.find('span#keypad-1').simulate('click')
    c.find('span#keypad-1').simulate('click')
    c.find('span#keypad-1').simulate('click')
    c.find('span#keypad-2').simulate('click')

    await new Promise(resolve => {
      setTimeout(() => {
        resolve()
      }, 50)
    })

    c.update()

    c.find('span#keypad-1').simulate('click')
    c.find('span#keypad-1').simulate('click')
    c.find('span#keypad-1').simulate('click')
    c.find('span#keypad-2').simulate('click')

    await new Promise(resolve => {
      setTimeout(() => {
        resolve()
      }, 50)
    })

    c.update()

    expect(storage.setItem).toBeCalledWith('USER_DATA', expect.any(String))
  })
})

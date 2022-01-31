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
import { CreatePin } from '@client/views/PIN/CreatePin'
import { createStore } from '@client/store'
import { storage } from '@opencrvs/client/src/storage'
import { ReactWrapper } from 'enzyme'

storage.setItem = jest.fn()

describe('Create PIN view', () => {
  let c: ReactWrapper

  beforeEach(async () => {
    const { store } = createStore()
    const testComponent = await createTestComponent(
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

    await new Promise((resolve) => {
      setTimeout(() => {
        resolve()
      }, 50)
    })

    c.update()

    c.find('span#keypad-2').simulate('click')
    c.find('span#keypad-2').simulate('click')
    c.find('span#keypad-3').simulate('click')
    c.find('span#keypad-2').simulate('click')

    await new Promise((resolve) => {
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

    await new Promise((resolve) => {
      setTimeout(() => {
        resolve()
      }, 50)
    })

    c.update()

    expect(c.find('span#title-text').text()).toBe('Create a PIN')

    c.find('span#keypad-2').simulate('click')

    await new Promise((resolve) => {
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

    await new Promise((resolve) => {
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

    await new Promise((resolve) => {
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

    await new Promise((resolve) => {
      setTimeout(() => {
        resolve()
      }, 50)
    })

    c.update()

    c.find('span#keypad-1').simulate('click')
    c.find('span#keypad-1').simulate('click')
    c.find('span#keypad-1').simulate('click')
    c.find('span#keypad-2').simulate('click')

    await new Promise((resolve) => {
      setTimeout(() => {
        resolve()
      }, 50)
    })

    c.update()

    expect(storage.setItem).toBeCalledWith('USER_DATA', expect.any(String))
  })
})

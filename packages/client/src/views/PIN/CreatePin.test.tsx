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
import { CreatePin } from '@client/views/PIN/CreatePin'
import { createStore } from '@client/store'
import { storage } from '@opencrvs/client/src/storage'
import { ReactWrapper } from 'enzyme'
import { vi } from 'vitest'

storage.setItem = vi.fn()

const pressPin = (component: ReactWrapper, keyCode: number) => {
  component
    .find('#pin-input')
    .hostNodes()
    .first()
    .simulate('keyDown', { keyCode })
  component.update()
}

const pressBackspace = (component: ReactWrapper) => {
  const pinInput = component.find('#pin-input')
  pinInput.hostNodes().first().simulate('keypress', { key: 'Backspace' })
  component.update()
}

describe('Create PIN view', () => {
  let c: ReactWrapper

  beforeEach(async () => {
    const { store, history } = createStore()
    const testComponent = await createTestComponent(
      <CreatePin onComplete={() => null} />,
      { store, history }
    )

    c = testComponent
  })

  it("shows and error when PINs don't match", async () => {
    pressPin(c, 48)
    pressPin(c, 54)
    pressPin(c, 48)
    pressPin(c, 54)

    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve()
      }, 50)
    })

    c.update()

    pressPin(c, 48)
    pressPin(c, 49)
    pressPin(c, 48)
    pressPin(c, 54)

    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve()
      }, 50)
    })

    c.update()

    expect(c.exists('#pinMatchErrorMsg'))
  })

  it('allows the user to backspace keypresses', async () => {
    pressPin(c, 48)
    pressPin(c, 54)
    pressPin(c, 48)
    pressBackspace(c)

    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve()
      }, 50)
    })

    c.update()

    expect(c.find('h1#title-text').text()).toBe('Create a PIN')

    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve()
      }, 50)
    })
    pressPin(c, 54)
    c.update()

    expect(c.find('h1#title-text').text()).toBe('Re-enter your new PIN')
  })

  it('prevents the user from using 4 same digits as PIN', async () => {
    pressPin(c, 48)
    pressPin(c, 48)
    pressPin(c, 48)
    pressPin(c, 48)

    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve()
      }, 50)
    })

    c.update()

    expect(c.exists('#pinHasSameDigitsErrorMsg'))
  })

  it('prevents the user from using 4 sequential digits as PIN', async () => {
    pressPin(c, 48)

    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve()
      }, 50)
    })

    c.update()

    expect(c.exists('#pinHasSeqDigitsErrorMsg'))
  })

  it('stores the hashed PIN in storage if PINs match', async () => {
    pressPin(c, 48)
    pressPin(c, 54)
    pressPin(c, 48)
    pressPin(c, 54)

    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve()
      }, 50)
    })

    c.update()

    pressPin(c, 48)
    pressPin(c, 54)
    pressPin(c, 48)
    pressPin(c, 54)

    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve()
      }, 50)
    })

    c.update()

    expect(storage.setItem).toBeCalledWith('USER_DATA', expect.any(String))
  })
})

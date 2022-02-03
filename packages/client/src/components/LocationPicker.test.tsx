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
import React from 'react'
import { ReactWrapper } from 'enzyme'
import { createTestComponent, flushPromises } from '@client/tests/util'
import { LocationPicker } from './LocationPicker'
import { AppStore, createStore } from '@client/store'
import { waitForElement } from '@client/tests/wait-for-element'
import { History } from 'history'

describe('location picker tests', () => {
  let store: AppStore
  let history: History
  let component: ReactWrapper
  const onChangeLocationMock = jest.fn()

  beforeAll(async () => {
    const appStore = createStore()
    store = appStore.store
    history = appStore.history
  })

  beforeEach(async () => {
    component = await createTestComponent(
      <LocationPicker
        selectedLocationId="bfe8306c-0910-48fe-8bf5-0db906cf3155"
        onChangeLocation={onChangeLocationMock}
      />,
      { store, history },
      { attachTo: document.body }
    )
  })

  afterEach(() => {
    component.unmount()
  })

  it('renders location name', async () => {
    const actionElement = await waitForElement(
      component,
      '#location-range-picker-action'
    )

    expect(actionElement.hostNodes().text()).toBe('Baniajan Union')
  })

  it('focuses input on click action', async () => {
    const actionElement = await waitForElement(
      component,
      '#location-range-picker-action'
    )

    actionElement.hostNodes().simulate('click')
    await flushPromises()
    component.update()

    const searchInputElement = await waitForElement(
      component,
      'input#locationSearchInput'
    )

    expect(searchInputElement.hostNodes().getDOMNode()).toEqual(
      document.activeElement
    )
  })
})

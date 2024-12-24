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
import { AppStore, createStore } from '@client/store'
import { createTestComponent, flushPromises } from '@client/tests/util'
import { waitForElement } from '@client/tests/wait-for-element'
import { ReactWrapper } from 'enzyme'
import React from 'react'
import { vi } from 'vitest'
import { LocationPicker } from './LocationPicker'

describe('location picker tests', () => {
  let store: AppStore
  let component: ReactWrapper
  const onChangeLocationMock = vi.fn()

  beforeAll(async () => {
    const appStore = createStore()
    store = appStore.store
  })

  beforeEach(async () => {
    const { component: testComponent } = await createTestComponent(
      <LocationPicker
        selectedLocationId="bfe8306c-0910-48fe-8bf5-0db906cf3155"
        onChangeLocation={onChangeLocationMock}
      />,
      { store },
      { attachTo: document.body }
    )
    component = testComponent
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

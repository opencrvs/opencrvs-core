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
import { ReactWrapper } from 'enzyme'
import { createTestStore, createTestComponent } from '@client/tests/util'
import { AppStore } from '@client/store'
import { OperationalReport } from './OperationalReport'
import { OPERATIONAL_REPORT } from '@client/navigation/routes'
import { waitForElement } from '@client/tests/wait-for-element'
import { History } from 'history'

describe('OperationalReport tests', () => {
  let component: ReactWrapper<{}, {}>
  let store: AppStore
  let history: History<any>

  const LOCATION_DHAKA_DIVISION = {
    displayLabel: 'Dhaka Division',
    id: '6e1f3bce-7bcb-4bf6-8e35-0d9facdf158b',
    searchableText: 'Dhaka'
  }

  beforeAll(async () => {
    const { store: testStore, history: testHistory } = await createTestStore()
    store = testStore
    history = testHistory
  })

  beforeEach(async () => {
    const testComponent = await createTestComponent(
      <OperationalReport
        // @ts-ignore
        history={{
          location: {
            state: {
              selectedLocation: LOCATION_DHAKA_DIVISION
            },
            pathname: OPERATIONAL_REPORT,
            search: '',
            hash: ''
          }
        }}
      />,
      store
    )
    component = testComponent.component
  })

  it('renders without crashing', async () => {
    const header = await waitForElement(component, '#header-location-name')
  })

  it('header shows location display label', async () => {
    const header = await waitForElement(component, '#header-location-name')
    expect(header.hostNodes().text()).toBe(LOCATION_DHAKA_DIVISION.displayLabel)
  })

  it('clicking on change button redirects to performance home keeping location in history state', async () => {
    const changeLink = await waitForElement(component, '#change-location-link')
    changeLink.hostNodes().simulate('click')
    expect(history.location.pathname).toBe('/performance')
    expect(history.location.state).toStrictEqual({
      selectedLocation: LOCATION_DHAKA_DIVISION
    })
  })

  it('performance select default value is Operational', async () => {
    const performanceSelect = await waitForElement(
      component,
      '#operational-select'
    )
    expect(
      performanceSelect
        .find('.react-select__single-value')
        .hostNodes()
        .text()
    ).toBe('Operational')
  })
})

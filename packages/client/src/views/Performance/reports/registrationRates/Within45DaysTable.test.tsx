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
import { AppStore } from '@client/store'
import { ReactWrapper } from 'enzyme'
import { createTestStore, createTestComponent } from '@client/tests/util'
import { Within45DaysTable } from '@client/views/Performance/reports/registrationRates/Within45DaysTable'
import { Event } from '@client/forms'
import { waitForElement } from '@client/tests/wait-for-element'

describe('Within45DaysTable tests', () => {
  let component: ReactWrapper<{}, {}>
  let store: AppStore

  const mockData = [
    {
      time: new Date(2020, 3),
      total: 10000,
      regWithin45d: 5000,
      estimated: 20000,
      percentage: 23.5
    },
    {
      time: new Date(2020, 2),
      total: 8000,
      regWithin45d: 4500,
      estimated: 20000,
      percentage: 16
    }
  ]

  beforeAll(async () => {
    store = (await createTestStore()).store
  })

  beforeEach(async () => {
    component = (await createTestComponent(
      <Within45DaysTable eventType={Event.BIRTH} data={mockData} />,
      store
    )).component
  })

  it('runs without crashing', async () => {
    const firstRowElement = await waitForElement(component, '#row_0')
  })

  it('toggles sorting order of the list', async () => {
    const firstRowElement = await waitForElement(component, '#row_0')
    const toggleSortActionElement = await waitForElement(
      component,
      '#month-label'
    )
    expect(
      firstRowElement
        .hostNodes()
        .childAt(0)
        .text()
    ).toBe('April 2020')

    toggleSortActionElement.hostNodes().simulate('click')

    expect(
      firstRowElement
        .hostNodes()
        .childAt(0)
        .text()
    ).toBe('March 2020')
  })
})

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
import { AppStore, createStore } from '@client/store'
import { ReactWrapper } from 'enzyme'
import { createTestComponent } from '@client/tests/util'
import { CompletenessDataTable } from '@client/views/SysAdmin/Performance/reports/completenessRates/CompletenessDataTable'
import { Event } from '@client/forms'
import { waitForElement } from '@client/tests/wait-for-element'

import { History } from 'history'
import { COMPLETENESS_RATE_REPORT_BASE } from '@client/views/SysAdmin/Performance/CompletenessRates'
import { CompletenessRateTime } from '@client/views/SysAdmin/Performance/utils'

describe('CompletenessDataTable tests for over time option', () => {
  let component: ReactWrapper<{}, {}>
  let store: AppStore
  let history: History

  const mockData = [
    {
      total: 3,
      withinTarget: 3,
      within1Year: 3,
      within5Years: 3,
      estimated: 3,
      month: 2,
      year: 2020
    },
    {
      total: 3,
      withinTarget: 3,
      within1Year: 3,
      within5Years: 3,
      estimated: 3,
      month: 3,
      year: 2020
    }
  ]

  beforeAll(async () => {
    ;({ history, store } = createStore())
  })

  beforeEach(async () => {
    component = await createTestComponent(
      <CompletenessDataTable
        completenessRateTime={CompletenessRateTime.Within1Year}
        loading={false}
        base={{ baseType: COMPLETENESS_RATE_REPORT_BASE.TIME }}
        eventType={Event.BIRTH}
        data={mockData}
      />,
      { store, history }
    )
  })

  it('runs without crashing', async () => {
    const firstRowElement = await waitForElement(component, '#row_0')
    expect(firstRowElement).toBeDefined()
  })

  it('toggles sorting order of the list', async () => {
    const firstRowElement = await waitForElement(component, '#row_0')
    const toggleSortActionElement = await waitForElement(
      component,
      '#month-label'
    )
    expect(firstRowElement.hostNodes().childAt(0).text()).toBe('April 2020')

    toggleSortActionElement.hostNodes().simulate('click')

    expect(firstRowElement.hostNodes().childAt(0).text()).toBe('March 2020')
  })
})

describe('CompletenessDataTable tests for by location option', () => {
  let component: ReactWrapper<{}, {}>
  let store: AppStore
  let history: History

  const mockData = [
    {
      locationName: 'Baniajan',
      total: 3,
      withinTarget: 3,
      within1Year: 3,
      within5Years: 3,
      estimated: 3,
      month: 3,
      year: 3
    },
    {
      locationName: 'Atpara Sadar',
      total: 3,
      withinTarget: 3,
      within1Year: 3,
      within5Years: 3,
      estimated: 3,
      month: 3,
      year: 3
    }
  ]

  beforeAll(async () => {
    ;({ history, store } = createStore())
  })

  beforeEach(async () => {
    component = await createTestComponent(
      <CompletenessDataTable
        completenessRateTime={CompletenessRateTime.Within1Year}
        loading={false}
        base={{
          baseType: COMPLETENESS_RATE_REPORT_BASE.LOCATION,
          locationJurisdictionType: 'UNION'
        }}
        eventType={Event.BIRTH}
        data={mockData}
      />,
      { store, history }
    )
  })

  it('runs without crashing', async () => {
    const firstRowElement = await waitForElement(component, '#row_0')
    expect(firstRowElement).toBeDefined()
  })

  it('toggles sorting order of the list', async () => {
    const firstRowElement = await waitForElement(component, '#row_0')
    const toggleSortActionElement = await waitForElement(
      component,
      '#location-label'
    )
    expect(firstRowElement.hostNodes().childAt(0).text()).toBe('Atpara Sadar')

    toggleSortActionElement.hostNodes().simulate('click')

    expect(firstRowElement.hostNodes().childAt(0).text()).toBe('Baniajan')
  })
})

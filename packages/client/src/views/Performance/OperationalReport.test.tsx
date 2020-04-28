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
import {
  createTestStore,
  createTestComponent,
  flushPromises
} from '@client/tests/util'
import { AppStore } from '@client/store'
import {
  OperationalReport,
  OPERATIONAL_REPORT_SECTION
} from './OperationalReport'
import { OPERATIONAL_REPORT } from '@client/navigation/routes'
import { waitForElement } from '@client/tests/wait-for-element'
import { History } from 'history'
import { RegistrationRatesReport } from './reports/operational/RegistrationRatesReport'

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
    Date.now = jest.fn(() => 1487076708000)
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
              selectedLocation: LOCATION_DHAKA_DIVISION,
              sectionId: OPERATIONAL_REPORT_SECTION.OPERATIONAL
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
    expect(
      component.find('#registration-rates-reports-loader').hostNodes()
    ).toHaveLength(0)
  })

  it('on details link click will forward time range and location to route', async () => {
    const registrationRatesReports = await waitForElement(
      component,
      RegistrationRatesReport
    )

    registrationRatesReports.prop('onClickEventDetails')(
      'birth',
      'Birth registration rate within 45 days of event'
    )

    expect(history.location.state).toEqual({
      selectedLocation: {
        displayLabel: 'Dhaka Division',
        id: '6e1f3bce-7bcb-4bf6-8e35-0d9facdf158b',
        searchableText: 'Dhaka'
      },
      timeEnd: new Date(1487076708000),
      timeStart: new Date(1455454308000),
      title: 'Birth registration rate within 45 days of event'
    })
  })

  it('performance select updates history when changed', async () => {
    const performanceSelect = await waitForElement(
      component,
      '#operational-select'
    )
    performanceSelect.prop('onChange')({ label: 'Reports', value: 'REPORTS' })
    component.update()
    expect(history.location.state).toEqual({
      selectedLocation: LOCATION_DHAKA_DIVISION,
      sectionId: OPERATIONAL_REPORT_SECTION.REPORTS
    })
  })
})
describe('OperationalReport reports tests', () => {
  let component: ReactWrapper<{}, {}>
  let store: AppStore
  let history: History<any>

  const LOCATION_DHAKA_DIVISION = {
    displayLabel: 'Dhaka Division',
    id: '6e1f3bce-7bcb-4bf6-8e35-0d9facdf158b',
    searchableText: 'Dhaka'
  }

  beforeAll(async () => {
    Date.now = jest.fn(() => 1487076708000)
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
              selectedLocation: LOCATION_DHAKA_DIVISION,
              sectionId: OPERATIONAL_REPORT_SECTION.REPORTS
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

  it('renders report lists', async () => {
    expect(component.find('#report-lists').hostNodes()).toHaveLength(1)
  })
})

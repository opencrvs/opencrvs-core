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
import { ReactWrapper } from 'enzyme'

import {
  createTestComponent,
  createTestStore,
  TestComponentWithRouteMock
} from '@client/tests/util'
import { AppStore } from '@client/store'
import { CompletenessRates } from '@client/views/SysAdmin/Performance/CompletenessRates'
import { EVENT_COMPLETENESS_RATES } from '@client/navigation/routes'
import {
  FETCH_MONTH_WISE_EVENT_ESTIMATIONS,
  IS_LEAF_LEVEL_LOCATION
} from '@client/views/SysAdmin/Performance/queries'
import { waitForElement } from '@client/tests/wait-for-element'
import { stringify, parse } from 'query-string'
import { GraphQLError } from 'graphql'
import { vi } from 'vitest'
import { formatUrl } from '@client/navigation'

const LOCATION_DHAKA_DIVISION = {
  displayLabel: 'Dhaka Division',
  id: '6e1f3bce-7bcb-4bf6-8e35-0d9facdf158b',
  searchableText: 'Dhaka'
}
const timeStart = new Date(2019, 11, 6)
const timeEnd = new Date(2019, 11, 13)

describe('Registraion Rates tests', () => {
  const graphqlMocks = [
    {
      request: {
        query: IS_LEAF_LEVEL_LOCATION,
        variables: { parentId: '6e1f3bce-7bcb-4bf6-8e35-0d9facdf158b' }
      },
      result: {
        data: {
          isLeafLevelLocation: true
        }
      }
    },
    {
      request: {
        query: FETCH_MONTH_WISE_EVENT_ESTIMATIONS,
        variables: {
          event: 'BIRTH',
          locationId: '6e1f3bce-7bcb-4bf6-8e35-0d9facdf158b',
          timeStart: timeStart.toISOString(),
          timeEnd: timeEnd.toISOString()
        }
      },
      result: {
        data: {
          fetchMonthWiseEventMetrics: {
            details: [
              {
                actualTotalRegistration: 20,
                actualTargetDayRegistration: 9,
                estimatedRegistration: 45,
                estimatedTargetDayPercentage: 4.5,
                month: 'April',
                year: '2020',
                startOfMonth: '2020-03-30T18:00:00.000Z'
              },
              {
                actualTotalRegistration: 10,
                actualTargetDayRegistration: 0,
                estimatedRegistration: 45,
                estimatedTargetDayPercentage: 0,
                month: 'March',
                year: '2020',
                startOfMonth: '2020-02-29T18:00:00.000Z'
              }
            ],
            total: {
              actualTotalRegistration: 30,
              actualTargetDayRegistration: 9,
              estimatedRegistration: 45,
              estimatedTargetDayPercentage: 2.25
            }
          }
        }
      }
    }
  ]
  let component: ReactWrapper<{}, {}>
  let router: TestComponentWithRouteMock['router']
  let store: AppStore

  beforeAll(async () => {
    Date.now = vi.fn(() => 1487076708000)
    const { store: testStore } = await createTestStore()
    store = testStore
  })

  beforeEach(async () => {
    const { component: testComponent, router: testRouter } =
      await createTestComponent(<CompletenessRates />, {
        store,
        path: EVENT_COMPLETENESS_RATES,
        initialEntries: [
          formatUrl(EVENT_COMPLETENESS_RATES, {
            eventType: 'birth'
          }) +
            '?' +
            stringify({
              time: 'withinTarget',
              locationId: LOCATION_DHAKA_DIVISION.id,
              timeEnd: new Date(1487076708000).toISOString(),
              timeStart: new Date(1456868800000).toISOString()
            })
        ],
        graphqlMocks: graphqlMocks
      })

    component = testComponent
    router = testRouter

    // wait for mocked data to load mockedProvider
    await new Promise((resolve) => {
      setTimeout(resolve, 100)
    })

    component.update()
  })

  it('renders the component', async () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 200
    })
    await waitForElement(component, '#reg-rates')
  })

  it('clicking on any other preset range changes date ranges in url', async () => {
    const dateRangePickerElement = await waitForElement(
      component,
      '#date-range-picker-action'
    )
    expect(dateRangePickerElement.hostNodes().text()).toBe('Last 12 months')
    const previousQueryParams = router.state.location.search
    dateRangePickerElement.hostNodes().simulate('click')
    const last30DaysPresetButtonElement = await waitForElement(
      component,
      '#last30Days'
    )
    last30DaysPresetButtonElement.hostNodes().at(0).simulate('click')
    const confirmButtonElement = await waitForElement(
      component,
      '#date-range-confirm-action'
    )
    confirmButtonElement.hostNodes().simulate('click')
    expect(router.state.location.search).not.toBe(previousQueryParams)
  })

  it('click on close button or outside modal closes location picker modal', async () => {
    const locationPickerElement = await waitForElement(
      component,
      '#location-range-picker-action'
    )
    locationPickerElement.hostNodes().simulate('click')

    expect(component.find('#picker-modal').hostNodes()).toHaveLength(1)

    component.find('#close-btn').hostNodes().simulate('click')

    expect(component.find('#picker-modal').hostNodes()).toHaveLength(0)

    locationPickerElement.hostNodes().simulate('click')
    expect(component.find('#picker-modal').hostNodes()).toHaveLength(1)
    component.find('#cancelable-area').hostNodes().simulate('click')
    expect(component.find('#picker-modal').hostNodes()).toHaveLength(0)
  })

  it('changing location id from location picker updates the query params', async () => {
    const locationIdBeforeChange = parse(
      router.state.location.search
    ).locationId

    const locationPickerElement = await waitForElement(
      component,
      '#location-range-picker-action'
    )

    locationPickerElement.hostNodes().simulate('click')

    const locationSearchInput = await waitForElement(
      component,
      '#locationSearchInput'
    )
    locationSearchInput.hostNodes().simulate('change', {
      target: { value: 'Baniajan', id: 'locationSearchInput' }
    })

    const searchResultOption = await waitForElement(
      component,
      '#locationOptionbfe8306c-0910-48fe-8bf5-0db906cf3155'
    )
    searchResultOption.hostNodes().simulate('click')

    const newLocationId = parse(router.state.location.search).locationId
    expect(newLocationId).not.toBe(locationIdBeforeChange)
    expect(newLocationId).toBe('bfe8306c-0910-48fe-8bf5-0db906cf3155')
  })
})

describe('Registraion Rates error state tests', () => {
  const graphqlMocks = [
    {
      request: {
        query: IS_LEAF_LEVEL_LOCATION,
        variables: { parentId: '6e1f3bce-7bcb-4bf6-8e35-0d9facdf158b' }
      },
      result: {
        data: {
          isLeafLevelLocation: true
        }
      }
    },
    {
      request: {
        query: FETCH_MONTH_WISE_EVENT_ESTIMATIONS,
        variables: {
          event: 'BIRTH',
          locationId: '6e1f3bce-7bcb-4bf6-8e35-0d9facdf158b',
          timeStart: timeStart.toISOString(),
          timeEnd: timeEnd.toISOString()
        }
      },
      result: {
        errors: [new GraphQLError('Error!')]
      }
    }
  ]
  let component: ReactWrapper<{}, {}>
  let store: AppStore

  beforeEach(async () => {
    Date.now = vi.fn(() => 1487076708000)
    ;({ store } = await createTestStore())

    const { component: testComponent } = await createTestComponent(
      <CompletenessRates />,
      {
        store,
        path: EVENT_COMPLETENESS_RATES,
        initialEntries: [
          formatUrl(EVENT_COMPLETENESS_RATES, {
            eventType: 'birth'
          }) +
            '?' +
            stringify({
              time: 'withinTarget',
              locationId: LOCATION_DHAKA_DIVISION.id,
              timeEnd: new Date(1487076708000).toISOString(),
              timeStart: new Date(1455454308000).toISOString()
            })
        ],
        graphqlMocks: graphqlMocks
      }
    )
    component = testComponent
    // wait for mocked data to load mockedProvider
    await new Promise((resolve) => {
      setTimeout(resolve, 100)
    })

    component.update()
  })

  it('renders the error toast notification and component loader', async () => {
    await waitForElement(component, '#error-toast')
    expect(component.find('#error-toast').hostNodes()).toHaveLength(1)
    expect(
      component.find('#reg-rates-line-chart-loader').hostNodes()
    ).toHaveLength(1)
  })
})

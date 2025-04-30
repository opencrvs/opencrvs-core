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
import { AppStore } from '@client/store'
import {
  createRouterProps,
  createTestComponent,
  createTestStore
} from '@client/tests/util'
import { waitForElement } from '@client/tests/wait-for-element'
import { FETCH_REGISTRATIONS } from '@client/views/SysAdmin/Performance/queries'
import { ReactWrapper } from 'enzyme'
import * as React from 'react'
import { vi } from 'vitest'
import { RegistrationList } from './RegistrationsList'

describe('Registrations List test', () => {
  let component: ReactWrapper<{}, {}>
  let store: AppStore

  beforeAll(async () => {
    Date.now = vi.fn(() => 1667806908949)
    ;({ store } = await createTestStore())
  })

  beforeEach(async () => {
    const { location } = createRouterProps(
      '/performance/registrations',
      { isNavigatedInsideApp: false },
      {
        matchParams: {},
        search: {
          timeStart: '2021-11-04T14:08:46.761Z',
          timeEnd: '2022-11-30T17:59:59.999Z',
          event: 'BIRTH',
          filterBy: 'by_time',
          locationId: 'c9c4d6e9-981c-4646-98fe-4014fddebd5e',
          currentPageNumber: '1'
        }
      }
    )
    const graphqlMock = [
      {
        request: {
          query: FETCH_REGISTRATIONS,
          variables: {
            timeStart: '2021-11-04T14:08:46.761Z',
            timeEnd: '2022-11-30T17:59:59.999Z',
            event: 'BIRTH',
            skip: 0,
            size: 10,
            filterBy: 'by_time',
            locationId: 'c9c4d6e9-981c-4646-98fe-4014fddebd5e'
          }
        },
        result: {
          data: {
            getRegistrationsListByFilter: {
              __typename: 'TotalMetricsByTime',
              results: [
                {
                  total: 0,
                  delayed: 0,
                  late: 0,
                  home: 0,
                  healthFacility: 0,
                  month: '2022-11-01',
                  time: '1667239200000',
                  __typename: 'EventMetricsByTime'
                },
                {
                  total: 13,
                  delayed: 1,
                  late: 2,
                  home: 1,
                  healthFacility: 12,
                  month: '2022-10-01',
                  time: '1664560800000',
                  __typename: 'EventMetricsByTime'
                },
                {
                  total: 2,
                  delayed: 0,
                  late: 0,
                  home: 0,
                  healthFacility: 2,
                  month: '2022-09-01',
                  time: '1661968800000',
                  __typename: 'EventMetricsByTime'
                },
                {
                  total: 0,
                  delayed: 0,
                  late: 0,
                  home: 0,
                  healthFacility: 0,
                  month: '2022-08-01',
                  time: '1659290400000',
                  __typename: 'EventMetricsByTime'
                },
                {
                  total: 0,
                  delayed: 0,
                  late: 0,
                  home: 0,
                  healthFacility: 0,
                  month: '2022-07-01',
                  time: '1656612000000',
                  __typename: 'EventMetricsByTime'
                },
                {
                  total: 0,
                  delayed: 0,
                  late: 0,
                  home: 0,
                  healthFacility: 0,
                  month: '2022-06-01',
                  time: '1654020000000',
                  __typename: 'EventMetricsByTime'
                },
                {
                  total: 0,
                  delayed: 0,
                  late: 0,
                  home: 0,
                  healthFacility: 0,
                  month: '2022-05-01',
                  time: '1651341600000',
                  __typename: 'EventMetricsByTime'
                },
                {
                  total: 0,
                  delayed: 0,
                  late: 0,
                  home: 0,
                  healthFacility: 0,
                  month: '2022-04-01',
                  time: '1648749600000',
                  __typename: 'EventMetricsByTime'
                },
                {
                  total: 0,
                  delayed: 0,
                  late: 0,
                  home: 0,
                  healthFacility: 0,
                  month: '2022-03-01',
                  time: '1646071200000',
                  __typename: 'EventMetricsByTime'
                },
                {
                  total: 0,
                  delayed: 0,
                  late: 0,
                  home: 0,
                  healthFacility: 0,
                  month: '2022-02-01',
                  time: '1643652000000',
                  __typename: 'EventMetricsByTime'
                }
              ],
              total: 14
            }
          }
        }
      }
    ]
    const { component: testComponent } = await createTestComponent(
      <RegistrationList />,
      {
        store,
        graphqlMocks: graphqlMock,
        initialEntries: [location.pathname + '?' + location.search]
      }
    )
    component = testComponent
  })

  it('renders without crashing', async () => {
    await waitForElement(component, '#registrations-list')
  })

  it('toggles sorting order of the list', async () => {
    const firstRowElement = await waitForElement(component, '#row_0')
    const toggleSortActionElement = await waitForElement(
      component,
      '#month-label'
    )
    expect(firstRowElement.hostNodes().childAt(0).text()).toBe('November 2022')

    toggleSortActionElement.hostNodes().simulate('click')

    expect(firstRowElement.hostNodes().childAt(0).text()).toBe('February 2022')
  })
})

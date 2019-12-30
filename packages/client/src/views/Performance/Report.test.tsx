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
import { ReactWrapper } from 'enzyme'
import { Header } from './utils'
import { createStore } from '@client/store'
import { Report } from './Report'
import { PERFORMANCE_METRICS } from '@client/views/Performance/metricsQuery'
import { waitForElement } from '@client/tests/wait-for-element'
import { Event } from '@client/forms'

describe('Report page', () => {
  let testComponent: ReactWrapper
  const { store, history } = createStore()
  const timeStart = new Date(2019, 11, 6)
  const timeEnd = new Date(2019, 11, 13)

  const graphqlMock = [
    {
      request: {
        query: PERFORMANCE_METRICS,
        variables: {
          timeStart: timeStart.toISOString(),
          timeEnd: timeEnd.toISOString(),
          locationId: '8cbc862a-b817-4c29-a490-4a8767ff023c',
          event: 'birth'
        }
      },
      result: {
        data: {
          fetchRegistrationMetrics: {
            timeFrames: {
              details: [
                {
                  locationId: 'Location/db5faba3-8143-4924-a44a-8562ed5e0437',
                  regWithin45d: 0,
                  regWithin45dTo1yr: 0,
                  regWithin1yrTo5yr: 0,
                  regOver5yr: 2,
                  total: 2
                }
              ],
              total: {
                regWithin45d: 0,
                regWithin45dTo1yr: 0,
                regWithin1yrTo5yr: 0,
                regOver5yr: 2
              }
            },
            genderBasisMetrics: {
              details: [
                {
                  location: 'Location/db5faba3-8143-4924-a44a-8562ed5e0437',
                  maleUnder18: 2,
                  femaleUnder18: 0,
                  maleOver18: 0,
                  femaleOver18: 0,
                  total: 2
                }
              ],
              total: {
                maleUnder18: 2,
                femaleUnder18: 0,
                maleOver18: 0,
                femaleOver18: 0
              }
            },
            payments: [
              {
                locationId: 'Location/db5faba3-8143-4924-a44a-8562ed5e0437',
                total: 200
              }
            ]
          }
        }
      }
    },
    {
      request: {
        query: PERFORMANCE_METRICS,
        variables: {
          timeStart: timeStart.toISOString(),
          timeEnd: timeEnd.toISOString(),
          locationId: 'dabffdf7-c174-4450-b306-5a3c2c0e2c0e',
          event: 'birth'
        }
      },
      result: {
        data: {
          fetchRegistrationMetrics: {
            timeFrames: {
              details: [],
              total: {
                regWithin45d: 0,
                regWithin45dTo1yr: 0,
                regWithin1yrTo5yr: 0,
                regOver5yr: 0
              }
            },
            genderBasisMetrics: {
              details: [],
              total: {
                maleUnder18: 0,
                femaleUnder18: 0,
                maleOver18: 0,
                femaleOver18: 0
              }
            },
            payments: []
          }
        }
      }
    }
  ]

  beforeEach(async () => {
    const mock: jest.Mock = jest.fn()

    testComponent = (await createTestComponent(
      // @ts-ignore
      <Report
        history={history}
        staticContext={mock}
        match={{
          params: {},
          isExact: true,
          path: '',
          url: ''
        }}
        location={{
          pathname: '',
          search: '',
          hash: '',
          state: {
            reportType: 'weekly',
            eventType: Event.BIRTH,
            timeRange: {
              start: timeStart,
              end: timeEnd
            }
          }
        }}
      />,
      store,
      graphqlMock
    )).component
  })

  it('loads with page title from given time range from props', () => {
    expect(
      testComponent
        .find(Header)
        .first()
        .text()
    ).toBe('December 2019')
  })

  it('loads and renders data from query after selecting a location', async () => {
    const locationSearchInput = await waitForElement(
      testComponent,
      '#locationSearchInput'
    )

    locationSearchInput.hostNodes().simulate('change', {
      target: { id: 'locationSearchInput', value: 'Chittagong' }
    })

    locationSearchInput.update()

    testComponent
      .find('#locationOption8cbc862a-b817-4c29-a490-4a8767ff023c')
      .hostNodes()
      .simulate('click')

    testComponent.update()

    await new Promise(resolve => {
      setTimeout(resolve, 100)
    })

    testComponent.update()

    const genderMetricsTable = await waitForElement(
      testComponent,
      '#listTable-genderBasisMetrics'
    )

    const timeFramesTable = await waitForElement(
      testComponent,
      '#listTable-timeFrames'
    )

    const paymentsTable = await waitForElement(
      testComponent,
      '#listTable-payments'
    )

    expect(genderMetricsTable.hostNodes()).toHaveLength(1)
    expect(timeFramesTable.hostNodes()).toHaveLength(1)
    expect(paymentsTable.hostNodes()).toHaveLength(1)

    const totalValueOfGenderMetrics = genderMetricsTable
      .find('#row_0')
      .find('span')
      .at(5)
      .text()

    const totalValueOfTimeFrames = timeFramesTable
      .find('#row_0')
      .find('span')
      .at(5)
      .text()

    const totalValueOfPayments = paymentsTable
      .find('#row_0')
      .find('span')
      .at(1)
      .text()

    expect(totalValueOfGenderMetrics).toBe('2')
    expect(totalValueOfTimeFrames).toBe('2')
    expect(totalValueOfPayments).toBe('200')
  })

  it('renders no data found for location if no data found from query', async () => {
    const locationSearchInput = await waitForElement(
      testComponent,
      '#locationSearchInput'
    )

    locationSearchInput.hostNodes().simulate('change', {
      target: { id: 'locationSearchInput', value: 'Barisal' }
    })

    locationSearchInput.update()

    testComponent
      .find('#locationOptiondabffdf7-c174-4450-b306-5a3c2c0e2c0e')
      .hostNodes()
      .simulate('click')

    testComponent.update()

    await new Promise(resolve => {
      setTimeout(resolve, 100)
    })

    testComponent.update()
    const noResultsReports = await waitForElement(
      testComponent,
      '#noResults-reports'
    )
    expect(noResultsReports.hostNodes()).toHaveLength(1)
    expect(noResultsReports.hostNodes().text()).toContain(
      'No data for BARISAL District, Barisal'
    )
  })
})

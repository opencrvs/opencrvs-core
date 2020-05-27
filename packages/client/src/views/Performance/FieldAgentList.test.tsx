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
import { AppStore } from '@client/store'
import { createTestComponent, createTestStore } from '@client/tests/util'
import { waitForElement } from '@client/tests/wait-for-element'
import { ReactWrapper } from 'enzyme'
import { History } from 'history'
import * as React from 'react'
import { FieldAgentList } from './FieldAgentList'
import { RegistrationRatesReport } from './reports/operational/RegistrationRatesReport'
import querystring from 'query-string'
import { FETCH_FIELD_AGENTS_WITH_PERFORMANCE_DATA } from './queries'

describe('Field agent list tests', () => {
  let component: ReactWrapper<{}, {}>
  let store: AppStore
  let history: History<any>

  beforeAll(async () => {
    Date.now = jest.fn(() => 1487076708000)
    const { store: testStore, history: testHistory } = await createTestStore()
    store = testStore
    history = testHistory
  })

  beforeEach(async () => {
    const graphqlMock = [
      {
        request: {
          query: FETCH_FIELD_AGENTS_WITH_PERFORMANCE_DATA,
          variables: {
            locationId: '6e1f3bce-7bcb-4bf6-8e35-0d9facdf158b',
            status: 'active',
            event: undefined,
            timeEnd: new Date(1487076708000).toISOString(),
            timeStart: new Date(1455454308000).toISOString(),
            count: 25,
            sort: 'asc'
          }
        },
        result: {
          data: {
            searchFieldAgents: {
              results: [
                {
                  practitionerId: '1',
                  fullName: 'Sakib Al Hasan',
                  type: 'HA',
                  status: 'active',
                  primaryOfficeId: '1',
                  creationDate: '1488076708000',
                  totalNumberOfApplicationStarted: 12,
                  totalNumberOfInProgressAppStarted: 3,
                  totalNumberOfRejectedApplications: 1782,
                  averageTimeForDeclaredApplications: 2
                },
                {
                  practitionerId: '2',
                  fullName: 'Naeem Hossain',
                  type: 'HA',
                  status: 'active',
                  primaryOfficeId: '1',
                  creationDate: '1487076708000',
                  totalNumberOfApplicationStarted: 0,
                  totalNumberOfInProgressAppStarted: 0,
                  totalNumberOfRejectedApplications: 0,
                  averageTimeForDeclaredApplications: 0
                }
              ],
              totalItems: 2
            }
          }
        }
      }
    ]
    const testComponent = await createTestComponent(
      <FieldAgentList
        // @ts-ignore
        location={{
          search: querystring.stringify({
            locationId: '6e1f3bce-7bcb-4bf6-8e35-0d9facdf158b',
            timeEnd: new Date(1487076708000).toISOString(),
            timeStart: new Date(1455454308000).toISOString()
          })
        }}
      />,
      store,
      graphqlMock
    )
    component = testComponent.component
  })

  it('renders without crashing', async () => {
    const header = await waitForElement(component, '#field-agent-list')
  })
  it('toggles sorting order of the list', async () => {
    const firstRowElement = await waitForElement(component, '#row_0')
    const toggleSortActionElement = await waitForElement(
      component,
      '#totalApplications-label'
    )
    expect(
      firstRowElement
        .hostNodes()
        .childAt(0)
        .text()
    ).toBe('Sakib Al Hasan')

    toggleSortActionElement.hostNodes().simulate('click')

    expect(
      firstRowElement
        .hostNodes()
        .childAt(0)
        .text()
    ).toBe('Naeem Hossain')
  })
  it('For graphql errors it renders with error components', async () => {
    const testErrorComponent = await createTestComponent(
      <FieldAgentList
        // @ts-ignore
        location={{
          search: querystring.stringify({
            locationId: '6e1f3bce-7bcb-4bf6-8e35-0d9facdf158b',
            timeEnd: new Date(1487076708000).toISOString(),
            timeStart: new Date(1455454308000).toISOString()
          })
        }}
      />,
      store
    )
    await waitForElement(
      testErrorComponent.component,
      '#field-agent-error-list'
    )
  })
})

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
import {
  createRouterProps,
  createTestComponent,
  createTestStore
} from '@client/tests/util'
import { waitForElement } from '@client/tests/wait-for-element'
import { FETCH_FIELD_AGENTS_WITH_PERFORMANCE_DATA } from '@client/views/SysAdmin/Performance/queries'
import { ReactWrapper } from 'enzyme'
import { History } from 'history'
import { stringify } from 'query-string'
import * as React from 'react'
import { FieldAgentList } from './FieldAgentList'

describe('Field agent list tests', () => {
  let component: ReactWrapper<{}, {}>
  let store: AppStore
  let history: History<any>

  beforeAll(async () => {
    Date.now = jest.fn(() => 1487076708000)
    ;({ store, history } = await createTestStore())
  })

  beforeEach(async () => {
    const { history, location, match } = createRouterProps(
      '/performance/field-agents',
      { isNavigatedInsideApp: false },
      {
        matchParams: {},
        search: {
          locationId: 'bfe8306c-0910-48fe-8bf5-0db906cf3155',
          timeEnd: new Date(1487076708000).toISOString(),
          timeStart: new Date(1455454308000).toISOString()
        }
      }
    )
    const graphqlMock = [
      {
        request: {
          query: FETCH_FIELD_AGENTS_WITH_PERFORMANCE_DATA,
          variables: {
            timeStart: '2016-02-14T12:51:48.000Z',
            timeEnd: '2017-02-14T12:51:48.000Z',
            locationId: 'bfe8306c-0910-48fe-8bf5-0db906cf3155',
            status: 'active',
            event: 'BIRTH',
            count: 25,
            sort: 'asc',
            skip: 0
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
                  totalNumberOfDeclarationStarted: 12,
                  totalNumberOfInProgressAppStarted: 3,
                  totalNumberOfRejectedDeclarations: 1782,
                  averageTimeForDeclaredDeclarations: 2
                },
                {
                  practitionerId: '2',
                  fullName: 'Naeem Hossain',
                  type: 'HA',
                  status: 'active',
                  primaryOfficeId: '1',
                  creationDate: '1487076708000',
                  totalNumberOfDeclarationStarted: 0,
                  totalNumberOfInProgressAppStarted: 0,
                  totalNumberOfRejectedDeclarations: 0,
                  averageTimeForDeclaredDeclarations: 0
                }
              ],
              totalItems: 2
            }
          }
        }
      }
    ]
    const testComponent = await createTestComponent(
      <FieldAgentList history={history} location={location} match={match} />,
      { store, history, graphqlMocks: graphqlMock }
    )
    component = testComponent
  })

  it('renders without crashing', async () => {
    await waitForElement(component, '#field-agent-list')
  })
  it('toggles sorting order of the list', async () => {
    const firstRowElement = await waitForElement(component, '#row_0')
    const toggleSortActionElement = await waitForElement(
      component,
      '#totalDeclarations-label'
    )
    expect(firstRowElement.hostNodes().childAt(0).text()).toBe('Sakib Al Hasan')

    toggleSortActionElement.hostNodes().simulate('click')

    expect(firstRowElement.hostNodes().childAt(0).text()).toBe('Naeem Hossain')
  })

  it('For graphql errors it renders with error components', async () => {
    const { history, location, match } = createRouterProps(
      '/performance/field-agents',
      { isNavigatedInsideApp: false },
      {
        matchParams: {},
        search: {
          locationId: 'bfe8306c-0910-48fe-8bf5-0db906cf3155',
          timeEnd: new Date(1487076708000).toISOString(),
          timeStart: new Date(1455454308000).toISOString()
        }
      }
    )
    const testErrorComponent = await createTestComponent(
      <FieldAgentList history={history} location={location} match={match} />,
      { store, history }
    )
    await waitForElement(testErrorComponent, '#field-agent-error-list')
  })
})

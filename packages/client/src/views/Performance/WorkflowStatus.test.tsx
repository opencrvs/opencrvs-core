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
import { createTestComponent, createTestStore } from '@client/tests/util'
import { WorkflowStatus } from '@client/views/Performance/WorkflowStatus'
import { AppStore } from '@client/store'
import { History } from 'history'
import { ReactWrapper } from 'enzyme'
import queryString from 'query-string'
import { waitForElement } from '@client/tests/wait-for-element'
import { FETCH_EVENTS_WITH_PROGRESS } from './queries'
import { OPERATIONAL_REPORT_SECTION } from './OperationalReport'

describe('Workflow status tests', () => {
  let store: AppStore
  let history: History<any>
  let component: ReactWrapper<{}, {}>
  const timeStart = new Date(2019, 11, 6)
  const timeEnd = new Date(2019, 11, 13)
  const locationId = '50c5a9c4-3cc1-4c8c-9a1b-a37ddaf85987'
  const graphqlMocks = [
    {
      request: {
        query: FETCH_EVENTS_WITH_PROGRESS,
        variables: {
          count: 25,
          skip: 0,
          parentLocationId: locationId,
          status: ['REGISTERED'],
          type: ['birth-application']
        }
      },
      result: {
        data: {
          getEventsWithProgress: {
            totalItems: 2,
            results: [
              {
                id: '137a4fb2-36ad-4897-8953-dbad0a756d4f',
                type: 'Birth',
                name: [
                  {
                    use: 'en',
                    firstNames: '',
                    familyName: 'Mother Family Name'
                  },
                  {
                    use: 'bn',
                    firstNames: '',
                    familyName: 'মায়ের পারিবারিক নাম '
                  }
                ],
                dateOfEvent: '2020-05-17',
                registration: {
                  status: 'REGISTERED',
                  contactNumber: '+8801656568681',
                  contactRelationship: 'APPLICANT',
                  dateOfApplication: '2020-05-22T10:24:14.423Z',
                  trackingId: 'B6N6YSF',
                  registrationNumber: '20207210411000121',
                  createdAt: '1590143054612',
                  modifiedAt: '1590143057091'
                },
                startedBy: {
                  name: [
                    {
                      use: 'en',
                      firstNames: 'Mohammad',
                      familyName: 'Ashraful'
                    }
                  ],
                  role: 'LOCAL_REGISTRAR'
                },
                progressReport: {
                  timeInProgress: null,
                  timeInReadyForReview: null,
                  timeInRequiresUpdates: null,
                  timeInWaitingForApproval: null,
                  timeInWaitingForBRIS: null,
                  timeInReadyToPrint: 143
                }
              },
              {
                id: 'd78d29a1-8521-4582-9f4e-902907ca369a',
                type: 'Birth',
                name: [
                  {
                    use: 'en',
                    firstNames: '',
                    familyName: 'Mother Family Name'
                  },
                  {
                    use: 'bn',
                    firstNames: 'মায়ের নাম',
                    familyName: 'আমিনা'
                  }
                ],
                dateOfEvent: '2020-02-15',
                registration: {
                  status: 'REGISTERED',
                  contactNumber: '+8801959595999',
                  contactRelationship: 'Uncle',
                  dateOfApplication: '2020-05-20T14:40:03.088Z',
                  trackingId: 'BXOQWTT',
                  registrationNumber: '20207210411000119',
                  createdAt: '1589985603133',
                  modifiedAt: '1589985605583'
                },
                startedBy: {
                  name: [
                    {
                      use: 'en',
                      firstNames: 'Mohammad',
                      familyName: 'Ashraful'
                    }
                  ],
                  role: 'LOCAL_REGISTRAR'
                },
                progressReport: {
                  timeInProgress: null,
                  timeInReadyForReview: null,
                  timeInRequiresUpdates: null,
                  timeInWaitingForApproval: null,
                  timeInWaitingForBRIS: null,
                  timeInReadyToPrint: 78
                }
              }
            ]
          }
        }
      }
    }
  ]

  beforeAll(async () => {
    const testStore = await createTestStore()
    store = testStore.store
    history = testStore.history
    Date.now = jest.fn(() => 1590220497869)
  })

  beforeEach(async () => {
    const testComponent = await createTestComponent(
      <WorkflowStatus
        // @ts-ignore
        location={{
          search: queryString.stringify({
            locationId,
            event: 'BIRTH',
            status: 'REGISTERED'
          }),
          state: {
            sectionId: OPERATIONAL_REPORT_SECTION,
            timeStart,
            timeEnd
          }
        }}
      />,
      store,
      graphqlMocks
    )

    component = testComponent.component

    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 100)
    })

    component.update()
  })

  it('renders without crashing', async () => {
    const header = await waitForElement(component, '#workflow-status-header')
  })

  it('clicking on back takes back to operational dashboard', async () => {
    const backButton = await waitForElement(
      component,
      '#workflow-status-action-back'
    )
    backButton.hostNodes().simulate('click')

    expect(history.location.pathname).toContain('/performance/operations')
    expect(history.location.pathname).not.toContain('workflowStatus')
  })

  it('renders data', async () => {
    const listTable = await waitForElement(
      component,
      '#application-status-list'
    )
    expect(listTable.find('div#row_1').hostNodes()).toHaveLength(1)
  })

  it('toggles sort order', async () => {
    const listTable = await waitForElement(
      component,
      '#application-status-list'
    )

    const toggleSortButton = await waitForElement(
      component,
      'span#applicationStartedOn-label'
    )
    expect(
      listTable
        .find('div#row_0')
        .hostNodes()
        .childAt(7)
        .text()
    ).toBe('May 22, 2020(a day ago)')

    toggleSortButton.hostNodes().simulate('click')

    expect(
      listTable
        .find('div#row_1')
        .hostNodes()
        .childAt(7)
        .text()
    ).toBe('May 22, 2020(a day ago)')
  })
})

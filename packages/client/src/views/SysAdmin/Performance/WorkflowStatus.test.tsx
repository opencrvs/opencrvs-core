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
import { formatUrl } from '@client/navigation'
import { WORKFLOW_STATUS } from '@client/navigation/routes'
import { AppStore } from '@client/store'
import {
  createTestComponent,
  createTestStore,
  TestComponentWithRouteMock
} from '@client/tests/util'
import { waitForElement } from '@client/tests/wait-for-element'
import { GetEventsWithProgressQuery, EventType } from '@client/utils/gateway'
import { WorkflowStatus } from '@client/views/SysAdmin/Performance/WorkflowStatus'
import { ReactWrapper } from 'enzyme'
import { GraphQLError } from 'graphql'
import { parse, stringify } from 'query-string'
import * as React from 'react'
import { vi } from 'vitest'
import { PlainDate } from '@client/utils/date-formatting'
import { FETCH_EVENTS_WITH_PROGRESS } from './queries'

describe('Workflow status tests', () => {
  let store: AppStore
  let component: ReactWrapper<{}, {}>
  let router: TestComponentWithRouteMock['router']
  const locationId = 'bfe8306c-0910-48fe-8bf5-0db906cf3155'

  beforeAll(async () => {
    const testStore = await createTestStore()
    store = testStore.store
    Date.now = vi.fn(() => 1590220497869)
  })

  describe('events with progress fetched successfully', () => {
    const graphqlMocks = [
      {
        request: {
          query: FETCH_EVENTS_WITH_PROGRESS,
          variables: {
            count: 10,
            skip: 0,
            declarationJurisdictionId: locationId,
            registrationStatuses: ['REGISTERED'],
            compositionType: ['birth-declaration', 'birth-notification']
          }
        },
        result: {
          data: {
            getEventsWithProgress: {
              totalItems: 3,
              results: [
                {
                  id: '137a4fb2-36ad-4897-8953-dbad0a756d4f',
                  type: null,
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
                  dateOfEvent: '2020-05-17' as unknown as PlainDate,
                  registration: {
                    status: null,
                    contactNumber: null,
                    contactRelationship: null,
                    dateOfDeclaration: null,
                    trackingId: 'B6N6YSF',
                    registrationNumber: '20207210411000121',
                    createdAt: '1590143054612',
                    modifiedAt: '1590143057091'
                  },
                  startedAt: '2020-05-17',
                  startedBy: {
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Mohammad',
                        familyName: 'Ashraful'
                      }
                    ],
                    role: {
                      id: 'LOCAL_REGISTRAR',
                      label: {
                        defaultMessage: 'Local Registrar',
                        description: 'Name for user role Local Registrar',
                        id: 'userRole.localRegistrar'
                      }
                    }
                  },
                  startedByFacility: null,
                  progressReport: {
                    timeInProgress: null,
                    timeInReadyForReview: null,
                    timeInRequiresUpdates: null,
                    timeInWaitingForApproval: null,
                    timeInWaitingForBRIS: null,
                    timeInReadyToPrint: null
                  }
                },
                {
                  id: 'd78d29a1-8521-4582-9f4e-902907ca369a',
                  type: EventType.Birth,
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
                  dateOfEvent: '2020-02-15' as unknown as PlainDate,
                  registration: {
                    status: 'REGISTERED',
                    contactNumber: '+8801959595999',
                    contactRelationship: 'Uncle',
                    dateOfDeclaration: '2020-05-20T14:40:03.088Z',
                    trackingId: 'BXOQWTT',
                    registrationNumber: '20207210411000119',
                    createdAt: '1589985603133',
                    modifiedAt: '1589985605583'
                  },
                  startedAt: '2020-05-17',
                  startedBy: {
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Mohammad',
                        familyName: 'Ashraful'
                      }
                    ],
                    role: {
                      id: 'LOCAL_REGISTRAR',
                      label: {
                        defaultMessage: 'Local Registrar',
                        description: 'Name for user role Local Registrar',
                        id: 'userRole.localRegistrar'
                      }
                    }
                  },
                  progressReport: {
                    timeInProgress: 123,
                    timeInReadyForReview: 25,
                    timeInRequiresUpdates: 23,
                    timeInWaitingForApproval: 56,
                    timeInWaitingForBRIS: 1200,
                    timeInReadyToPrint: 78
                  }
                },
                {
                  id: '8a1d92b8-18a6-4074-83fb-cc57134e6dbf',
                  type: EventType.Birth,
                  name: [
                    {
                      use: 'en',
                      firstNames: '',
                      familyName: 'Mother Family Name'
                    },
                    {
                      use: 'bn',
                      firstNames: '',
                      familyName: 'আমিনা'
                    }
                  ],
                  dateOfEvent: '2020-03-15' as unknown as PlainDate,
                  registration: {
                    status: 'CERTIFIED',
                    contactNumber: '+8801656568682',
                    contactRelationship: 'MOTHER',
                    dateOfDeclaration: '2020-05-22T06:18:04.895Z',
                    trackingId: 'BGEPVNQ',
                    registrationNumber: '20207210411000118',
                    createdAt: '1590128285130',
                    modifiedAt: null
                  },
                  startedAt: '2020-05-18',
                  startedBy: {
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Mohammad',
                        familyName: 'Ashraful'
                      }
                    ],
                    role: {
                      id: 'LOCAL_REGISTRAR',
                      label: {
                        defaultMessage: 'Local Registrar',
                        description: 'Name for user role Local Registrar',
                        id: 'userRole.localRegistrar'
                      }
                    }
                  },
                  progressReport: {
                    timeInProgress: null,
                    timeInReadyForReview: null,
                    timeInRequiresUpdates: null,
                    timeInWaitingForApproval: null,
                    timeInWaitingForBRIS: null,
                    timeInReadyToPrint: 72
                  }
                }
              ]
            } satisfies GetEventsWithProgressQuery['getEventsWithProgress']
          }
        }
      }
    ]

    beforeEach(async () => {
      const { component: testComponent, router: testRouter } =
        await createTestComponent(<WorkflowStatus />, {
          store,
          graphqlMocks,
          path: WORKFLOW_STATUS,
          initialEntries: [
            '/',
            formatUrl(WORKFLOW_STATUS, {}) +
              '?' +
              stringify({
                locationId,
                event: 'BIRTH',
                status: 'REGISTERED'
              })
          ]
        })

      component = testComponent
      router = testRouter

      component.update()
      await waitForElement(component, '#declaration-status-list')
    })

    it('clicking on back takes back to your previous url', async () => {
      const backButton = await waitForElement(
        component,
        '#header-go-back-button'
      )
      backButton.hostNodes().simulate('click')
      expect(router.state.location.pathname).toBe('/')
    })

    it('renders data', async () => {
      const listTable = await waitForElement(
        component,
        '#declaration-status-list'
      )

      expect(listTable.find('div#row_1').hostNodes()).toHaveLength(1)
    })

    it('toggles sort order', async () => {
      const listTable = await waitForElement(
        component,
        '#declaration-status-list'
      )

      const toggleSortButton = await waitForElement(
        component,
        'span#declarationStartedOn-label'
      )
      expect(listTable.find('div#row_0').hostNodes().childAt(5).text()).toMatch(
        /May 18, 2020/
      )

      toggleSortButton.hostNodes().simulate('click')

      expect(listTable.find('div#row_0').hostNodes().childAt(5).text()).toMatch(
        /May 17, 2020/
      )

      toggleSortButton.hostNodes().simulate('click')

      expect(listTable.find('div#row_0').hostNodes().childAt(5).text()).toMatch(
        /May 18, 2020/
      )
    })

    it('update event from select updates query params', async () => {
      const eventSelect = await waitForElement(component, '#event-select')
      eventSelect.at(0).prop('onChange')({ label: 'Deaths', value: 'DEATH' })
      component.update()
      expect(parse(router.state.location.search).event).toBe('DEATH')
    })

    it('update status from select updates query params', async () => {
      const statusSelect = await waitForElement(component, '#status-select')
      statusSelect.at(0).prop('onChange')({
        label: 'Ready to print',
        value: 'REGISTERED'
      })
      component.update()
      expect(parse(router.state.location.search).status).toBe('REGISTERED')
    })
  })

  describe('events with progress fetched with failure', () => {
    const graphqlMocksWithError = [
      {
        request: {
          query: FETCH_EVENTS_WITH_PROGRESS,
          variables: {
            count: 25,
            skip: 0,
            declarationJurisdictionId: locationId,
            registrationStatuses: ['REGISTERED'],
            compositionType: ['birth-declaration', 'birth-notification']
          }
        },
        result: {
          errors: [new GraphQLError('Error!')]
        }
      }
    ]

    beforeEach(async () => {
      const { component: testComponent } = await createTestComponent(
        <WorkflowStatus />,
        {
          store,
          path: WORKFLOW_STATUS,
          initialEntries: [
            formatUrl(WORKFLOW_STATUS, {}) +
              '?' +
              stringify({
                locationId,
                event: 'BIRTH',
                status: 'REGISTERED'
              })
          ],
          graphqlMocks: graphqlMocksWithError
        }
      )

      component = testComponent
    })

    it('renders error notification toast', async () => {
      const notificationToast = await waitForElement(component, '#error-toast')
      expect(notificationToast.hostNodes().text()).toBe(
        "Sorry, we couldn't load the content for this pageRetry"
      )
    })
  })
})

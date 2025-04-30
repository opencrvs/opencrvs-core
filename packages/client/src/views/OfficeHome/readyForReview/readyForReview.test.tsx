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
import {
  DOWNLOAD_STATUS,
  makeDeclarationReadyToDownload,
  storeDeclaration,
  modifyDeclaration
} from '@client/declarations'
import { DownloadAction } from '@client/forms'
import { EventType } from '@client/utils/gateway'
import { queries } from '@client/profile/queries'
import { createStore } from '@client/store'
import {
  createTestComponent,
  mockUserResponse,
  REGISTRAR_DEFAULT_SCOPES,
  resizeWindow,
  setScopes,
  TestComponentWithRouteMock
} from '@client/tests/util'
import { waitForElement, waitFor } from '@client/tests/wait-for-element'
import { createClient } from '@client/utils/apolloClient'
import { REGISTRATION_HOME_QUERY } from '@client/views/OfficeHome/queries'
import { OfficeHome } from '@client/views/OfficeHome/OfficeHome'
import { EVENT_STATUS } from '@client/workqueue'
import { Workqueue } from '@opencrvs/components/lib/Workqueue'
import { ApolloClient } from '@apollo/client'
import { merge } from 'lodash'
import * as React from 'react'
import { ReadyForReview } from './ReadyForReview'
import type {
  GQLBirthEventSearchSet,
  GQLDeathEventSearchSet
} from '@client/utils/gateway-deprecated-do-not-use'
import { formattedDuration } from '@client/utils/date-formatting'
import { birthDeclarationForReview } from '@client/tests/mock-graphql-responses'
import { vi, Mock } from 'vitest'

const nameObj = {
  data: {
    getUser: {
      name: [
        {
          use: 'en',
          firstNames: 'Mohammad',
          familyName: 'Ashraful',
          __typename: 'HumanName'
        },
        { use: 'bn', firstNames: '', familyName: '', __typename: 'HumanName' }
      ],
      role: 'DISTRICT_REGISTRAR'
    }
  }
}

const mockListSyncController = vi.fn()

const mockSearchData = {
  id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8',
  type: EventType.Birth,
  registration: {
    status: 'DECLARED',
    contactNumber: '01622688231',
    trackingId: 'BW0UTHR',
    registrationNumber: null,
    registeredLocationId: '308c35b4-04f8-4664-83f5-9790e790cde1',
    duplicates: null,
    createdAt: '2018-05-23T14:44:58+02:00',
    modifiedAt: '2018-05-23T14:44:58+02:00'
  },
  dateOfBirth: '2010-10-10',
  childName: [
    {
      firstNames: 'Iliyas',
      familyName: 'Khan',
      use: 'en'
    },
    {
      firstNames: 'ইলিয়াস',
      familyName: 'খান',
      use: 'bn'
    }
  ],
  // TODO: When fragmentMatching work is completed, remove unnecessary result objects
  // PR: https://github.com/opencrvs/opencrvs-core/pull/836/commits/6302fa8f015fe313cbce6197980f1300bf4eba32
  child: {
    id: 'FAKE_ID',
    name: [
      {
        firstNames: 'Iliyas',
        familyName: 'Khan',
        use: 'en'
      },
      {
        firstNames: 'ইলিয়াস',
        familyName: 'খান',
        use: 'bn'
      }
    ],
    birthDate: '2010-10-10'
  },
  deceased: {
    name: [
      {
        use: '',
        firstNames: '',
        familyName: ''
      }
    ],
    deceased: {
      deathDate: ''
    }
  },
  informant: {
    individual: {
      telecom: [
        {
          system: '',
          use: '',
          value: ''
        }
      ]
    }
  },
  dateOfDeath: null,
  deceasedName: null,
  createdAt: '2018-05-23T14:44:58+02:00'
}
const searchData: any = []
for (let i = 0; i < 14; i++) {
  searchData.push(mockSearchData)
}
merge(mockUserResponse, nameObj)

const mockDeclarationDateStr = '2019-10-20T11:03:20.660Z'
const mockReviewTabData = {
  totalItems: 2,
  results: [
    {
      id: '9a55d213-ad9f-4dcd-9418-340f3a7f6269',
      type: EventType.Birth,
      registration: {
        status: 'DECLARED',
        contactNumber: '01622688231',
        trackingId: 'BW0UTHR',
        registrationNumber: undefined,
        eventLocationId: undefined,
        registeredLocationId: '308c35b4-04f8-4664-83f5-9790e790cde1',
        createdAt: '1544188309380',
        modifiedAt: '1544188309380'
      },
      operationHistories: [
        {
          operationType: 'DECLARED',
          operatedOn: mockDeclarationDateStr,
          operatorRole: 'LOCAL_REGISTRAR',
          operatorName: [
            {
              firstNames: 'Mohammad',
              familyName: 'Ashraful',
              use: 'en'
            },
            {
              firstNames: '',
              familyName: '',
              use: 'bn'
            }
          ],
          operatorOfficeName: 'Alokbali Union Parishad',
          operatorOfficeAlias: ['আলোকবালী  ইউনিয়ন পরিষদ']
        }
      ],
      dateOfBirth: '2010-10-10',
      childName: [
        {
          firstNames: 'Iliyas',
          familyName: 'Khan',
          use: 'en'
        },
        {
          firstNames: 'ইলিয়াস',
          familyName: 'খান',
          use: 'bn'
        }
      ]
    } as GQLBirthEventSearchSet,
    {
      id: 'bc09200d-0160-43b4-9e2b-5b9e90424e95',
      type: EventType.Death,
      registration: {
        status: 'VALIDATED',
        trackingId: 'DW0UTHR',
        registrationNumber: undefined,
        eventLocationId: undefined,
        contactNumber: undefined,
        duplicates: ['308c35b4-04f8-4664-83f5-9790e790cd33'],
        registeredLocationId: '308c35b4-04f8-4664-83f5-9790e790cde1',
        createdAt: '1544188309380',
        modifiedAt: '1544188309380'
      },
      dateOfDeath: '2007-01-01',
      deceasedName: [
        {
          firstNames: 'Iliyas',
          familyName: 'Khan',
          use: 'en'
        },
        {
          firstNames: 'ইলিয়াস',
          familyName: 'খান',
          use: 'bn'
        }
      ]
    } as GQLDeathEventSearchSet
  ]
}

describe('OfficeHome sent for review tab related tests', () => {
  let store: ReturnType<typeof createStore>['store']
  let apolloClient: ApolloClient<{}>

  beforeEach(async () => {
    ;(queries.fetchUserDetails as Mock).mockReturnValue(mockUserResponse)
    const createdStore = createStore()
    store = createdStore.store

    apolloClient = createClient(store)

    setScopes(REGISTRAR_DEFAULT_SCOPES, store)
  })

  it('should show pagination bar if items more than 11 in ReviewTab', async () => {
    Date.now = vi.fn(() => 1554055200000)

    const { component: testComponent } = await createTestComponent(
      <ReadyForReview
        queryData={{
          data: {
            totalItems: 24,
            results: []
          }
        }}
        paginationId={1}
        pageSize={10}
        onPageChange={() => {}}
        loading={false}
        error={false}
      />,
      { store }
    )

    const pagination = await waitForElement(
      testComponent,
      '#pagination_container'
    )

    expect(pagination.hostNodes()).toHaveLength(1)

    testComponent
      .find('#pagination button')
      .last()
      .hostNodes()
      .simulate('click')
    expect(testComponent.exists('#page-number-2')).toBeTruthy()
  })

  it('renders all items returned from graphql query in ready for review', async () => {
    Date.now = vi.fn(() => 1554055200000)

    const { component: testComponent } = await createTestComponent(
      <ReadyForReview
        queryData={{
          data: mockReviewTabData
        }}
        paginationId={1}
        pageSize={10}
        onPageChange={() => {}}
        loading={false}
        error={false}
      />,
      { store }
    )

    const workqueue = await waitForElement(testComponent, Workqueue)

    const data = workqueue.prop<Array<Record<string, string>>>('content')
    const EXPECTED_DATE_OF_DECLARATION = formattedDuration(
      new Date(mockDeclarationDateStr)
    )

    expect(data.length).toBe(2)
    expect(data[0].id).toBe('9a55d213-ad9f-4dcd-9418-340f3a7f6269')
    expect(data[0].dateOfEvent).toBe('8 years ago')
    expect(data[0].sentForReview).toBe(EXPECTED_DATE_OF_DECLARATION)
    expect(data[0].name).toBe('khan iliyas')
    expect(data[0].trackingId).toBe('BW0UTHR')
    expect(data[0].event).toBe('Birth')
    expect(data[0].actions).toBeDefined()
  })

  it('returns an empty array incase of invalid graphql query response', async () => {
    Date.now = vi.fn(() => 1554055200000)

    const { component: testComponent } = await createTestComponent(
      <ReadyForReview
        queryData={{
          data: {
            totalItems: 12,
            results: []
          }
        }}
        paginationId={1}
        pageSize={10}
        onPageChange={() => {}}
        loading={false}
        error={false}
      />,
      { store }
    )

    const workqueue = await waitForElement(testComponent, Workqueue)
    const data = workqueue.prop<Array<Record<string, string>>>('content')
    expect(data.length).toBe(0)
  })

  it('redirects to recordAudit page if row is clicked', async () => {
    Date.now = vi.fn(() => 1554055200000)

    const { component: testComponent, router } = await createTestComponent(
      <ReadyForReview
        queryData={{
          data: {
            totalItems: 2,
            results: [
              {
                id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8',
                type: EventType.Birth,
                registration: {
                  status: 'DECLARED',
                  contactNumber: '01622688231',
                  trackingId: 'BW0UTHR',
                  registrationNumber: undefined,
                  eventLocationId: undefined,
                  registeredLocationId: '308c35b4-04f8-4664-83f5-9790e790cde1',
                  duplicates: [null],
                  createdAt: '2018-05-23T14:44:58+02:00',
                  modifiedAt: '2018-05-23T14:44:58+02:00'
                },
                dateOfBirth: '2010-10-10',
                childName: [
                  {
                    firstNames: 'Iliyas',
                    familyName: 'Khan',
                    use: 'en'
                  },
                  {
                    firstNames: 'ইলিয়াস',
                    familyName: 'খান',
                    use: 'bn'
                  }
                ]
              } as GQLBirthEventSearchSet,
              {
                id: 'bc09200d-0160-43b4-9e2b-5b9e90424e95',
                type: EventType.Death,
                registration: {
                  status: 'VALIDATED',
                  trackingId: 'DW0UTHR',
                  registrationNumber: undefined,
                  eventLocationId: undefined,
                  contactNumber: undefined,
                  duplicates: ['308c35b4-04f8-4664-83f5-9790e790cd33'],
                  registeredLocationId: '308c35b4-04f8-4664-83f5-9790e790cde1',
                  createdAt: '2007-01-01',
                  modifiedAt: '2007-01-01'
                },
                operationHistories: [
                  {
                    operationType: 'VALIDATED',
                    operatedOn: '2019-12-12T15:23:21.280Z',
                    operatorRole: 'REGISTRATION_AGENT',
                    operatorName: [
                      {
                        firstNames: 'Tamim',
                        familyName: 'Iqbal',
                        use: 'en'
                      },
                      {
                        firstNames: '',
                        familyName: null,
                        use: 'bn'
                      }
                    ],
                    operatorOfficeName: 'Alokbali Union Parishad',
                    operatorOfficeAlias: ['আলোকবালী  ইউনিয়ন পরিষদ']
                  }
                ],
                dateOfDeath: '2007-01-01',
                deceasedName: [
                  {
                    firstNames: 'Iliyas',
                    familyName: 'Khan',
                    use: 'en'
                  },
                  {
                    firstNames: 'ইলিয়াস',
                    familyName: 'খান',
                    use: 'bn'
                  }
                ]
              } as GQLDeathEventSearchSet
            ]
          }
        }}
        paginationId={1}
        pageSize={10}
        onPageChange={() => {}}
        loading={false}
        error={false}
      />,
      { store }
    )
    const element = await waitForElement(testComponent, '#name_0')
    element.hostNodes().simulate('click')

    await waitFor(() =>
      router.state.location.pathname.includes(
        '/record-audit/reviewTab/e302f7c5-ad87-4117-91c1-35eaf2ea7be8'
      )
    )
  })

  describe('handles download status', () => {
    let testComponent: TestComponentWithRouteMock
    let createdTestComponent: TestComponentWithRouteMock
    beforeEach(async () => {
      Date.now = vi.fn(() => 1554055200000)

      mockListSyncController
        .mockReturnValueOnce({
          data: {
            inProgressTab: { totalItems: 0, results: [] },
            notificationTab: { totalItems: 0, results: [] },
            reviewTab: mockReviewTabData,
            rejectTab: { totalItems: 0, results: [] },
            approvalTab: { totalItems: 0, results: [] },
            printTab: { totalItems: 0, results: [] },
            externalValidationTab: { totalItems: 0, results: [] }
          },
          initialSyncDone: true
        })
        .mockReturnValueOnce({
          data: {
            fetchBirthRegistration: birthDeclarationForReview
          }
        })
      apolloClient.query = mockListSyncController

      createdTestComponent = await createTestComponent(<OfficeHome />, {
        store,
        apolloClient
      })

      testComponent = createdTestComponent
    })
    //TODO:: FAILED TEST
    it.skip('downloads declaration after clicking download button', async () => {
      await waitForElement(testComponent.component, '#ListItemAction-0-icon')
      testComponent.component
        .find('#ListItemAction-0-icon')
        .hostNodes()
        .simulate('click')
      testComponent.component.update()
      expect(
        testComponent.component.find('#assignment').hostNodes()
      ).toHaveLength(1)

      testComponent.component.find('#assign').hostNodes().simulate('click')

      expect(
        testComponent.component
          .find('#action-loading-ListItemAction-0')
          .hostNodes()
      ).toHaveLength(1)

      await new Promise((resolve) => {
        setTimeout(resolve, 100)
      })
      testComponent.component.update()

      const action = await waitForElement(
        testComponent.component,
        '#ListItemAction-0-Review'
      )
      action.hostNodes().simulate('click')

      await new Promise((resolve) => {
        setTimeout(resolve, 100)
      })
      testComponent.component.update()
      expect(testComponent.router.state.location.pathname).toBe(
        '/reviews/9a55d213-ad9f-4dcd-9418-340f3a7f6269/events/birth/parent/review'
      )
    })
    //TODO:: FAILED TEST
    it.skip('shows error when download is failed', async () => {
      const downloadedDeclaration = makeDeclarationReadyToDownload(
        EventType.Death,
        'bc09200d-0160-43b4-9e2b-5b9e90424e95',
        DownloadAction.LOAD_REVIEW_DECLARATION
      )
      downloadedDeclaration.downloadStatus = DOWNLOAD_STATUS.FAILED
      store.dispatch(storeDeclaration(downloadedDeclaration))

      testComponent.component.update()

      expect(
        testComponent.component
          .find('#ListItemAction-1-icon-failed')
          .hostNodes()
      ).toHaveLength(1)
    })
  })

  it('check the validate icon', async () => {
    const TIME_STAMP = '1544188309380'
    Date.now = vi.fn(() => 1554055200000)

    const { component: testComponent } = await createTestComponent(
      <ReadyForReview
        queryData={{
          data: {
            totalItems: 2,
            results: [
              {
                id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8',
                type: EventType.Birth,
                registration: {
                  status: 'VALIDATED',
                  contactNumber: '01622688231',
                  trackingId: 'BW0UTHR',
                  registeredLocationId: '308c35b4-04f8-4664-83f5-9790e790cde1',
                  createdAt: TIME_STAMP,
                  modifiedAt: TIME_STAMP
                },
                dateOfBirth: '2010-10-10',
                childName: [
                  {
                    firstNames: 'Iliyas',
                    familyName: 'Khan',
                    use: 'en'
                  },
                  {
                    firstNames: 'ইলিয়াস',
                    familyName: 'খান',
                    use: 'bn'
                  }
                ]
              } as GQLBirthEventSearchSet,
              {
                id: 'bc09200d-0160-43b4-9e2b-5b9e90424e95',
                type: EventType.Death,
                registration: {
                  status: 'DECLARED',
                  trackingId: 'DW0UTHR',
                  duplicates: ['308c35b4-04f8-4664-83f5-9790e790cd33'],
                  registeredLocationId: '308c35b4-04f8-4664-83f5-9790e790cde1',
                  createdAt: TIME_STAMP,
                  modifiedAt: TIME_STAMP
                },
                dateOfDeath: '2007-01-01',
                deceasedName: [
                  {
                    firstNames: 'Iliyas',
                    familyName: 'Khan',
                    use: 'en'
                  },
                  {
                    firstNames: 'ইলিয়াস',
                    familyName: 'খান',
                    use: 'bn'
                  }
                ]
              } as GQLDeathEventSearchSet
            ]
          }
        }}
        paginationId={1}
        pageSize={10}
        onPageChange={() => {}}
        loading={false}
        error={false}
      />,
      { store }
    )

    const props = testComponent.find('#declaration_icon').first().props().color
    expect(props).toBe('grey')
  })

  describe.skip('handles download status for possible duplicate declaration', () => {
    let testComponent: TestComponentWithRouteMock
    let createdTestComponent: TestComponentWithRouteMock
    beforeAll(async () => {
      Date.now = vi.fn(() => 1554055200000)
      const graphqlMocks = [
        {
          request: {
            query: REGISTRATION_HOME_QUERY,
            variables: {
              declarationLocationId: '2a83cf14-b959-47f4-8097-f75a75d1867f',
              count: 10,
              reviewStatuses: [EVENT_STATUS.DECLARED, EVENT_STATUS.VALIDATED],
              inProgressSkip: 0,
              reviewSkip: 0,
              rejectSkip: 0,
              approvalSkip: 0,
              externalValidationSkip: 0,
              printSkip: 0
            }
          },
          result: {
            data: {
              inProgressTab: { totalItems: 0, results: [] },
              notificationTab: { totalItems: 0, results: [] },
              reviewTab: mockReviewTabData,
              rejectTab: { totalItems: 0, results: [] },
              approvalTab: { totalItems: 0, results: [] },
              externalValidationTab: { totalItems: 0, results: [] },
              printTab: { totalItems: 0, results: [] }
            }
          }
        }
      ]

      createdTestComponent = await createTestComponent(
        // @ts-ignore
        <OfficeHome />,
        { store, graphqlMocks }
      )

      setScopes(REGISTRAR_DEFAULT_SCOPES, store)
      testComponent = createdTestComponent
    })

    it('starts downloading after clicking download button', async () => {
      const downloadButton = await waitForElement(
        testComponent.component,
        '#ListItemAction-1-icon'
      )

      downloadButton.hostNodes().simulate('click')
      testComponent.component.update()

      expect(
        testComponent.component
          .find('#action-loading-ListItemAction-1')
          .hostNodes()
      ).toHaveLength(1)
    })

    it('shows review button when download is complete', async () => {
      const downloadedDeclaration = makeDeclarationReadyToDownload(
        EventType.Death,
        'bc09200d-0160-43b4-9e2b-5b9e90424e95',
        DownloadAction.LOAD_REVIEW_DECLARATION
      )
      downloadedDeclaration.downloadStatus = DOWNLOAD_STATUS.DOWNLOADED
      store.dispatch(modifyDeclaration(downloadedDeclaration))

      const action = await waitForElement(
        testComponent.component,
        '#ListItemAction-1-Review'
      )

      expect(action.hostNodes()).toHaveLength(1)
      action.hostNodes().simulate('click')

      await waitFor(() =>
        testComponent.router.state.location.pathname.includes(
          '/duplicates/bc09200d-0160-43b4-9e2b-5b9e90424e95'
        )
      )
    })

    it('shows error when download is failed', async () => {
      const downloadedDeclaration = makeDeclarationReadyToDownload(
        EventType.Death,
        'bc09200d-0160-43b4-9e2b-5b9e90424e95',
        DownloadAction.LOAD_REVIEW_DECLARATION
      )
      downloadedDeclaration.downloadStatus = DOWNLOAD_STATUS.FAILED
      store.dispatch(modifyDeclaration(downloadedDeclaration))

      testComponent.component.update()

      const errorIcon = await waitForElement(
        testComponent.component,
        '#ListItemAction-1-download-failed'
      )

      expect(errorIcon.hostNodes()).toHaveLength(1)
    })
  })
})

describe('Tablet tests', () => {
  let { store } = createStore()

  beforeAll(async () => {
    const s = createStore()
    store = s.store

    resizeWindow(800, 1280)
  })

  afterEach(() => {
    resizeWindow(1024, 768)
  })

  it('redirects to recordAudit page if item is clicked', async () => {
    const TIME_STAMP = '1544188309380'
    Date.now = vi.fn(() => 1554055200000)

    const { component: testComponent, router } = await createTestComponent(
      <ReadyForReview
        queryData={{
          data: {
            totalItems: 2,
            results: [
              {
                id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8',
                type: EventType.Birth,
                registration: {
                  status: 'VALIDATED',
                  contactNumber: '01622688231',
                  trackingId: 'BW0UTHR',
                  registrationNumber: undefined,
                  eventLocationId: undefined,
                  registeredLocationId: '308c35b4-04f8-4664-83f5-9790e790cde1',
                  duplicates: [null],
                  createdAt: TIME_STAMP,
                  modifiedAt: TIME_STAMP
                },
                dateOfBirth: '2010-10-10',
                childName: [
                  {
                    firstNames: 'Iliyas',
                    familyName: 'Khan',
                    use: 'en'
                  },
                  {
                    firstNames: 'ইলিয়াস',
                    familyName: 'খান',
                    use: 'bn'
                  }
                ]
              } as GQLBirthEventSearchSet,
              {
                id: 'bc09200d-0160-43b4-9e2b-5b9e90424e95',
                type: EventType.Death,
                registration: {
                  status: 'DECLARED',
                  trackingId: 'DW0UTHR',
                  registrationNumber: undefined,
                  eventLocationId: undefined,
                  contactNumber: undefined,
                  duplicates: ['308c35b4-04f8-4664-83f5-9790e790cd33'],
                  registeredLocationId: '308c35b4-04f8-4664-83f5-9790e790cde1',
                  createdAt: TIME_STAMP,
                  modifiedAt: TIME_STAMP
                },
                dateOfDeath: '2007-01-01',
                deceasedName: [
                  {
                    firstNames: 'Iliyas',
                    familyName: 'Khan',
                    use: 'en'
                  },
                  {
                    firstNames: 'ইলিয়াস',
                    familyName: 'খান',
                    use: 'bn'
                  }
                ]
              } as GQLDeathEventSearchSet
            ]
          }
        }}
        paginationId={1}
        pageSize={10}
        onPageChange={() => {}}
        loading={false}
        error={false}
      />,
      { store }
    )

    setScopes(REGISTRAR_DEFAULT_SCOPES, store)

    const row = await waitForElement(testComponent, '#name_0')
    row.hostNodes().simulate('click')

    expect(router.state.location.pathname).toContain(
      '/record-audit/reviewTab/e302f7c5-ad87-4117-91c1-35eaf2ea7be8'
    )
  })
})

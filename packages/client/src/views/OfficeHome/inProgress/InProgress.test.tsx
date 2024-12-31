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
import { WORKQUEUE_TABS } from '@client/components/interface/WorkQueueTabs'
import {
  createDeclaration,
  DOWNLOAD_STATUS,
  IDeclaration,
  makeDeclarationReadyToDownload,
  storeDeclaration
} from '@client/declarations'
import { DownloadAction } from '@client/forms'
import { formatUrl } from '@client/navigation'
import {
  REGISTRAR_HOME_TAB,
  REVIEW_EVENT_PARENT_FORM_PAGE
} from '@client/navigation/routes'
import { AppStore, createStore } from '@client/store'
import { createTestComponent, resizeWindow } from '@client/tests/util'
import { formattedDuration } from '@client/utils/date-formatting'
import { EventType } from '@client/utils/gateway'
import type {
  GQLBirthEventSearchSet,
  GQLDeathEventSearchSet
} from '@client/utils/gateway-deprecated-do-not-use'
import { Workqueue } from '@opencrvs/components/lib/Workqueue'
import * as React from 'react'
import { InProgress, SELECTOR_ID } from './InProgress'

const { store } = createStore()

describe('In Progress tab', () => {
  it('redirects to different route upon selection', async () => {
    const { component: app, router } = await createTestComponent(
      <InProgress
        selectorId={SELECTOR_ID.fieldAgentDrafts}
        queryData={{
          inProgressData: {},
          notificationData: {}
        }}
        paginationId={{
          fieldAgentId: 1,
          healthSystemId: 1
        }}
        pageSize={10}
        onPageChange={(_pageId: number) => {}}
        loading={false}
        error={false}
      />,
      { store }
    )

    app.find(`#tab_${SELECTOR_ID.hospitalDrafts}`).hostNodes().simulate('click')
    app.update()
    expect(router.state.location.pathname).toContain(
      formatUrl(REGISTRAR_HOME_TAB, {
        tabId: WORKQUEUE_TABS.inProgress,
        selectorId: SELECTOR_ID.hospitalDrafts
      })
    )
    app
      .find(`#tab_${SELECTOR_ID.fieldAgentDrafts}`)
      .hostNodes()
      .simulate('click')
    app.update()
    expect(router.state.location.pathname).toContain(
      formatUrl(REGISTRAR_HOME_TAB, {
        tabId: WORKQUEUE_TABS.inProgress,
        selectorId: SELECTOR_ID.fieldAgentDrafts
      })
    )
  })

  it('renders two selectors with count for each', async () => {
    const { component: app } = await createTestComponent(
      <InProgress
        selectorId={SELECTOR_ID.fieldAgentDrafts}
        queryData={{
          inProgressData: { totalItems: 5 },
          notificationData: { totalItems: 3 }
        }}
        paginationId={{
          fieldAgentId: 1,
          healthSystemId: 1
        }}
        pageSize={10}
        onPageChange={(_pageId: number) => {}}
      />,
      { store }
    )

    expect(app.find('#tab_field-agents').hostNodes().text()).toContain(
      'Field agents (5)'
    )
    expect(app.find('#tab_hospitals').hostNodes().text()).toContain(
      'Hospitals (3)'
    )
  })

  describe('When the remote drafts selector is selected', () => {
    it('renders all items returned from graphql query in inProgress tab', async () => {
      const TIME_STAMP = '1562912635549'
      const drafts: IDeclaration[] = []
      drafts.push(createDeclaration(EventType.Birth))
      const { component: testComponent } = await createTestComponent(
        <InProgress
          selectorId={SELECTOR_ID.fieldAgentDrafts}
          queryData={{
            inProgressData: {
              totalItems: 1,
              results: [
                {
                  id: '956281c9-1f47-4c26-948a-970dd23c4094',
                  type: EventType.Death,
                  registration: {
                    status: 'IN_PROGRESS',
                    contactNumber: undefined,
                    trackingId: 'DG6PECX',
                    registrationNumber: undefined,
                    eventLocationId: undefined,
                    registeredLocationId:
                      'd8cfd240-4b5a-4557-9df7-b1591a11d843',
                    duplicates: [null],
                    createdAt: TIME_STAMP,
                    modifiedAt: undefined
                  },
                  operationHistories: [
                    {
                      operationType: 'IN_PROGRESS',
                      operatedOn: '2019-10-20T11:03:20.660Z',
                      operatorRole: 'FIELD_AGENT',
                      operatorName: [
                        {
                          firstNames: 'Mohammad',
                          familyName: 'Ashraful',
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
                  dateOfDeath: '2019-01-18',
                  deceasedName: [
                    {
                      use: 'bn',
                      firstNames: 'ক ম আব্দুল্লাহ আল আমিন ',
                      familyName: 'খান'
                    },
                    {
                      use: 'en',
                      firstNames: 'K M Abdullah al amin',
                      familyName: 'Khan'
                    }
                  ]
                } as GQLDeathEventSearchSet
              ]
            },
            notificationData: {}
          }}
          paginationId={{
            fieldAgentId: 1,
            healthSystemId: 1
          }}
          pageSize={10}
          onPageChange={(_pageId: number) => {}}
        />,
        { store }
      )

      const data = testComponent
        .find(Workqueue)
        .prop<Array<Record<string, string>>>('content')
      const EXPECTED_NOTIFICATION_SENT_DATE = formattedDuration(
        Number(TIME_STAMP)
      )
      expect(data[0].id).toBe('956281c9-1f47-4c26-948a-970dd23c4094')
      expect(data[0].name).toBe('k m abdullah al amin khan')
      expect(data[0].notificationSent).toBe(EXPECTED_NOTIFICATION_SENT_DATE)
      expect(data[0].event).toBe('Death')
    })

    it('Should render pagination in progress tab if data is more than 10', async () => {
      const drafts: IDeclaration[] = []
      drafts.push(createDeclaration(EventType.Birth))
      const { component: testComponent } = await createTestComponent(
        <InProgress
          selectorId={SELECTOR_ID.fieldAgentDrafts}
          queryData={{
            inProgressData: { totalItems: 12 },
            notificationData: { totalItems: 2 }
          }}
          paginationId={{
            fieldAgentId: 1,
            healthSystemId: 1
          }}
          pageSize={10}
          onPageChange={(_pageId: number) => {}}
        />,
        { store }
      )

      const pagiBtn = testComponent.find('#pagination_container')

      expect(pagiBtn.hostNodes()).toHaveLength(1)
      testComponent
        .find('#pagination button')
        .last()
        .hostNodes()
        .simulate('click')
    })

    it('redirects to recordAudit page when item is clicked', async () => {
      const TIME_STAMP = '1562912635549'
      const drafts: IDeclaration[] = []
      drafts.push(createDeclaration(EventType.Birth))
      const { component: testComponent, router } = await createTestComponent(
        <InProgress
          selectorId={SELECTOR_ID.hospitalDrafts}
          queryData={{
            inProgressData: {},
            notificationData: {
              totalItems: 1,
              results: [
                {
                  id: '956281c9-1f47-4c26-948a-970dd23c4094',
                  type: EventType.Death,
                  registration: {
                    status: 'IN_PROGRESS',
                    contactNumber: undefined,
                    trackingId: 'DG6PECX',
                    registrationNumber: undefined,
                    eventLocationId: undefined,
                    registeredLocationId:
                      'd8cfd240-4b5a-4557-9df7-b1591a11d843',
                    duplicates: [null],
                    createdAt: TIME_STAMP,
                    modifiedAt: undefined
                  },
                  operationHistories: [
                    {
                      operationType: 'IN_PROGRESS',
                      operatedOn: '2019-10-20T11:03:20.660Z',
                      operatorRole: 'FIELD_AGENT',
                      operatorName: [
                        {
                          firstNames: 'Mohammad',
                          familyName: 'Ashraful',
                          use: 'en'
                        },
                        {
                          firstNames: '',
                          familyName: null,
                          use: 'bn'
                        }
                      ],
                      operatorOfficeName: 'Alokbali Union Parishad',
                      operatorOfficeAlias: ['আলোকবালী  ইউনিয়ন পরিষদ'],
                      notificationFacilityName:
                        'Charmadhabpur(bakharnagar) Cc - Narsingdi Sadar',
                      notificationFacilityAlias: [
                        'Charmadhabpur(bakharnagar) Cc - Narsingdi Sadar'
                      ]
                    }
                  ],
                  dateOfDeath: '2019-01-18',
                  deceasedName: [
                    {
                      use: 'bn',
                      firstNames: 'ক ম আব্দুল্লাহ আল আমিন ',
                      familyName: 'খান'
                    },
                    {
                      use: 'en',
                      firstNames: 'K M Abdullah al amin',
                      familyName: 'Khan'
                    }
                  ]
                } as GQLDeathEventSearchSet
              ]
            }
          }}
          paginationId={{
            fieldAgentId: 1,
            healthSystemId: 1
          }}
          pageSize={10}
          onPageChange={(_pageId: number) => {}}
        />,
        { store }
      )

      testComponent.find('#name_0').hostNodes().simulate('click')

      testComponent.update()

      expect(router.state.location.pathname).toContain(
        '/record-audit/notificationTab/956281c9-1f47-4c26-948a-970dd23c4094'
      )
    })

    describe('handles download status', () => {
      let store: AppStore

      const TIME_STAMP = '1562912635549'
      const declarationId = 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8'
      const inprogressProps = {
        selectorId: SELECTOR_ID.fieldAgentDrafts,
        registrarLocationId: '0627c48a-c721-4ff9-bc6e-1fba59a2332a',
        queryData: {
          inProgressData: {
            totalItems: 1,
            results: [
              {
                id: declarationId,
                type: EventType.Birth,
                registration: {
                  trackingId: 'BQ2IDOP',
                  modifiedAt: TIME_STAMP,
                  status: 'IN_PROGRESS'
                },
                childName: [
                  {
                    use: 'en',
                    firstNames: 'Anik',
                    familyName: 'Hoque'
                  }
                ]
              } as GQLBirthEventSearchSet
            ]
          },
          notificationData: {}
        },
        isFieldAgent: false,
        paginationId: {
          fieldAgentId: 1,
          healthSystemId: 1
        },
        pageSize: 10,
        onPageChange: (_pageId: number) => {}
      }

      beforeEach(() => {
        const newStore = createStore()
        store = newStore.store
      })

      it('renders download button when not downloaded', async () => {
        const downloadableDeclaration = makeDeclarationReadyToDownload(
          EventType.Birth,
          declarationId,
          DownloadAction.LOAD_REVIEW_DECLARATION
        )
        downloadableDeclaration.downloadStatus = undefined
        store.dispatch(storeDeclaration(downloadableDeclaration))
        const { component: testComponent } = await createTestComponent(
          <InProgress {...inprogressProps} />,
          { store }
        )

        expect(
          testComponent.find('#ListItemAction-0-icon').hostNodes()
        ).toHaveLength(1)
      })
      it('renders loading indicator when declaration is being downloaded', async () => {
        const downloadableDeclaration = makeDeclarationReadyToDownload(
          EventType.Birth,
          declarationId,
          DownloadAction.LOAD_REVIEW_DECLARATION
        )
        downloadableDeclaration.downloadStatus = DOWNLOAD_STATUS.DOWNLOADING
        store.dispatch(storeDeclaration(downloadableDeclaration))
        const { component: testComponent } = await createTestComponent(
          <InProgress {...inprogressProps} />,
          { store }
        )

        expect(
          testComponent.find('#action-loading-ListItemAction-0').hostNodes()
        ).toHaveLength(1)
      })
      it('renders update button when download succeeds', async () => {
        const downloadableDeclaration = makeDeclarationReadyToDownload(
          EventType.Birth,
          declarationId,
          DownloadAction.LOAD_REVIEW_DECLARATION
        )
        downloadableDeclaration.downloadStatus = DOWNLOAD_STATUS.DOWNLOADED
        store.dispatch(storeDeclaration(downloadableDeclaration))
        const { component: testComponent, router } = await createTestComponent(
          <InProgress {...inprogressProps} />,
          { store }
        )

        expect(
          testComponent.find('#ListItemAction-0-Update').hostNodes()
        ).toHaveLength(1)

        testComponent
          .find('#ListItemAction-0-Update')
          .hostNodes()
          .simulate('click')

        testComponent.update()

        expect(router.state.location.pathname).toContain(
          formatUrl(REVIEW_EVENT_PARENT_FORM_PAGE, {
            declarationId,
            pageId: 'review',
            event: EventType.Birth
          })
        )
      })
      it('renders error when download fails', async () => {
        const downloadableDeclaration = makeDeclarationReadyToDownload(
          EventType.Birth,
          declarationId,
          DownloadAction.LOAD_REVIEW_DECLARATION
        )
        downloadableDeclaration.downloadStatus = DOWNLOAD_STATUS.FAILED
        store.dispatch(storeDeclaration(downloadableDeclaration))
        const { component: testComponent } = await createTestComponent(
          <InProgress {...inprogressProps} />,
          { store }
        )
        expect(
          testComponent.find('#ListItemAction-0-icon-failed').hostNodes()
        ).toHaveLength(1)
      })
    })
  })

  describe('When Notification (Hospital) tab is selected', () => {
    it('Should render all items returned from graphQL', async () => {
      const TIME_STAMP = '1562912635549'
      const birthNotificationSentDateStr = '2019-10-20T11:03:20.660Z'
      const { component: testComponent } = await createTestComponent(
        <InProgress
          selectorId={SELECTOR_ID.hospitalDrafts}
          queryData={{
            notificationData: {
              totalItems: 2,
              results: [
                {
                  id: 'f0a1ca2c-6a14-4b9e-a627-c3e2e110587e',
                  type: EventType.Birth,
                  registration: {
                    trackingId: 'BQ2IDOP',
                    modifiedAt: TIME_STAMP
                  },
                  operationHistories: [
                    {
                      operationType: 'IN_PROGRESS',
                      operatedOn: birthNotificationSentDateStr,
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
                  childName: [
                    {
                      use: 'en',
                      firstNames: 'Anik',
                      familyName: 'Hoque'
                    }
                  ]
                } as GQLBirthEventSearchSet,
                {
                  id: '2f7828fd-24ac-49fd-a1fd-53cda4777aa0',
                  type: EventType.Death,
                  registration: {
                    trackingId: 'DZECJZC',
                    modifiedAt: TIME_STAMP
                  },
                  deceasedName: [
                    {
                      use: 'en',
                      firstNames: 'Anik',
                      familyName: 'Hoque'
                    }
                  ]
                } as GQLDeathEventSearchSet
              ]
            },
            inProgressData: {}
          }}
          paginationId={{
            fieldAgentId: 1,
            healthSystemId: 1
          }}
          pageSize={10}
          onPageChange={(_pageId: number) => {}}
        />,
        { store }
      )

      const data = testComponent
        .find(Workqueue)
        .prop<Array<Record<string, string>>>('content')
      const EXPECTED_NOTIFICATION_SENT_DATE = formattedDuration(
        new Date(birthNotificationSentDateStr)
      )

      expect(data[0].id).toBe('f0a1ca2c-6a14-4b9e-a627-c3e2e110587e')
      expect(data[0].name).toBe('anik hoque')
      expect(data[0].notificationSent).toBe(EXPECTED_NOTIFICATION_SENT_DATE)
      expect(data[0].event).toBe('Birth')
    })
  })

  describe('Tablet tests', () => {
    const { store } = createStore()

    beforeAll(async () => {
      resizeWindow(800, 1280)
    })

    afterAll(() => {
      resizeWindow(1024, 768)
    })

    it('redirects to recordAudit page if item is clicked', async () => {
      const TIME_STAMP = '1562912635549'
      const declarationId = 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8'

      const { component: testComponent, router } = await createTestComponent(
        <InProgress
          selectorId={SELECTOR_ID.fieldAgentDrafts}
          queryData={{
            inProgressData: {
              totalItems: 1,
              results: [
                {
                  id: declarationId,
                  type: EventType.Birth,
                  registration: {
                    trackingId: 'BQ2IDOP',
                    modifiedAt: TIME_STAMP
                  },
                  childName: [
                    {
                      use: 'en',
                      firstNames: 'Anik',
                      familyName: 'Hoque'
                    }
                  ]
                } as GQLBirthEventSearchSet
              ]
            },
            notificationData: {}
          }}
          paginationId={{
            fieldAgentId: 1,
            healthSystemId: 1
          }}
          pageSize={10}
          onPageChange={(_pageId: number) => {}}
        />,
        { store }
      )

      testComponent.find('#name_0').hostNodes().simulate('click')

      testComponent.update()

      expect(router.state.location.pathname).toContain(
        '/record-audit/inProgressTab/e302f7c5-ad87-4117-91c1-35eaf2ea7be8'
      )
    })
  })
})

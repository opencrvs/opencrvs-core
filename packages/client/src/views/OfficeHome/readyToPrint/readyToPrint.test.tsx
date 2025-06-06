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
  storeDeclaration
} from '@client/declarations'
import { DownloadAction } from '@client/forms'
import { EventType } from '@client/utils/gateway'
import { queries } from '@client/profile/queries'
import { storage } from '@client/storage'
import { createStore } from '@client/store'
import {
  createTestComponent,
  mockUserResponse,
  REGISTRAR_DEFAULT_SCOPES,
  resizeWindow,
  setScopes,
  TestComponentWithRouteMock
} from '@client/tests/util'
import { waitForElement } from '@client/tests/wait-for-element'
import { createClient } from '@client/utils/apolloClient'
import { OfficeHome } from '@client/views/OfficeHome/OfficeHome'
import { Workqueue } from '@opencrvs/components/lib/Workqueue'
import { merge } from 'lodash'
import * as React from 'react'
import { ReadyToPrint } from './ReadyToPrint'
import type {
  GQLBirthEventSearchSet,
  GQLDeathEventSearchSet
} from '@client/utils/gateway-deprecated-do-not-use'
import { formattedDuration } from '@client/utils/date-formatting'
import { vi } from 'vitest'
import { formatUrl } from '@client/navigation'
import { REGISTRAR_HOME_TAB } from '@client/navigation/routes'

const mockFetchUserDetails = vi.fn()
const mockListSyncController = vi.fn()

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
      role: {
        _id: '778464c0-08f8-4fb7-8a37-b86d1efc462a',
        labels: [
          {
            lang: 'en',
            label: 'DISTRICT_REGISTRAR'
          }
        ]
      }
    }
  }
}

const mockUserData = {
  id: '956281c9-1f47-4c26-948a-970dd23c4094',
  type: EventType.Birth,
  registration: {
    status: 'REGISTERED',
    contactNumber: '01622688231',
    trackingId: 'BW0UTHR',
    registrationNumber: '20190203323443BW0UTHR',
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
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const userData: any = []
for (let i = 0; i < 14; i++) {
  userData.push(mockUserData)
}
merge(mockUserResponse, nameObj)
mockFetchUserDetails.mockReturnValue(mockUserResponse)
queries.fetchUserDetails = mockFetchUserDetails

const mockPrintTabData = {
  totalItems: 2,
  results: [
    {
      id: '956281c9-1f47-4c26-948a-970dd23c4094',
      type: EventType.Death,
      registration: {
        status: 'REGISTERED',
        contactNumber: undefined,
        trackingId: 'DG6PECX',
        registrationNumber: '20196816020000113',
        eventLocationId: undefined,
        registeredLocationId: 'd8cfd240-4b5a-4557-9df7-b1591a11d843',
        duplicates: [null],
        createdAt: '1574696143372',
        modifiedAt: undefined
      },
      operationHistories: [
        {
          operationType: 'REGISTERED',
          operatedOn: '2019-10-20T11:03:20.660Z',
          operatorRole: 'LOCAL_REGISTRAR',
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
    } as GQLDeathEventSearchSet,
    {
      id: 'bc09200d-0160-43b4-9e2b-5b9e90424e95',
      type: EventType.Death,
      registration: {
        status: 'REGISTERED',
        trackingId: 'DW0UTHR',
        registrationNumber: '2019333494B8I0NEB9',
        eventLocationId: undefined,
        contactNumber: '01622688231',
        duplicates: ['308c35b4-04f8-4664-83f5-9790e790cd33'],
        registeredLocationId: '308c35b4-04f8-4664-83f5-9790e790cde1',
        createdAt: '2007-01-01',
        modifiedAt: '2007-01-01'
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

storage.getItem = vi.fn()
storage.setItem = vi.fn()

describe('RegistrarHome ready to print tab related tests', () => {
  const { store } = createStore()
  const client = createClient(store)

  beforeAll(async () => {
    setScopes(REGISTRAR_DEFAULT_SCOPES, store)
  })

  it('renders all items returned from graphql query in ready for print', async () => {
    const TIME_STAMP = '1544188309380'
    Date.now = vi.fn(() => 1554055200000)

    const birthEventRegisteredDate = '2019-10-20T11:03:20.660Z'
    const birthEventSearchSet: GQLBirthEventSearchSet = {
      id: '956281c9-1f47-4c26-948a-970dd23c4094',
      type: EventType.Birth,
      registration: {
        status: 'REGISTERED',
        contactNumber: '01622688231',
        trackingId: 'BW0UTHR',
        registrationNumber: '2019333494BBONT7U7',
        eventLocationId: undefined,
        registeredLocationId: '308c35b4-04f8-4664-83f5-9790e790cde1',
        duplicates: [null],
        createdAt: TIME_STAMP,
        modifiedAt: TIME_STAMP
      },
      operationHistories: [
        {
          operationType: 'REGISTERED',
          operatedOn: birthEventRegisteredDate,
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
    }

    const deathEventSearchSet: GQLDeathEventSearchSet = {
      id: 'bc09200d-0160-43b4-9e2b-5b9e90424e95',
      type: EventType.Death,
      registration: {
        status: 'REGISTERED',
        trackingId: 'DW0UTHR',
        registrationNumber: '2019333494B8I0NEB9',
        eventLocationId: undefined,
        contactNumber: '01622688231',
        duplicates: ['308c35b4-04f8-4664-83f5-9790e790cd33'],
        registeredLocationId: '308c35b4-04f8-4664-83f5-9790e790cde1',
        createdAt: TIME_STAMP,
        modifiedAt: undefined
      },
      dateOfDeath: '2007-01-01',
      deceasedName: [
        {
          firstNames: 'Zayed',
          familyName: 'Khan',
          use: 'en'
        },
        {
          firstNames: 'ইলিয়াস',
          familyName: 'খান',
          use: 'bn'
        }
      ]
    }

    const { component: testComponent } = await createTestComponent(
      // @ts-ignore
      <ReadyToPrint
        queryData={{
          data: {
            totalItems: 2,
            results: [birthEventSearchSet, deathEventSearchSet]
          }
        }}
      />,
      { store }
    )

    const element = await waitForElement(testComponent, Workqueue)
    const data = element.prop('content')
    const EXPECTED_DATE_OF_DECLARATION = formattedDuration(
      new Date(birthEventRegisteredDate)
    )

    expect(data.length).toBe(2)
    expect(data[0].id).toBe('956281c9-1f47-4c26-948a-970dd23c4094')
    expect(data[0].registered).toBe(EXPECTED_DATE_OF_DECLARATION)
    expect(data[0].trackingId).toBe('BW0UTHR')
    expect(data[0].event).toBe('Birth')
    expect(data[0].actions).toBeDefined()
  })

  it('returns an empty array incase of invalid graphql query response', async () => {
    Date.now = vi.fn(() => 1554055200000)

    const { component: testComponent } = await createTestComponent(
      // @ts-ignore
      <ReadyToPrint
        queryData={{
          data: { totalItems: 0, results: [] }
        }}
      />,
      { store }
    )

    testComponent.update()
    const data = testComponent.find(Workqueue).prop('content')
    expect(data.length).toBe(0)
  })

  it('should show pagination bar if items are more than 11 in ready for print tab', async () => {
    Date.now = vi.fn(() => 1554055200000)

    const { component: testComponent } = await createTestComponent(
      <ReadyToPrint
        queryData={{
          data: { totalItems: 24, results: [] }
        }}
        paginationId={1}
        pageSize={10}
        onPageChange={() => {}}
        loading={false}
        error={false}
      />,
      { store }
    )

    const element = await waitForElement(testComponent, '#pagination_container')

    expect(element.hostNodes()).toHaveLength(1)

    testComponent
      .find('#pagination button')
      .last()
      .hostNodes()
      .simulate('click')

    expect(testComponent.exists('#page-number-2')).toBeTruthy()
  })

  describe('When a row is clicked', () => {
    it('renders expanded area for ready to print', async () => {
      const { component: testComponent, router } = await createTestComponent(
        // @ts-ignore
        <ReadyToPrint
          queryData={{
            data: mockPrintTabData
          }}
        />,
        { store }
      )

      // wait for mocked data to load mockedProvider
      // after sorting (by default name) row's order will be changed
      await waitForElement(testComponent, '#name_0')

      testComponent.update()
      testComponent.find('#name_0').hostNodes().simulate('click')

      await waitForElement(testComponent, '#name_0')
      testComponent.update()

      expect(router.state.location.pathname).toContain(
        '/record-audit/printTab/956281c9-1f47-4c26-948a-970dd23c4094'
      )
    })
  })

  describe('handles download status', () => {
    let testComponent: TestComponentWithRouteMock

    beforeEach(async () => {
      Date.now = vi.fn(() => 1554055200000)
      mockListSyncController
        .mockReturnValueOnce({
          data: {
            inProgressTab: { totalItems: 0, results: [] },
            notificationTab: { totalItems: 0, results: [] },
            reviewTab: { totalItems: 0, results: [] },
            rejectTab: { totalItems: 0, results: [] },
            approvalTab: { totalItems: 0, results: [] },
            printTab: mockPrintTabData,
            externalValidationTab: { totalItems: 0, results: [] }
          }
        })
        .mockReturnValueOnce({
          data: {
            fetchDeathRegistration: {
              _fhirIDMap: {
                composition: '956281c9-1f47-4c26-948a-970dd23c4094'
              },
              id: '956281c9-1f47-4c26-948a-970dd23c4094',
              deceased: {
                id: 'a6cce2e1-10df-42d0-bbc9-8e037b0bf14e',
                name: [
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
                ],
                birthDate: '1988-06-16',
                gender: 'male',
                maritalStatus: 'MARRIED',
                nationality: ['BGD'],
                identifier: [
                  {
                    id: '1020617910288',
                    type: 'NATIONAL_ID',
                    otherType: null
                  }
                ],
                deceased: {
                  deathDate: '2019-01-18'
                },
                address: [
                  {
                    type: 'PRIMARY_ADDRESS',
                    line: [
                      '40 Ward',
                      '',
                      'Bahadur street',
                      'f4d236c5-6328-4e8e-a45b-e307720b7cdf',
                      '',
                      '2612765c-f5a7-4291-9191-7625dd76fa82'
                    ],
                    district: '18dd420e-daec-4d35-9a44-fb58b5185923',
                    state: 'e93b10bc-1318-4dcb-b8b6-35c7532a0a90',
                    city: null,
                    postalCode: '1024',
                    country: 'BGD'
                  },
                  {
                    type: 'SECONDARY_ADDRESS',
                    line: [
                      '40',
                      '',
                      'My street',
                      'f4d236c5-6328-4e8e-a45b-e307720b7cdf',
                      '',
                      '2612765c-f5a7-4291-9191-7625dd76fa82'
                    ],
                    district: '18dd420e-daec-4d35-9a44-fb58b5185923',
                    state: 'e93b10bc-1318-4dcb-b8b6-35c7532a0a90',
                    city: null,
                    postalCode: '1024',
                    country: 'BGD'
                  }
                ]
              },
              informant: {
                id: 'c7e17721-bccf-4dfb-8f85-d6311d1da1bc',
                relationship: 'OTHER',
                otherRelationship: 'Friend',
                individual: {
                  id: '7ac8d0a6-a391-42f9-add4-dec27279474d',
                  identifier: [
                    {
                      id: '1020607917288',
                      type: 'NATIONAL_ID',
                      otherType: null
                    }
                  ],
                  name: [
                    {
                      use: 'bn',
                      firstNames: 'জামাল উদ্দিন খান',
                      familyName: 'খান'
                    },
                    {
                      use: 'en',
                      firstNames: 'Jamal Uddin Khan',
                      familyName: 'Khan'
                    }
                  ],
                  nationality: ['BGD'],
                  birthDate: '1956-10-17',
                  telecom: null,
                  address: [
                    {
                      type: 'SECONDARY_ADDRESS',
                      line: [
                        '48',
                        '',
                        'My street',
                        'f4d236c5-6328-4e8e-a45b-e307720b7cdf',
                        '',
                        '2612765c-f5a7-4291-9191-7625dd76fa82'
                      ],
                      district: '18dd420e-daec-4d35-9a44-fb58b5185923',
                      state: 'e93b10bc-1318-4dcb-b8b6-35c7532a0a90',
                      city: null,
                      postalCode: '1024',
                      country: 'BGD'
                    },
                    {
                      type: 'PRIMARY_ADDRESS',
                      line: [
                        '40 Ward',
                        '',
                        'Bahadur street',
                        'f4d236c5-6328-4e8e-a45b-e307720b7cdf',
                        '',
                        '2612765c-f5a7-4291-9191-7625dd76fa82'
                      ],
                      district: '18dd420e-daec-4d35-9a44-fb58b5185923',
                      state: 'e93b10bc-1318-4dcb-b8b6-35c7532a0a90',
                      city: null,
                      postalCode: '1024',
                      country: 'BGD'
                    }
                  ]
                }
              },
              father: {
                id: '7ac8d0a6-a391-42f9-add4-dec27279589',
                name: [
                  {
                    use: 'bn',
                    firstNames: 'মোক্তার',
                    familyName: 'আলী'
                  },
                  {
                    use: 'en',
                    firstNames: 'Moktar',
                    familyName: 'Ali'
                  }
                ]
              },
              mother: {
                id: '7ac8d0a6-a391-42f9-add4-decds589',
                name: [
                  {
                    use: 'bn',
                    firstNames: 'মরিউম',
                    familyName: 'আলী'
                  },
                  {
                    use: 'en',
                    firstNames: 'Morium',
                    familyName: 'Ali'
                  }
                ]
              },
              spouse: {
                id: '7ac8d0a6-a391-42f9-add4-sssdec27279589',
                name: [
                  {
                    use: 'bn',
                    firstNames: 'রেহানা',
                    familyName: 'আলী'
                  },
                  {
                    use: 'en',
                    firstNames: 'Rehana',
                    familyName: 'Ali'
                  }
                ]
              },
              registration: {
                id: 'ba1cb210-b98f-46e1-a185-4c8df2971064',
                contact: 'OTHER',
                contactRelationship: 'Colleague',
                contactPhoneNumber: '+8801678945638',
                attachments: null,
                status: [
                  {
                    comments: null,
                    type: 'REGISTERED',
                    location: {
                      name: 'Alokbali',
                      alias: ['আলো্কবালী']
                    },
                    office: {
                      name: 'Alokbali Union Parishad',
                      alias: ['আলোকবালী  ইউনিয়ন পরিষদ'],
                      address: {
                        district: 'Narsingdi',
                        state: 'Dhaka'
                      },
                      partOf: 'Location/8cbc862a-b817-4c29-a490-4a8767ff023c'
                    },
                    timestamp: null
                  },
                  {
                    comments: null,
                    type: 'DECLARED',
                    location: {
                      name: 'Alokbali',
                      alias: ['আলো্কবালী']
                    },
                    office: {
                      name: 'Alokbali Union Parishad',
                      alias: ['আলোকবালী  ইউনিয়ন পরিষদ'],
                      address: {
                        district: 'Narsingdi',
                        state: 'Dhaka'
                      },
                      partOf: 'Location/8cbc862a-b817-4c29-a490-4a8767ff023c'
                    },
                    timestamp: null
                  }
                ],
                type: 'DEATH',
                trackingId: 'DG6PECX',
                registrationNumber: '20196816020000113'
              },
              eventLocation: {
                id: '7a503721-a258-49ef-9fb9-aa77c970d19b',
                type: 'PRIVATE_HOME',
                address: {
                  type: null,
                  line: [
                    '40',
                    '',
                    'My street',
                    'f4d236c5-6328-4e8e-a45b-e307720b7cdf',
                    '',
                    '2612765c-f5a7-4291-9191-7625dd76fa82'
                  ],
                  district: '18dd420e-daec-4d35-9a44-fb58b5185923',
                  state: 'e93b10bc-1318-4dcb-b8b6-35c7532a0a90',
                  city: null,
                  postalCode: '1024',
                  country: 'BGD'
                }
              },
              mannerOfDeath: 'HOMICIDE',
              causeOfDeathMethod: null,
              causeOfDeath: 'Chronic Obstructive Pulmonary Disease'
            }
          }
        })
      client.query = mockListSyncController

      testComponent = await createTestComponent(<OfficeHome />, {
        store,
        apolloClient: client,
        path: REGISTRAR_HOME_TAB,
        initialEntries: [formatUrl(REGISTRAR_HOME_TAB, { tabId: 'print' })]
      })
    })

    it('downloads declaration after clicking download button', async () => {
      testComponent.component.update()
      const downloadButton = await waitForElement(
        testComponent.component,
        '#ListItemAction-0-icon'
      )

      downloadButton.hostNodes().simulate('click')

      testComponent.component.update()

      expect(
        testComponent.component.find('#assignment').hostNodes()
      ).toHaveLength(1)

      testComponent.component.find('#assign').hostNodes().simulate('click')

      const action = await waitForElement(
        testComponent.component,
        '#ListItemAction-0-Print'
      )

      action.hostNodes().simulate('click')

      await new Promise((resolve) => {
        setTimeout(resolve, 100)
      })

      testComponent.component.update()
      expect(testComponent.router.state.location.pathname).toBe(
        '/cert/collector/956281c9-1f47-4c26-948a-970dd23c4094/death/certCollector'
      )
    })

    it('shows error when download is failed', async () => {
      const downloadedDeclaration = makeDeclarationReadyToDownload(
        EventType.Death,
        'bc09200d-0160-43b4-9e2b-5b9e90424e95',
        DownloadAction.LOAD_CERTIFICATE_DECLARATION
      )
      downloadedDeclaration.downloadStatus = DOWNLOAD_STATUS.FAILED
      store.dispatch(storeDeclaration(downloadedDeclaration))

      testComponent.component.update()

      const errorIcon = await waitForElement(
        testComponent.component,
        '#ListItemAction-1-icon-failed'
      )
      expect(errorIcon.hostNodes()).toHaveLength(1)
    })
  })
})

describe('Tablet tests', () => {
  const { store } = createStore()

  beforeAll(async () => {
    setScopes(REGISTRAR_DEFAULT_SCOPES, store)
    resizeWindow(800, 1280)
  })

  afterEach(() => {
    resizeWindow(1024, 768)
  })

  it('redirects to recordAudit page if item is clicked', async () => {
    Date.now = vi.fn(() => 1554055200000)

    const { component: testComponent, router } = await createTestComponent(
      // @ts-ignore
      <ReadyToPrint
        queryData={{
          data: mockPrintTabData
        }}
      />,
      { store }
    )

    testComponent.update()
    const element = await waitForElement(testComponent, '#name_0')
    element.hostNodes().simulate('click')

    await new Promise((resolve) => {
      setTimeout(resolve, 100)
    })
    testComponent.update()

    expect(router.state.location.pathname).toContain(
      '/record-audit/printTab/956281c9-1f47-4c26-948a-970dd23c4094'
    )
  })
})

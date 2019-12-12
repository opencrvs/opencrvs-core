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
import { checkAuth } from '@client/profile/profileActions'
import { AppStore, createStore } from '@client/store'
import {
  createTestComponent,
  mockUserResponse,
  resizeWindow
} from '@client/tests/util'
import { waitForElement } from '@client/tests/wait-for-element'
import { FETCH_REGISTRATION_BY_COMPOSITION } from '@client/views/RegistrationHome/queries'
import { GridTable } from '@opencrvs/components/lib/interface'
import { readFileSync } from 'fs'
import * as jwt from 'jsonwebtoken'
import { merge } from 'lodash'
import moment from 'moment'
import * as React from 'react'
import { ApprovalTab } from './approvalTab'
import {
  GQLBirthEventSearchSet,
  GQLDeathEventSearchSet
} from '@opencrvs/gateway/src/graphql/schema'

const validateScopeToken = jwt.sign(
  { scope: ['validate'] },
  readFileSync('../auth/test/cert.key'),
  {
    algorithm: 'RS256',
    issuer: 'opencrvs:auth-service',
    audience: 'opencrvs:gateway-user'
  }
)

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

const mockUserData = {
  id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8',
  type: 'Birth',
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
  // PR: https://github.com/jembi/OpenCRVS/pull/836/commits/6302fa8f015fe313cbce6197980f1300bf4eba32
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
const userData: any = []
for (let i = 0; i < 14; i++) {
  userData.push(mockUserData)
}
merge(mockUserResponse, nameObj)

const getItem = window.localStorage.getItem as jest.Mock

describe('RegistrationHome sent for approval tab related tests', () => {
  let store: AppStore
  beforeEach(async () => {
    store = createStore().store
    getItem.mockReturnValue(validateScopeToken)
    await store.dispatch(checkAuth({ '?token': validateScopeToken }))
  })

  it('renders all items returned from graphql query in sent for approval', async () => {
    const TIME_STAMP = '1544188309380'
    Date.now = jest.fn(() => 1554055200000)

    const testComponent = await createTestComponent(
      // @ts-ignore
      <ApprovalTab
        registrarLocationId={'2a83cf14-b959-47f4-8097-f75a75d1867f'}
        queryData={{
          data: {
            totalItems: 2,
            results: [
              {
                id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8',
                type: 'Birth',
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
                type: 'Death',
                registration: {
                  status: 'VALIDATED',
                  trackingId: 'DW0UTHR',
                  registrationNumber: undefined,
                  contactNumber: undefined,
                  eventLocationId: undefined,
                  duplicates: ['308c35b4-04f8-4664-83f5-9790e790cd33'],
                  registeredLocationId: '308c35b4-04f8-4664-83f5-9790e790cde1',
                  createdAt: TIME_STAMP,
                  modifiedAt: undefined
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
      />,
      store
    )

    testComponent.component.update()
    const data = testComponent.component.find(GridTable).prop('content')
    const EXPECTED_DATE_OF_APPLICATION = moment(
      moment(TIME_STAMP, 'x').format('YYYY-MM-DD HH:mm:ss'),
      'YYYY-MM-DD HH:mm:ss'
    ).fromNow()
    expect(data.length).toBe(2)
    expect(data[0].id).toBe('e302f7c5-ad87-4117-91c1-35eaf2ea7be8')
    expect(data[0].eventTimeElapsed).toBe('8 years ago')
    expect(data[0].dateOfApproval).toBe(EXPECTED_DATE_OF_APPLICATION)
    expect(data[0].trackingId).toBe('BW0UTHR')
    expect(data[0].event).toBe('Birth')
    expect(data[0].actions).toBeUndefined()
  })

  it('returns an empty array incase of invalid graphql query response', async () => {
    Date.now = jest.fn(() => 1554055200000)

    const testComponent = await createTestComponent(
      // @ts-ignore
      <ApprovalTab
        queryData={{
          data: {
            totalItems: 2,
            results: []
          }
        }}
      />,
      store
    )

    const data = (await waitForElement(
      testComponent.component,
      GridTable
    )).prop('content')
    expect(data.length).toBe(0)
  })

  it('should show pagination bar if items more than 11 in Approval Tab', async () => {
    Date.now = jest.fn(() => 1554055200000)

    const testComponent = await createTestComponent(
      // @ts-ignore
      <ApprovalTab
        registrarLocationId={'2a83cf14-b959-47f4-8097-f75a75d1867f'}
        queryData={{
          data: {
            totalItems: 14,
            results: []
          }
        }}
      />,
      store
    )

    expect(
      testComponent.component.find('#pagination').hostNodes()
    ).toHaveLength(1)

    testComponent.component
      .find('#pagination button')
      .last()
      .hostNodes()
      .simulate('click')
  })

  it('renders expanded area for validated status', async () => {
    Date.now = jest.fn(() => 1554055200000)
    const graphqlMock = [
      {
        request: {
          query: FETCH_REGISTRATION_BY_COMPOSITION,
          variables: {
            id: 'bc09200d-0160-43b4-9e2b-5b9e90424e95'
          }
        },
        result: {
          data: {
            fetchRegistration: {
              id: 'bc09200d-0160-43b4-9e2b-5b9e90424e95',
              registration: {
                id: '345678',
                type: 'DEATH',
                certificates: null,
                status: [
                  {
                    id:
                      '17e9b24-b00f-4a0f-a5a4-9c84c6e64e98/_history/86c3044a-329f-418',
                    timestamp: '2019-04-03T07:08:24.936Z',
                    user: {
                      id: '153f8364-96b3-4b90-8527-bf2ec4a367bd',
                      name: [
                        {
                          use: 'en',
                          firstNames: 'Mohammad',
                          familyName: 'Ashraful'
                        },
                        {
                          use: 'bn',
                          firstNames: '',
                          familyName: ''
                        }
                      ],
                      role: 'LOCAL_REGISTRAR'
                    },
                    location: {
                      id: '123',
                      name: 'Kaliganj Union Sub Center',
                      alias: ['']
                    },
                    office: {
                      id: '123',
                      name: 'Kaliganj Union Sub Center',
                      alias: [''],
                      address: {
                        district: '7876',
                        state: 'iuyiuy'
                      }
                    },
                    type: 'VALIDATED',
                    comments: null
                  }
                ],
                contact: 'MOTHER',
                contactPhoneNumber: null
              },
              child: null,
              deceased: {
                name: [
                  {
                    use: 'en',
                    firstNames: 'Mushraful',
                    familyName: 'Hoque'
                  }
                ],
                deceased: {
                  deathDate: '01-01-1984'
                }
              },
              informant: {
                individual: {
                  telecom: [
                    {
                      use: null,
                      system: 'phone',
                      value: '01686972106'
                    }
                  ]
                }
              }
            }
          }
        }
      }
    ]

    const testComponent = await createTestComponent(
      // @ts-ignore
      <ApprovalTab
        queryData={{
          data: {
            totalItems: 2,
            results: [
              {
                id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8',
                type: 'Birth',
                registration: {
                  status: 'VALIDATED',
                  contactNumber: '01622688231',
                  trackingId: 'BW0UTHR',
                  eventLocationId: undefined,
                  registrationNumber: undefined,
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
                type: 'Death',
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
      />,
      store,
      graphqlMock
    )

    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 200)
    })
    testComponent.component.update()
    const instance = testComponent.component.find(GridTable).instance() as any

    instance.toggleExpanded('bc09200d-0160-43b4-9e2b-5b9e90424e95')
    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 100)
    })
    testComponent.component.update()
    expect(
      testComponent.component.find('#VALIDATED-0').hostNodes().length
    ).toBe(1)
  })
})

describe('Tablet tests', () => {
  const { store } = createStore()

  beforeAll(async () => {
    getItem.mockReturnValue(validateScopeToken)
    await store.dispatch(checkAuth({ '?token': validateScopeToken }))
    resizeWindow(800, 1280)
  })

  afterEach(() => {
    resizeWindow(1024, 768)
  })

  it('redirects to detail page if item is clicked', async () => {
    jest.clearAllMocks()
    const TIME_STAMP = '1544188309380'
    Date.now = jest.fn(() => 1554055200000)

    const testComponent = await createTestComponent(
      // @ts-ignore
      <ApprovalTab
        queryData={{
          data: {
            totalItems: 2,
            results: [
              {
                id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8',
                type: 'Birth',
                registration: {
                  status: 'VALIDATED',
                  contactNumber: '01622688231',
                  trackingId: 'BW0UTHR',
                  eventLocationId: undefined,
                  registrationNumber: undefined,
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
                type: 'Death',
                registration: {
                  status: 'VALIDATED',
                  trackingId: 'DW0UTHR',
                  registrationNumber: undefined,
                  eventLocationId: undefined,
                  contactNumber: undefined,
                  duplicates: ['308c35b4-04f8-4664-83f5-9790e790cd33'],
                  registeredLocationId: '308c35b4-04f8-4664-83f5-9790e790cde1',
                  createdAt: TIME_STAMP,
                  modifiedAt: undefined
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
      />,
      store
    )

    testComponent.component.update()
    const element = await waitForElement(testComponent.component, '#row_0')
    element.hostNodes().simulate('click')

    await new Promise(resolve => {
      setTimeout(resolve, 100)
    })
    testComponent.component.update()

    expect(window.location.href).toContain(
      '/details/e302f7c5-ad87-4117-91c1-35eaf2ea7be8'
    )
  })
})

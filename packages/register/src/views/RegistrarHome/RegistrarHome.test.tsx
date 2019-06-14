import * as React from 'react'
import { createTestComponent } from 'src/tests/util'
import { queries } from 'src/profile/queries'
import { merge } from 'lodash'
import { v4 as uuid } from 'uuid'
import { mockUserResponse } from 'src/tests/util'
import { storage } from 'src/storage'
import { createStore } from 'src/store'
import { RegistrarHome, EVENT_STATUS } from './RegistrarHome'
import { Spinner, GridTable } from '@opencrvs/components/lib/interface'
import {
  COUNT_REGISTRATION_QUERY,
  SEARCH_EVENTS,
  FETCH_REGISTRATION_BY_COMPOSITION
} from './queries'
import { checkAuth } from 'src/profile/profileActions'
import { storeApplication, createReviewApplication } from 'src/applications'
import { Event } from 'src/forms'
import * as moment from 'moment'

const registerScopeToken =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWdpc3RlciIsImNlcnRpZnkiLCJkZW1vIl0sImlhdCI6MTU0MjY4ODc3MCwiZXhwIjoxNTQzMjkzNTcwLCJhdWQiOlsib3BlbmNydnM6YXV0aC11c2VyIiwib3BlbmNydnM6dXNlci1tZ250LXVzZXIiLCJvcGVuY3J2czpoZWFydGgtdXNlciIsIm9wZW5jcnZzOmdhdGV3YXktdXNlciIsIm9wZW5jcnZzOm5vdGlmaWNhdGlvbi11c2VyIiwib3BlbmNydnM6d29ya2Zsb3ctdXNlciJdLCJpc3MiOiJvcGVuY3J2czphdXRoLXNlcnZpY2UiLCJzdWIiOiI1YmVhYWY2MDg0ZmRjNDc5MTA3ZjI5OGMifQ.ElQd99Lu7WFX3L_0RecU_Q7-WZClztdNpepo7deNHqzro-Cog4WLN7RW3ZS5PuQtMaiOq1tCb-Fm3h7t4l4KDJgvC11OyT7jD6R2s2OleoRVm3Mcw5LPYuUVHt64lR_moex0x_bCqS72iZmjrjS-fNlnWK5zHfYAjF2PWKceMTGk6wnI9N49f6VwwkinJcwJi6ylsjVkylNbutQZO0qTc7HRP-cBfAzNcKD37FqTRNpVSvHdzQSNcs7oiv3kInDN5aNa2536XSd3H-RiKR9hm9eID9bSIJgFIGzkWRd5jnoYxT70G0t03_mTVnDnqPXDtyI-lmerx24Ost0rQLUNIg'
const getItem = window.localStorage.getItem as jest.Mock

const mockFetchUserDetails = jest.fn()

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

const demoUserData = {
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
      familyName: 'Khan'
    },
    {
      firstNames: 'ইলিয়াস',
      familyName: 'খান'
    }
  ],
  dateOfDeath: null,
  deceasedName: null
}

const userData: any = []
for (let i = 0; i < 14; i++) {
  userData.push(demoUserData)
}
merge(mockUserResponse, nameObj)
mockFetchUserDetails.mockReturnValue(mockUserResponse)
queries.fetchUserDetails = mockFetchUserDetails

storage.getItem = jest.fn()
storage.setItem = jest.fn()

describe('RegistrarHome tests', async () => {
  const { store } = createStore()

  beforeAll(() => {
    getItem.mockReturnValue(registerScopeToken)
    store.dispatch(checkAuth({ '?token': registerScopeToken }))
  })

  it('sets loading state while waiting for data', () => {
    const testComponent = createTestComponent(
      // @ts-ignore
      <RegistrarHome
        match={{
          params: {
            tabId: 'review'
          },
          isExact: true,
          path: '',
          url: ''
        }}
      />,
      store
    )

    // @ts-ignore
    expect(testComponent.component.containsMatchingElement(Spinner)).toBe(true)

    testComponent.component.unmount()
  })
  it('renders error text when an error occurs', async () => {
    const graphqlMock = [
      {
        request: {
          query: COUNT_REGISTRATION_QUERY,
          variables: {
            locationIds: ['123456789']
          }
        },
        error: new Error('boom')
      }
    ]

    const testComponent = createTestComponent(
      // @ts-ignore
      <RegistrarHome
        match={{
          params: {
            tabId: 'review'
          },
          isExact: true,
          path: '',
          url: ''
        }}
      />,
      store,
      graphqlMock
    )

    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 100)
    })

    testComponent.component.update()

    expect(
      testComponent.component
        .find('#search-result-error-text-review')
        .children()
        .text()
    ).toBe('An error occurred while searching')

    testComponent.component.unmount()
  })

  it('renders page with four tabs', async () => {
    const graphqlMock = [
      {
        request: {
          query: COUNT_REGISTRATION_QUERY,
          variables: {
            locationIds: ['123456789']
          }
        },
        result: {
          data: {
            countEventRegistrations: {
              declared: 10,
              rejected: 5,
              registered: 0
            }
          }
        }
      }
    ]

    const testComponent = createTestComponent(
      // @ts-ignore
      <RegistrarHome
        match={{
          params: {
            tabId: 'review'
          },
          isExact: true,
          path: '',
          url: ''
        }}
        draftCount={1}
      />,
      store,
      graphqlMock
    )

    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 100)
    })

    testComponent.component.update()
    const app = testComponent.component
    expect(
      app
        .find('#tab_review')
        .hostNodes()
        .text()
    ).toContain('Ready for review (10)')
    app
      .find('#tab_progress')
      .hostNodes()
      .simulate('click')
    app
      .find('#tab_review')
      .hostNodes()
      .simulate('click')
    app
      .find('#tab_updates')
      .hostNodes()
      .simulate('click')
    app
      .find('#tab_print')
      .hostNodes()
      .simulate('click')
  })

  it('check drafts count', async () => {
    jest.clearAllMocks()
    const draft = createReviewApplication(uuid(), {}, Event.BIRTH)
    store.dispatch(storeApplication(draft))

    const graphqlMock = [
      {
        request: {
          query: COUNT_REGISTRATION_QUERY,
          variables: {
            locationIds: ['123456789']
          }
        },
        result: {
          data: {
            countEventRegistrations: {
              declared: 10,
              rejected: 5,
              registered: 0
            }
          }
        }
      }
    ]

    const testComponent = createTestComponent(
      // @ts-ignore
      <RegistrarHome
        match={{
          params: {
            tabId: 'progress'
          },
          isExact: true,
          path: '',
          url: ''
        }}
      />,
      store,
      graphqlMock
    )

    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 100)
    })

    testComponent.component.update()
    const app = testComponent.component
    expect(
      app
        .find('#tab_progress')
        .hostNodes()
        .text()
    ).toContain('In progress (1)')
  })
  it('check rejected applications count', async () => {
    const graphqlMock = [
      {
        request: {
          query: COUNT_REGISTRATION_QUERY,
          variables: {
            locationIds: ['123456789']
          }
        },
        result: {
          data: {
            countEventRegistrations: {
              declared: 10,
              rejected: 5,
              registered: 0
            }
          }
        }
      }
    ]

    const testComponent = createTestComponent(
      // @ts-ignore
      <RegistrarHome
        match={{
          params: {
            tabId: 'updates'
          },
          isExact: true,
          path: '',
          url: ''
        }}
        draftCount={1}
      />,
      store,
      graphqlMock
    )

    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 100)
    })

    testComponent.component.update()
    const app = testComponent.component
    expect(
      app
        .find('#tab_updates')
        .hostNodes()
        .text()
    ).toContain('Sent for updates (5)')
  })

  it('renders all items returned from graphql query in reivew tab', async () => {
    Date.now = jest.fn(() => 1554055200000)
    const graphqlMock = [
      {
        request: {
          query: SEARCH_EVENTS,
          variables: {
            status: EVENT_STATUS.DECLARED,
            locationIds: ['123456789'],
            count: 10,
            skip: 0
          }
        },
        result: {
          data: {
            searchEvents: {
              totalItems: 2,
              results: [
                {
                  id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8',
                  type: 'Birth',
                  registration: {
                    status: 'DECLARED',
                    contactNumber: '01622688231',
                    trackingId: 'BW0UTHR',
                    registrationNumber: null,
                    registeredLocationId:
                      '308c35b4-04f8-4664-83f5-9790e790cde1',
                    duplicates: null,
                    createdAt: '2018-05-23T14:44:58+02:00',
                    modifiedAt: '2018-05-23T14:44:58+02:00'
                  },
                  dateOfBirth: '2010-10-10',
                  childName: [
                    {
                      firstNames: 'Iliyas',
                      familyName: 'Khan'
                    },
                    {
                      firstNames: 'ইলিয়াস',
                      familyName: 'খান'
                    }
                  ],
                  dateOfDeath: null,
                  deceasedName: null
                },
                {
                  id: 'bc09200d-0160-43b4-9e2b-5b9e90424e95',
                  type: 'Death',
                  registration: {
                    status: 'DECLARED',
                    trackingId: 'DW0UTHR',
                    registrationNumber: null,
                    contactNumber: null,
                    duplicates: ['308c35b4-04f8-4664-83f5-9790e790cd33'],
                    registeredLocationId:
                      '308c35b4-04f8-4664-83f5-9790e790cde1',
                    createdAt: '2007-01-01',
                    modifiedAt: '2007-01-01'
                  },
                  dateOfBirth: null,
                  childName: null,
                  dateOfDeath: '2007-01-01',
                  deceasedName: [
                    {
                      firstNames: 'Iliyas',
                      familyName: 'Khan'
                    },
                    {
                      firstNames: 'ইলিয়াস',
                      familyName: 'খান'
                    }
                  ]
                }
              ]
            }
          }
        }
      }
    ]

    const testComponent = createTestComponent(
      // @ts-ignore
      <RegistrarHome />,
      store,
      graphqlMock
    )

    getItem.mockReturnValue(registerScopeToken)
    testComponent.store.dispatch(checkAuth({ '?token': registerScopeToken }))

    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 100)
    })
    testComponent.component.update()
    const data = testComponent.component.find(GridTable).prop('content')

    expect(data.length).toBe(2)
    expect(data[0].id).toBe('e302f7c5-ad87-4117-91c1-35eaf2ea7be8')
    expect(data[0].event_time_elapsed).toBe('8 years ago')
    expect(data[0].application_time_elapsed).toBe('10 months ago')
    expect(data[0].tracking_id).toBe('BW0UTHR')
    expect(data[0].event).toBe('Birth')
    expect(data[0].actions).toBeDefined()

    testComponent.component.unmount()
  })
  it('renders all items returned from graphql query in rejected tab', async () => {
    const TIME_STAMP = '2018-12-07T13:11:49.380Z'
    const graphqlMock = [
      {
        request: {
          query: SEARCH_EVENTS,
          variables: {
            status: EVENT_STATUS.REJECTED,
            locationIds: ['123456789'],
            count: 10,
            skip: 0
          }
        },
        result: {
          data: {
            searchEvents: {
              totalItems: 2,
              results: [
                {
                  id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8',
                  type: 'Birth',
                  registration: {
                    status: 'REJECTED',
                    contactNumber: '01622688231',
                    trackingId: 'BW0UTHR',
                    registrationNumber: null,
                    registeredLocationId:
                      '308c35b4-04f8-4664-83f5-9790e790cde1',
                    duplicates: null,
                    createdAt: '2018-05-23T14:44:58+02:00',
                    modifiedAt: '2018-05-23T14:44:58+02:00'
                  },
                  dateOfBirth: '2010-10-10',
                  childName: [
                    {
                      firstNames: 'Iliyas',
                      familyName: 'Khan'
                    },
                    {
                      firstNames: 'ইলিয়াস',
                      familyName: 'খান'
                    }
                  ],
                  dateOfDeath: null,
                  deceasedName: null
                },
                {
                  id: 'bc09200d-0160-43b4-9e2b-5b9e90424e95',
                  type: 'Death',
                  registration: {
                    status: 'REJECTED',
                    trackingId: 'DW0UTHR',
                    registrationNumber: null,
                    contactNumber: '01622688231',
                    duplicates: ['308c35b4-04f8-4664-83f5-9790e790cd33'],
                    registeredLocationId:
                      '308c35b4-04f8-4664-83f5-9790e790cde1',
                    createdAt: TIME_STAMP,
                    modifiedAt: TIME_STAMP
                  },
                  dateOfBirth: null,
                  childName: null,
                  dateOfDeath: '2007-01-01',
                  deceasedName: [
                    {
                      firstNames: 'Iliyas',
                      familyName: 'Khan'
                    },
                    {
                      firstNames: 'ইলিয়াস',
                      familyName: 'খান'
                    }
                  ]
                }
              ]
            }
          }
        }
      }
    ]

    const testComponent = createTestComponent(
      // @ts-ignore
      <RegistrarHome match={{ params: { tabId: 'updates' } }} />,
      store,
      graphqlMock
    )

    getItem.mockReturnValue(registerScopeToken)
    testComponent.store.dispatch(checkAuth({ '?token': registerScopeToken }))

    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 100)
    })
    testComponent.component.update()
    const data = testComponent.component.find(GridTable).prop('content')
    const EXPECTED_DATE_OF_REJECTION = moment(
      TIME_STAMP,
      'YYYY-MM-DD'
    ).fromNow()

    expect(data.length).toBe(2)
    expect(data[1].id).toBe('bc09200d-0160-43b4-9e2b-5b9e90424e95')
    expect(data[1].contact_number).toBe('01622688231')
    expect(data[1].date_of_rejection).toBe(EXPECTED_DATE_OF_REJECTION)
    expect(data[1].event).toBe('Death')
    expect(data[1].actions).toBeDefined()

    testComponent.component.unmount()
  })
  it('renders all items returned from graphql query in inProgress tab', async () => {
    const TIME_STAMP = '2018-12-07T13:11:49.380Z'
    const drafts = [
      {
        id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8',
        event: 'birth',
        modifiedOn: TIME_STAMP,
        data: {
          child: {
            familyNameEng: 'Anik',
            familyName: 'অনিক'
          }
        }
      },
      {
        id: 'cc66d69c-7f0a-4047-9283-f066571830f1',
        event: 'death',
        modifiedOn: TIME_STAMP,
        data: {
          deceased: {
            familyNameEng: 'Anik',
            familyName: 'অনিক'
          }
        }
      }
    ]
    const testComponent = createTestComponent(
      // @ts-ignore
      <RegistrarHome match={{ params: { tabId: 'progress' } }} />,
      store
    )

    getItem.mockReturnValue(registerScopeToken)
    testComponent.store.dispatch(checkAuth({ '?token': registerScopeToken }))
    // @ts-ignore
    testComponent.store.dispatch(storeApplication(drafts))

    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 100)
    })
    testComponent.component.update()
    const data = testComponent.component.find(GridTable).prop('content')
    const EXPECTED_DATE_OF_REJECTION = moment(
      TIME_STAMP,
      'YYYY-MM-DD'
    ).fromNow()

    expect(data[1].id).toBe('e302f7c5-ad87-4117-91c1-35eaf2ea7be8')
    expect(data[1].name).toBe('Anik')
    expect(data[1].date_of_modification).toBe(EXPECTED_DATE_OF_REJECTION)
    expect(data[1].event).toBe('Birth')
    expect(data[1].actions).toBeDefined()

    testComponent.component.unmount()
  })
  it('renders all items returned from graphql query in print tab', async () => {
    const graphqlMock = [
      {
        request: {
          query: SEARCH_EVENTS,
          variables: {
            status: EVENT_STATUS.REGISTERED,
            locationIds: ['123456789'],
            count: 10,
            skip: 0
          }
        },
        result: {
          data: {
            searchEvents: {
              totalItems: 2,
              results: [
                {
                  id: '9de759b1-a5fe-4476-94bd-b8123017db3f',
                  type: 'DEATH',
                  registration: {
                    trackingId: 'D1X8PO8',
                    registrationNumber: '2019333494D1X8PO80',
                    contactPhoneNumber: null,
                    status: [
                      {
                        user: {
                          id: '99636b42-72c3-40c2-9c19-947efa728068',
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
                          id: '43ac3486-7df1-4bd9-9b5e-728054ccd6ba',
                          name: 'Moktarpur',
                          alias: ['মোক্তারপুর']
                        },
                        office: {
                          name: 'Moktarpur Union Parishad',
                          alias: ['মোক্তারপুর ইউনিয়ন পরিষদ'],
                          address: {
                            district: 'Gazipur',
                            state: 'Dhaka'
                          }
                        },
                        type: 'REGISTERED',
                        timestamp: '2019-05-17T05:49:45.658Z'
                      },
                      {
                        user: {
                          id: 'dcba7022-f0ff-4822-b5d9-cb90d0e7b8de',
                          name: [
                            {
                              use: 'en',
                              firstNames: 'Shakib',
                              familyName: 'Al Hasan'
                            },
                            {
                              use: 'bn',
                              firstNames: '',
                              familyName: ''
                            }
                          ],
                          role: 'FIELD_AGENT'
                        },
                        location: {
                          id: '43ac3486-7df1-4bd9-9b5e-728054ccd6ba',
                          name: 'Moktarpur',
                          alias: ['মোক্তারপুর']
                        },
                        office: {
                          name: 'Moktarpur Union Parishad',
                          alias: ['মোক্তারপুর ইউনিয়ন পরিষদ'],
                          address: {
                            district: 'Gazipur',
                            state: 'Dhaka'
                          }
                        },
                        type: 'DECLARED',
                        timestamp: '2019-05-17T05:49:26.898Z'
                      }
                    ]
                  },
                  createdAt: '2019-05-17T05:49:44.826Z',
                  deceased: {
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
                    deceased: {
                      deathDate: '2019-01-18'
                    }
                  },
                  informant: {
                    individual: {
                      telecom: [
                        {
                          system: 'phone',
                          value: '01712345678'
                        }
                      ]
                    }
                  }
                },
                {
                  id: 'f32d9e41-8172-4f54-b540-277951286a27',
                  type: 'DEATH',
                  registration: {
                    trackingId: 'DKMN3PQ',
                    registrationNumber: '2019333494DKMN3PQ2',
                    contactPhoneNumber: null,
                    status: [
                      {
                        user: {
                          id: '99636b42-72c3-40c2-9c19-947efa728068',
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
                          id: '43ac3486-7df1-4bd9-9b5e-728054ccd6ba',
                          name: 'Moktarpur',
                          alias: ['মোক্তারপুর']
                        },
                        office: {
                          name: 'Moktarpur Union Parishad',
                          alias: ['মোক্তারপুর ইউনিয়ন পরিষদ'],
                          address: {
                            district: 'Gazipur',
                            state: 'Dhaka'
                          }
                        },
                        type: 'REGISTERED',
                        timestamp: '2019-05-21T05:51:13.455Z'
                      },
                      {
                        user: {
                          id: 'dcba7022-f0ff-4822-b5d9-cb90d0e7b8de',
                          name: [
                            {
                              use: 'en',
                              firstNames: 'Shakib',
                              familyName: 'Al Hasan'
                            },
                            {
                              use: 'bn',
                              firstNames: '',
                              familyName: ''
                            }
                          ],
                          role: 'FIELD_AGENT'
                        },
                        location: {
                          id: '43ac3486-7df1-4bd9-9b5e-728054ccd6ba',
                          name: 'Moktarpur',
                          alias: ['মোক্তারপুর']
                        },
                        office: {
                          name: 'Moktarpur Union Parishad',
                          alias: ['মোক্তারপুর ইউনিয়ন পরিষদ'],
                          address: {
                            district: 'Gazipur',
                            state: 'Dhaka'
                          }
                        },
                        type: 'DECLARED',
                        timestamp: '2019-05-21T05:50:58.661Z'
                      }
                    ]
                  },
                  createdAt: '2019-05-21T05:51:12.949Z',
                  deceased: {
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
                    deceased: {
                      deathDate: '2019-01-18'
                    }
                  },
                  informant: {
                    individual: {
                      telecom: [
                        {
                          system: 'phone',
                          value: '01712345678'
                        }
                      ]
                    }
                  }
                }
              ]
            }
          }
        }
      }
    ]

    const testComponent = createTestComponent(
      // @ts-ignore
      <RegistrarHome match={{ params: { tabId: 'print' } }} />,
      store,
      graphqlMock
    )

    getItem.mockReturnValue(registerScopeToken)
    testComponent.store.dispatch(checkAuth({ '?token': registerScopeToken }))

    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 2000)
    })
    testComponent.component.update()
    console.log('GRIDTABLE EXISTS?', testComponent.component.exists(GridTable))
    const data = testComponent.component.find(GridTable).prop('content')

    expect(data.length).toBe(2)
    expect(data[1].id).toBe('f32d9e41-8172-4f54-b540-277951286a27')
    expect(data[1].event).toBe('Death')
    expect(data[1].actions).toBeDefined()

    testComponent.component.unmount()
  })

  it('should show pagination bar if items more than 11 in ReviewTab', async () => {
    Date.now = jest.fn(() => 1554055200000)
    const graphqlMock = [
      {
        request: {
          query: SEARCH_EVENTS,
          variables: {
            status: EVENT_STATUS.DECLARED,
            locationIds: ['123456789'],
            count: 10,
            skip: 0
          }
        },
        result: {
          data: {
            searchEvents: {
              totalItems: 14,
              results: userData
            }
          }
        }
      }
    ]

    const testComponent = createTestComponent(
      // @ts-ignore
      <RegistrarHome match={{ params: { tabId: 'review' } }} />,
      store,
      graphqlMock
    )

    getItem.mockReturnValue(registerScopeToken)
    testComponent.store.dispatch(checkAuth({ '?token': registerScopeToken }))

    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 100)
    })
    testComponent.component.update()

    expect(
      testComponent.component.find('#pagination').hostNodes()
    ).toHaveLength(1)

    testComponent.component
      .find('#pagination button')
      .last()
      .hostNodes()
      .simulate('click')
    testComponent.component.unmount()
  })

  it('should show pagination bar in updates tab if items more than 11', async () => {
    const graphqlMock = [
      {
        request: {
          query: SEARCH_EVENTS,
          variables: {
            status: EVENT_STATUS.REJECTED,
            locationIds: ['123456789'],
            count: 10,
            skip: 0
          }
        },
        result: {
          data: {
            searchEvents: {
              totalItems: 14,
              results: userData
            }
          }
        }
      }
    ]

    const testComponent = createTestComponent(
      // @ts-ignore
      <RegistrarHome match={{ params: { tabId: 'updates' } }} />,
      store,
      graphqlMock
    )

    getItem.mockReturnValue(registerScopeToken)
    testComponent.store.dispatch(checkAuth({ '?token': registerScopeToken }))
    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 100)
    })
    testComponent.component.update()

    expect(
      testComponent.component.find('#pagination').hostNodes()
    ).toHaveLength(1)

    testComponent.component
      .find('#pagination button')
      .last()
      .hostNodes()
      .simulate('click')

    testComponent.component.unmount()
  })

  it('Should render pagination in progress tab if data is more than 10', async () => {
    jest.clearAllMocks()
    for (let i = 0; i < 12; i++) {
      const draft = createReviewApplication(uuid(), {}, Event.BIRTH)
      store.dispatch(storeApplication(draft))
    }
    const testComponent = createTestComponent(
      // @ts-ignore
      <RegistrarHome
        match={{
          params: {
            tabId: 'progress'
          },
          isExact: true,
          path: '',
          url: ''
        }}
      />,
      store
    )

    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 100)
    })

    testComponent.component.update()
    const pagiBtn = testComponent.component.find('#pagination')

    expect(pagiBtn.hostNodes()).toHaveLength(1)
    testComponent.component
      .find('#pagination button')
      .last()
      .hostNodes()
      .simulate('click')
    testComponent.component.unmount()
  })

  it('renders expanded area for ready to review', async () => {
    Date.now = jest.fn(() => 1554055200000)
    const graphqlMock = [
      {
        request: {
          query: SEARCH_EVENTS,
          variables: {
            status: EVENT_STATUS.DECLARED,
            locationIds: ['123456789'],
            count: 10,
            skip: 0
          }
        },
        result: {
          data: {
            searchEvents: {
              totalItems: 2,
              results: [
                {
                  id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8',
                  type: 'Birth',
                  registration: {
                    status: 'DECLARED',
                    contactNumber: '01622688231',
                    trackingId: 'BW0UTHR',
                    registrationNumber: null,
                    registeredLocationId:
                      '308c35b4-04f8-4664-83f5-9790e790cde1',
                    duplicates: null,
                    createdAt: '2018-05-23T14:44:58+02:00',
                    modifiedAt: '2018-05-23T14:44:58+02:00'
                  },
                  dateOfBirth: '2010-10-10',
                  childName: [
                    {
                      firstNames: 'Iliyas',
                      familyName: 'Khan'
                    },
                    {
                      firstNames: 'ইলিয়াস',
                      familyName: 'খান'
                    }
                  ],
                  dateOfDeath: null,
                  deceasedName: null
                },
                {
                  id: 'bc09200d-0160-43b4-9e2b-5b9e90424e95',
                  type: 'Death',
                  registration: {
                    status: 'DECLARED',
                    trackingId: 'DW0UTHR',
                    registrationNumber: null,
                    contactNumber: null,
                    duplicates: ['308c35b4-04f8-4664-83f5-9790e790cd33'],
                    registeredLocationId:
                      '308c35b4-04f8-4664-83f5-9790e790cde1',
                    createdAt: '2007-01-01',
                    modifiedAt: '2007-01-01'
                  },
                  dateOfBirth: null,
                  childName: null,
                  dateOfDeath: '2007-01-01',
                  deceasedName: [
                    {
                      firstNames: 'Iliyas',
                      familyName: 'Khan'
                    },
                    {
                      firstNames: 'ইলিয়াস',
                      familyName: 'খান'
                    }
                  ]
                }
              ]
            }
          }
        }
      },
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
                    type: 'DECLARED',
                    comments: null
                  }
                ]
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

    const testComponent = createTestComponent(
      // @ts-ignore
      <RegistrarHome match={{ params: { tabId: 'review' } }} />,
      store,
      graphqlMock
    )

    getItem.mockReturnValue(registerScopeToken)
    testComponent.store.dispatch(checkAuth({ '?token': registerScopeToken }))

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
    expect(testComponent.component.find('#DECLARED-0').hostNodes().length).toBe(
      1
    )
    testComponent.component.unmount()
  })
  it('renders expanded area for required updates', async () => {
    Date.now = jest.fn(() => 1554055200000)
    const graphqlMock = [
      {
        request: {
          query: SEARCH_EVENTS,
          variables: {
            status: EVENT_STATUS.REJECTED,
            locationIds: ['123456789'],
            count: 10,
            skip: 0
          }
        },
        result: {
          data: {
            searchEvents: {
              totalItems: 2,
              results: [
                {
                  id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8',
                  type: 'Birth',
                  registration: {
                    status: 'REJECTED',
                    contactNumber: '01622688231',
                    trackingId: 'BW0UTHR',
                    registrationNumber: null,
                    registeredLocationId:
                      '308c35b4-04f8-4664-83f5-9790e790cde1',
                    duplicates: null,
                    createdAt: '2018-05-23T14:44:58+02:00',
                    modifiedAt: '2018-05-23T14:44:58+02:00'
                  },
                  dateOfBirth: '2010-10-10',
                  childName: [
                    {
                      firstNames: 'Iliyas',
                      familyName: 'Khan'
                    },
                    {
                      firstNames: 'ইলিয়াস',
                      familyName: 'খান'
                    }
                  ],
                  dateOfDeath: null,
                  deceasedName: null
                },
                {
                  id: 'bc09200d-0160-43b4-9e2b-5b9e90424e95',
                  type: 'Death',
                  registration: {
                    status: 'REJECTED',
                    trackingId: 'DW0UTHR',
                    registrationNumber: null,
                    contactNumber: null,
                    duplicates: ['308c35b4-04f8-4664-83f5-9790e790cd33'],
                    registeredLocationId:
                      '308c35b4-04f8-4664-83f5-9790e790cde1',
                    createdAt: '2007-01-01',
                    modifiedAt: '2007-01-01'
                  },
                  dateOfBirth: null,
                  childName: null,
                  dateOfDeath: '2007-01-01',
                  deceasedName: [
                    {
                      firstNames: 'Iliyas',
                      familyName: 'Khan'
                    },
                    {
                      firstNames: 'ইলিয়াস',
                      familyName: 'খান'
                    }
                  ]
                }
              ]
            }
          }
        }
      },
      {
        request: {
          query: FETCH_REGISTRATION_BY_COMPOSITION,
          variables: {
            id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8'
          }
        },
        result: {
          data: {
            fetchRegistration: {
              id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8',
              registration: {
                id: '345678',
                type: 'BIRTH',
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
                    type: 'REJECTED',
                    comments: [
                      {
                        comment: 'reason=duplicate&comment=dup'
                      }
                    ]
                  }
                ]
              },
              child: {
                name: [
                  {
                    use: 'en',
                    firstNames: 'Mushraful',
                    familyName: 'Hoque'
                  }
                ],
                birthDate: '01-01-1984'
              },
              deceased: null,
              informant: null
            }
          }
        }
      }
    ]

    const testComponent = createTestComponent(
      // @ts-ignore
      <RegistrarHome match={{ params: { tabId: 'updates' } }} />,
      store,
      graphqlMock
    )

    getItem.mockReturnValue(registerScopeToken)
    testComponent.store.dispatch(checkAuth({ '?token': registerScopeToken }))

    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 200)
    })
    testComponent.component.update()
    const instance = testComponent.component.find(GridTable).instance() as any

    instance.toggleExpanded('e302f7c5-ad87-4117-91c1-35eaf2ea7be8')
    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 100)
    })

    testComponent.component.update()
    expect(testComponent.component.find('#REJECTED-0').hostNodes().length).toBe(
      1
    )
    testComponent.component.unmount()
  })
  it('expanded block renders error text when an error occurs', async () => {
    const graphqlMock = [
      {
        request: {
          query: SEARCH_EVENTS,
          variables: {
            status: EVENT_STATUS.REJECTED,
            locationIds: ['123456789'],
            count: 10,
            skip: 0
          }
        },
        result: {
          data: {
            searchEvents: {
              totalItems: 2,
              results: [
                {
                  id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8',
                  type: 'Birth',
                  registration: {
                    status: 'REJECTED',
                    contactNumber: '01622688231',
                    trackingId: 'BW0UTHR',
                    registrationNumber: null,
                    registeredLocationId:
                      '308c35b4-04f8-4664-83f5-9790e790cde1',
                    duplicates: null,
                    createdAt: '2018-05-23T14:44:58+02:00',
                    modifiedAt: '2018-05-23T14:44:58+02:00'
                  },
                  dateOfBirth: '2010-10-10',
                  childName: [
                    {
                      firstNames: 'Iliyas',
                      familyName: 'Khan'
                    },
                    {
                      firstNames: 'ইলিয়াস',
                      familyName: 'খান'
                    }
                  ],
                  dateOfDeath: null,
                  deceasedName: null
                },
                {
                  id: 'bc09200d-0160-43b4-9e2b-5b9e90424e95',
                  type: 'Death',
                  registration: {
                    status: 'REJECTED',
                    trackingId: 'DW0UTHR',
                    registrationNumber: null,
                    contactNumber: null,
                    duplicates: ['308c35b4-04f8-4664-83f5-9790e790cd33'],
                    registeredLocationId:
                      '308c35b4-04f8-4664-83f5-9790e790cde1',
                    createdAt: '2007-01-01',
                    modifiedAt: '2007-01-01'
                  },
                  dateOfBirth: null,
                  childName: null,
                  dateOfDeath: '2007-01-01',
                  deceasedName: [
                    {
                      firstNames: 'Iliyas',
                      familyName: 'Khan'
                    },
                    {
                      firstNames: 'ইলিয়াস',
                      familyName: 'খান'
                    }
                  ]
                }
              ]
            }
          }
        }
      },
      {
        request: {
          query: FETCH_REGISTRATION_BY_COMPOSITION,
          variables: {
            id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8'
          }
        },
        error: new Error('boom')
      }
    ]

    const testComponent = createTestComponent(
      // @ts-ignore
      <RegistrarHome match={{ params: { tabId: 'updates' } }} />,
      store,
      graphqlMock
    )

    getItem.mockReturnValue(registerScopeToken)
    testComponent.store.dispatch(checkAuth({ '?token': registerScopeToken }))

    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 100)
    })
    testComponent.component.update()
    const instance = testComponent.component.find(GridTable).instance() as any

    instance.toggleExpanded('e302f7c5-ad87-4117-91c1-35eaf2ea7be8')
    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 100)
    })

    testComponent.component.update()
    expect(
      testComponent.component
        .find('#search-result-error-text-expanded')
        .children()
        .text()
    ).toBe('An error occurred while searching')
    testComponent.component.unmount()
  })
})

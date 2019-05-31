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
import { COUNT_REGISTRATION_QUERY, FETCH_REGISTRATIONS_QUERY } from './queries'
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
  id: 'a7b89ee5-ea81-44ba-a1be-56af4744ddb1',
  registration: {
    type: 'BIRTH',
    trackingId: 'BQ1PJD6',
    registrationNumber: null,
    contactPhoneNumber: '01711111111',
    status: [
      {
        user: {
          id: 'dcba7022-f0ff-4822-b5d9-cb90d0e7b8de',
          name: [
            {
              use: 'en',
              firstNames: 'Shakib',
              familyName: 'Al Hasan',
              __typename: 'HumanName'
            },
            {
              use: 'bn',
              firstNames: '',
              familyName: '',
              __typename: 'HumanName'
            }
          ],
          role: 'FIELD_AGENT',
          __typename: 'User'
        },
        location: {
          id: '43ac3486-7df1-4bd9-9b5e-728054ccd6ba',
          name: 'Moktarpur',
          alias: ['মোক্তারপুর'],
          __typename: 'Location'
        },
        office: {
          name: 'Moktarpur Union Parishad',
          alias: ['মোক্তারপুর ইউনিয়ন পরিষদ'],
          address: {
            district: 'Gazipur',
            state: 'Dhaka',
            __typename: 'Address'
          },
          __typename: 'Location'
        },
        type: 'DECLARED',
        timestamp: '2019-05-16T09:18:07.165Z',
        __typename: 'RegWorkflow'
      }
    ],
    __typename: 'Registration'
  },
  createdAt: '2019-05-16T09:18:06.776Z',
  child: {
    name: null,
    birthDate: null,
    __typename: 'Person'
  },
  __typename: 'BirthRegistration'
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

  it('renders page with three tabs', async () => {
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
    app.unmount()
  })
  it('renders all items returned from graphql query in ready for reivew', async () => {
    Date.now = jest.fn(() => 1559239200000)
    const graphqlMock = [
      {
        request: {
          query: FETCH_REGISTRATIONS_QUERY,
          variables: {
            status: EVENT_STATUS.DECLARED,
            locationIds: ['123456789'],
            count: 10,
            skip: 0
          }
        },
        result: {
          data: {
            listEventRegistrations: {
              totalItems: 2,
              results: [
                {
                  id: 'a7b89ee5-ea81-44ba-a1be-56af4744ddb1',
                  registration: {
                    type: 'BIRTH',
                    trackingId: 'BQ1PJD6',
                    registrationNumber: null,
                    contactPhoneNumber: '01711111111',
                    status: [
                      {
                        user: {
                          id: 'dcba7022-f0ff-4822-b5d9-cb90d0e7b8de',
                          name: [
                            {
                              use: 'en',
                              firstNames: 'Shakib',
                              familyName: 'Al Hasan',
                              __typename: 'HumanName'
                            },
                            {
                              use: 'bn',
                              firstNames: '',
                              familyName: '',
                              __typename: 'HumanName'
                            }
                          ],
                          role: 'FIELD_AGENT',
                          __typename: 'User'
                        },
                        location: {
                          id: '43ac3486-7df1-4bd9-9b5e-728054ccd6ba',
                          name: 'Moktarpur',
                          alias: ['মোক্তারপুর'],
                          __typename: 'Location'
                        },
                        office: {
                          name: 'Moktarpur Union Parishad',
                          alias: ['মোক্তারপুর ইউনিয়ন পরিষদ'],
                          address: {
                            district: 'Gazipur',
                            state: 'Dhaka',
                            __typename: 'Address'
                          },
                          __typename: 'Location'
                        },
                        type: 'DECLARED',
                        timestamp: '2019-05-16T09:18:07.165Z',
                        __typename: 'RegWorkflow'
                      }
                    ],
                    __typename: 'Registration'
                  },
                  createdAt: '2019-05-16T09:18:06.776Z',
                  child: {
                    name: null,
                    birthDate: null,
                    __typename: 'Person'
                  },
                  __typename: 'BirthRegistration'
                },
                {
                  id: 'fea93e6f-b168-4059-805a-edcb1783b025',
                  registration: {
                    type: 'BIRTH',
                    trackingId: 'BOH0836',
                    registrationNumber: null,
                    contactPhoneNumber: '01711111111',
                    status: [
                      {
                        user: {
                          id: 'dcba7022-f0ff-4822-b5d9-cb90d0e7b8de',
                          name: [
                            {
                              use: 'en',
                              firstNames: 'Shakib',
                              familyName: 'Al Hasan',
                              __typename: 'HumanName'
                            },
                            {
                              use: 'bn',
                              firstNames: '',
                              familyName: '',
                              __typename: 'HumanName'
                            }
                          ],
                          role: 'FIELD_AGENT',
                          __typename: 'User'
                        },
                        location: {
                          id: '43ac3486-7df1-4bd9-9b5e-728054ccd6ba',
                          name: 'Moktarpur',
                          alias: ['মোক্তারপুর'],
                          __typename: 'Location'
                        },
                        office: {
                          name: 'Moktarpur Union Parishad',
                          alias: ['মোক্তারপুর ইউনিয়ন পরিষদ'],
                          address: {
                            district: 'Gazipur',
                            state: 'Dhaka',
                            __typename: 'Address'
                          },
                          __typename: 'Location'
                        },
                        type: 'DECLARED',
                        timestamp: '2019-05-16T09:24:38.930Z',
                        __typename: 'RegWorkflow'
                      }
                    ],
                    __typename: 'Registration'
                  },
                  createdAt: '2019-05-16T09:24:38.511Z',
                  child: {
                    name: null,
                    birthDate: null,
                    __typename: 'Person'
                  },
                  __typename: 'BirthRegistration'
                }
              ],
              __typename: 'EventRegResultSet'
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
    expect(data).toHaveLength(2)
    expect(data[0].id).toBe('a7b89ee5-ea81-44ba-a1be-56af4744ddb1')
    expect(data[0].application_time_elapsed).toBe('15 days ago')
    expect(data[0].tracking_id).toBe('BQ1PJD6')
    expect(data[0].event).toBe('Birth')
    expect(data[0].actions).toBeDefined()

    testComponent.component.unmount()
  })
  it('renders all items returned from graphql query in rejected tab', async () => {
    // TODO: Discuss with Yeasin about how he used moment.js in this scenario
    // const TIME_STAMP = '2018-12-07T13:11:49.380Z'
    const graphqlMock = [
      {
        request: {
          query: FETCH_REGISTRATIONS_QUERY,
          variables: {
            status: EVENT_STATUS.REJECTED,
            locationIds: ['123456789'],
            count: 10,
            skip: 0
          }
        },
        result: {
          data: {
            listEventRegistrations: {
              totalItems: 2,
              results: [
                {
                  id: 'a7b89ee5-ea81-44ba-a1be-56af4744ddb1',
                  registration: {
                    type: 'BIRTH',
                    trackingId: 'BQ1PJD6',
                    registrationNumber: null,
                    contactPhoneNumber: '01711111111',
                    status: [
                      {
                        user: {
                          id: 'dcba7022-f0ff-4822-b5d9-cb90d0e7b8de',
                          name: [
                            {
                              use: 'en',
                              firstNames: 'Shakib',
                              familyName: 'Al Hasan',
                              __typename: 'HumanName'
                            },
                            {
                              use: 'bn',
                              firstNames: '',
                              familyName: '',
                              __typename: 'HumanName'
                            }
                          ],
                          role: 'FIELD_AGENT',
                          __typename: 'User'
                        },
                        location: {
                          id: '43ac3486-7df1-4bd9-9b5e-728054ccd6ba',
                          name: 'Moktarpur',
                          alias: ['মোক্তারপুর'],
                          __typename: 'Location'
                        },
                        office: {
                          name: 'Moktarpur Union Parishad',
                          alias: ['মোক্তারপুর ইউনিয়ন পরিষদ'],
                          address: {
                            district: 'Gazipur',
                            state: 'Dhaka',
                            __typename: 'Address'
                          },
                          __typename: 'Location'
                        },
                        type: 'DECLARED',
                        timestamp: '2019-05-16T09:18:07.165Z',
                        __typename: 'RegWorkflow'
                      }
                    ],
                    __typename: 'Registration'
                  },
                  createdAt: '2019-05-16T09:18:06.776Z',
                  child: {
                    name: null,
                    birthDate: null,
                    __typename: 'Person'
                  },
                  __typename: 'BirthRegistration'
                },
                {
                  id: 'fea93e6f-b168-4059-805a-edcb1783b025',
                  registration: {
                    type: 'BIRTH',
                    trackingId: 'BOH0836',
                    registrationNumber: null,
                    contactPhoneNumber: '01711111111',
                    status: [
                      {
                        user: {
                          id: 'dcba7022-f0ff-4822-b5d9-cb90d0e7b8de',
                          name: [
                            {
                              use: 'en',
                              firstNames: 'Shakib',
                              familyName: 'Al Hasan',
                              __typename: 'HumanName'
                            },
                            {
                              use: 'bn',
                              firstNames: '',
                              familyName: '',
                              __typename: 'HumanName'
                            }
                          ],
                          role: 'FIELD_AGENT',
                          __typename: 'User'
                        },
                        location: {
                          id: '43ac3486-7df1-4bd9-9b5e-728054ccd6ba',
                          name: 'Moktarpur',
                          alias: ['মোক্তারপুর'],
                          __typename: 'Location'
                        },
                        office: {
                          name: 'Moktarpur Union Parishad',
                          alias: ['মোক্তারপুর ইউনিয়ন পরিষদ'],
                          address: {
                            district: 'Gazipur',
                            state: 'Dhaka',
                            __typename: 'Address'
                          },
                          __typename: 'Location'
                        },
                        type: 'DECLARED',
                        timestamp: '2019-05-16T09:24:38.930Z',
                        __typename: 'RegWorkflow'
                      }
                    ],
                    __typename: 'Registration'
                  },
                  createdAt: '2019-05-16T09:24:38.511Z',
                  child: {
                    name: null,
                    birthDate: null,
                    __typename: 'Person'
                  },
                  __typename: 'BirthRegistration'
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
      setTimeout(resolve, 2000)
    })
    testComponent.component.update()
    const data = testComponent.component.find(GridTable).prop('content')
    const EXPECTED_DATE_OF_REJECTION = '15 days ago'

    expect(data.length).toBe(2)
    expect(data[1].id).toBe('fea93e6f-b168-4059-805a-edcb1783b025')
    expect(data[1].contact_number).toBe('01711111111')
    expect(data[1].date_of_rejection).toBe(EXPECTED_DATE_OF_REJECTION)
    expect(data[1].event).toBe('Birth')
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

  it('should show pagination bar if items more than 11 in ReviewTab', async () => {
    Date.now = jest.fn(() => 1554055200000)
    const graphqlMock = [
      {
        request: {
          query: FETCH_REGISTRATIONS_QUERY,
          variables: {
            status: EVENT_STATUS.DECLARED,
            locationIds: ['123456789'],
            count: 10,
            skip: 0
          }
        },
        result: {
          data: {
            listEventRegistrations: {
              totalItems: 13,
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
    const pagiBtn = testComponent.component.find('#pagination')

    expect(pagiBtn.hostNodes()).toHaveLength(1)

    testComponent.component
      .find('#pagination button')
      .last()
      .hostNodes()
      .simulate('click')
    testComponent.component.unmount()
  })

  it('should show pagination bar in Review  if items more than 11', async () => {
    const graphqlMock = [
      {
        request: {
          query: FETCH_REGISTRATIONS_QUERY,
          variables: {
            status: EVENT_STATUS.REJECTED,
            locationIds: ['123456789'],
            count: 10,
            skip: 0
          }
        },
        result: {
          data: {
            listEventRegistrations: {
              totalItems: 13,
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
    const pagiBtn = testComponent.component.find('#pagination')

    expect(pagiBtn.hostNodes()).toHaveLength(1)
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
})

import * as React from 'react'
import { createTestComponent } from 'src/tests/util'
import { queries } from 'src/profile/queries'
import { merge } from 'lodash'
import { v4 as uuid } from 'uuid'
import { mockUserResponse } from 'src/tests/util'
import { storage } from 'src/storage'
import { createStore } from 'src/store'
import { WorkQueue, EVENT_STATUS } from './WorkQueue'
import { Spinner, GridTable } from '@opencrvs/components/lib/interface'
import { COUNT_REGISTRATION_QUERY, FETCH_REGISTRATIONS_QUERY } from './queries'
import { checkAuth } from 'src/profile/profileActions'
import { storeDraft, createReviewDraft } from 'src/drafts'
import { Event } from 'src/forms'

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

merge(mockUserResponse, nameObj)
mockFetchUserDetails.mockReturnValue(mockUserResponse)
queries.fetchUserDetails = mockFetchUserDetails

storage.getItem = jest.fn()
storage.setItem = jest.fn()

describe('WorkQueue tests', async () => {
  const { store } = createStore()

  beforeAll(() => {
    getItem.mockReturnValue(registerScopeToken)
    store.dispatch(checkAuth({ '?token': registerScopeToken }))
  })

  it('sets loading state while waiting for data', () => {
    const testComponent = createTestComponent(
      // @ts-ignore
      <WorkQueue
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
      <WorkQueue
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
              rejected: 5
            }
          }
        }
      }
    ]

    const testComponent = createTestComponent(
      // @ts-ignore
      <WorkQueue
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
    const draft = createReviewDraft(uuid(), {}, Event.BIRTH)
    store.dispatch(storeDraft(draft))

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
              rejected: 5
            }
          }
        }
      }
    ]

    const testComponent = createTestComponent(
      // @ts-ignore
      <WorkQueue
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
              rejected: 5
            }
          }
        }
      }
    ]

    const testComponent = createTestComponent(
      // @ts-ignore
      <WorkQueue
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
  it('renders all items returned from graphql query in ready for reivew', async () => {
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
                  id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8',
                  registration: {
                    trackingId: 'B111111',
                    contactPhoneNumber: '01622688231',
                    type: 'BIRTH',
                    status: [
                      {
                        timestamp: '2018-12-07T13:11:49.380Z',
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
                        type: 'REGISTERED'
                      }
                    ]
                  },
                  child: {
                    name: [
                      {
                        use: 'bn',
                        firstNames: '',
                        familyName: 'অনিক'
                      }
                    ],
                    birthDate: '2010-10-10'
                  },
                  createdAt: '2018-05-23T14:44:58+02:00'
                },
                {
                  id: 'cc66d69c-7f0a-4047-9283-f066571830f1',
                  registration: {
                    trackingId: 'B222222',
                    contactPhoneNumber: null,
                    type: 'DEATH',
                    status: [
                      {
                        timestamp: '2018-12-07T13:11:49.380Z',
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
                        type: 'REGISTERED'
                      }
                    ]
                  },
                  deceased: {
                    name: [
                      {
                        use: 'bn',
                        firstNames: '',
                        familyName: 'মাসুম'
                      }
                    ],
                    deceased: {
                      deathDate: '2010-10-10'
                    }
                  },
                  informant: {
                    individual: {
                      telecom: [
                        {
                          system: 'phone',
                          value: '01622688231'
                        }
                      ]
                    }
                  },
                  createdAt: '2018-05-23T14:44:58+02:00'
                }
              ]
            }
          }
        }
      }
    ]

    const testComponent = createTestComponent(
      // @ts-ignore
      <WorkQueue />,
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
    expect(data[0].tracking_id).toBe('B111111')
    expect(data[0].event).toBe('BIRTH')
    expect(data[0].actions).toBeDefined()

    testComponent.component.unmount()
  })
  it('renders all items returned from graphql query in rejected tab', async () => {
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
                  id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8',
                  registration: {
                    trackingId: 'B111111',
                    contactPhoneNumber: '01622688231',
                    type: 'BIRTH',
                    status: [
                      {
                        timestamp: '2018-12-07T13:11:49.380Z',
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
                        type: 'REGISTERED'
                      }
                    ]
                  },
                  child: {
                    name: [
                      {
                        use: 'bn',
                        firstNames: '',
                        familyName: 'অনিক'
                      }
                    ],
                    birthDate: '2010-10-10'
                  },
                  createdAt: '2018-05-23T14:44:58+02:00'
                },
                {
                  id: 'cc66d69c-7f0a-4047-9283-f066571830f1',
                  registration: {
                    trackingId: 'B222222',
                    contactPhoneNumber: null,
                    type: 'DEATH',
                    status: [
                      {
                        timestamp: '2018-12-07T13:11:49.380Z',
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
                        type: 'REGISTERED'
                      }
                    ]
                  },
                  deceased: {
                    name: [
                      {
                        use: 'bn',
                        firstNames: '',
                        familyName: 'মাসুম'
                      }
                    ],
                    deceased: {
                      deathDate: '2010-10-10'
                    }
                  },
                  informant: {
                    individual: {
                      telecom: [
                        {
                          system: 'phone',
                          value: '01622688231'
                        }
                      ]
                    }
                  },
                  createdAt: '2018-05-23T14:44:58+02:00'
                }
              ]
            }
          }
        }
      }
    ]

    const testComponent = createTestComponent(
      // @ts-ignore
      <WorkQueue match={{ params: { tabId: 'updates' } }} />,
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
    expect(data[1].id).toBe('cc66d69c-7f0a-4047-9283-f066571830f1')
    expect(data[1].contact_number).toBe('01622688231')
    expect(data[1].date_of_rejection).toBe('3 months ago')
    expect(data[1].event).toBe('DEATH')
    expect(data[1].actions).toBeDefined()

    testComponent.component.unmount()
  })

  it('renders all items returned from graphql query in inProgress tab', async () => {
    const drafts = [
      {
        id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8',
        event: 'birth',
        modifiedOn: '2018-12-07T13:11:49.380Z',
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
        modifiedOn: '2018-12-07T13:11:49.380Z',
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
      <WorkQueue match={{ params: { tabId: 'progress' } }} />,
      store
    )

    getItem.mockReturnValue(registerScopeToken)
    testComponent.store.dispatch(checkAuth({ '?token': registerScopeToken }))
    // @ts-ignore
    testComponent.store.dispatch(storeDraft(drafts))

    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 100)
    })
    testComponent.component.update()
    const data = testComponent.component.find(GridTable).prop('content')

    expect(data[1].id).toBe('e302f7c5-ad87-4117-91c1-35eaf2ea7be8')
    expect(data[1].name).toBe('Anik')
    expect(data[1].date_of_modification).toBe('3 months ago')
    expect(data[1].event).toBe('BIRTH')
    expect(data[1].actions).toBeDefined()

    testComponent.component.unmount()
  })
})

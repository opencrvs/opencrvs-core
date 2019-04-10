import {
  DataTable,
  ListItem,
  Spinner
} from '@opencrvs/components/lib/interface'
import { checkAuth } from '@opencrvs/register/src/profile/profileActions'
import { merge } from 'lodash'
import * as React from 'react'
import { queries } from 'src/profile/queries'
import { SEARCH_EVENTS } from 'src/search/queries'
import { createStore } from 'src/store'
import { createTestComponent, mockUserResponse } from 'src/tests/util'
import {
  FETCH_REGISTRATION_BY_COMPOSITION,
  FETCH_REGISTRATION_QUERY
} from './queries'
import { SearchResult } from './SearchResult'

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

describe('SearchResult tests', async () => {
  beforeAll(() => {
    getItem.mockReturnValue(registerScopeToken)
    store.dispatch(checkAuth({ '?token': registerScopeToken }))
  })
  const { store } = createStore()
  it('sets loading state while waiting for data', () => {
    const testComponent = createTestComponent(
      // @ts-ignore
      <SearchResult match={{ params: { searchText: '' } }} />,
      store
    )

    // @ts-ignore
    expect(testComponent.component.containsMatchingElement(Spinner)).toBe(true)

    testComponent.component.unmount()
  })

  it('renders all items returned from graphql query', async () => {
    const graphqlMock = [
      {
        request: {
          operationName: null,
          query: SEARCH_EVENTS,
          variables: {
            locationIds: ['123456789'],
            count: 10,
            skip: 0,
            sort: 'asc',
            eventType: '',
            status: '',
            searchContent: 'rafiq'
          }
        },
        result: {
          data: {
            searchEvents: {
              totalItems: 1,
              results: [
                {
                  id: 'b7a1743e-1431-41ed-87a8-3606ec7f6671',
                  type: 'Birth',
                  registration: {
                    status: 'DECLARED',
                    dateOfApplication: '2019-04-03T08:56:12.031Z',
                    trackingId: 'BDQNYZH',
                    registrationNumber: null,
                    registeredLocationId:
                      '308c35b4-04f8-4664-83f5-9790e790cde1',
                    __typename: 'RegistrationSearchSet'
                  },
                  dateOfBirth: '2010-01-01',
                  childName: [
                    {
                      firstNames: 'Rafiq',
                      familyName: 'Islam',
                      __typename: 'HumanName'
                    },
                    {
                      firstNames: 'রফিক',
                      familyName: 'ইসলাম',
                      __typename: 'HumanName'
                    }
                  ],
                  __typename: 'BirthEventSearchSet'
                }
              ],
              __typename: 'EventSearchResultSet'
            }
          }
        }
      }
    ]

    const testComponent = createTestComponent(
      // @ts-ignore
      <SearchResult match={{ params: { searchText: 'rafiq' } }} />,
      store,
      graphqlMock
    )

    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 100)
    })
    testComponent.component.update()
    const data = testComponent.component.find(DataTable).prop('data')
    expect(data).toEqual([
      {
        id: 'b7a1743e-1431-41ed-87a8-3606ec7f6671',
        name: 'রফিক ইসলাম',
        dob: '01-01-2010',
        dod: '',
        date_of_application: '03-04-2019',
        registrationNumber: '',
        tracking_id: 'BDQNYZH',
        declaration_status: 'DECLARED',
        event: 'Birth',
        rejection_reasons: '',
        rejection_comment: ''
      }
    ])

    testComponent.component.unmount()
  })

  it('renders error text when an error occurs', async () => {
    const graphqlMock = [
      {
        request: {
          query: SEARCH_EVENTS,
          variables: {
            locationIds: ['123456789'],
            skip: 0,
            count: 10
          }
        },
        error: new Error('boom')
      }
    ]

    const testComponent = createTestComponent(
      // @ts-ignore
      <SearchResult match={{ params: { searchText: '' } }} />,
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
        .find('#search-result-error-text')
        .children()
        .text()
    ).toBe('An error occurred while searching')

    testComponent.component.unmount()
  })

  describe('SearchResult tests for different application activity', () => {
    it('renders declare section after expanding', async () => {
      const graphqlMock = [
        {
          request: {
            query: FETCH_REGISTRATION_QUERY,
            variables: {
              locationIds: ['123456789'],
              skip: 0,
              count: 10
            }
          },
          result: {
            data: {
              listEventRegistrations: {
                totalItems: 1,
                results: [
                  {
                    id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8',
                    registration: {
                      id: '123',
                      registrationNumber: null,
                      trackingId: 'B111111',
                      type: 'BIRTH',
                      duplicates: null,
                      status: [
                        {
                          id: '123',
                          timestamp: null,
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
                          type: '',
                          comments: [
                            {
                              comment: ''
                            }
                          ]
                        }
                      ]
                    },
                    child: {
                      id: '123',
                      name: [
                        {
                          use: null,
                          firstNames: 'Baby',
                          familyName: 'Doe'
                        }
                      ],
                      birthDate: null
                    },
                    createdAt: '2018-05-23T14:44:58+02:00'
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
                }
              }
            }
          }
        }
      ]

      const testComponent = createTestComponent(
        // @ts-ignore
        <SearchResult />,
        store,
        graphqlMock
      )

      // wait for mocked data to load mockedProvider
      await new Promise(resolve => {
        setTimeout(resolve, 100)
      })

      testComponent.component.update()
      const instance = testComponent.component
        .find(DataTable)
        .find(ListItem)
        .instance() as any

      instance.toggleExpanded()

      // wait for mocked data to load mockedProvider
      await new Promise(resolve => {
        setTimeout(resolve, 100)
      })

      testComponent.component.update()

      expect(
        testComponent.component.find('#DECLARED-0').hostNodes().length
      ).toBe(1)

      testComponent.component.unmount()
    })

    it('renders error while expanded section can not load data', async () => {
      const graphqlMock = [
        {
          request: {
            query: FETCH_REGISTRATION_QUERY,
            variables: {
              locationIds: ['123456789'],
              skip: 0,
              count: 10
            }
          },
          result: {
            data: {
              listEventRegistrations: {
                totalItems: 1,
                results: [
                  {
                    id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8',
                    registration: {
                      id: '123',
                      registrationNumber: null,
                      trackingId: 'B111111',
                      type: 'BIRTH',
                      duplicates: null,
                      status: [
                        {
                          id: '123',
                          timestamp: null,
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
                          comments: [
                            {
                              comment: ''
                            }
                          ]
                        }
                      ]
                    },
                    child: {
                      id: '123',
                      name: [
                        {
                          use: null,
                          firstNames: 'Baby',
                          familyName: 'Doe'
                        }
                      ],
                      birthDate: null
                    },
                    createdAt: '2018-05-23T14:44:58+02:00'
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
                registration: null
              }
            }
          }
        }
      ]

      const testComponent = createTestComponent(
        // @ts-ignore
        <SearchResult />,
        store,
        graphqlMock
      )

      // wait for mocked data to load mockedProvider
      await new Promise(resolve => {
        setTimeout(resolve, 100)
      })

      testComponent.component.update()
      const instance = testComponent.component
        .find(DataTable)
        .find(ListItem)
        .instance() as any

      instance.toggleExpanded()

      // wait for mocked data to load mockedProvider
      await new Promise(resolve => {
        setTimeout(resolve, 100)
      })

      testComponent.component.update()

      expect(
        testComponent.component.find('#DECLARED-0').hostNodes().length
      ).toBe(0)

      testComponent.component.unmount()
    })

    it('renders rejected section after expanding', async () => {
      const graphqlMock = [
        {
          request: {
            query: FETCH_REGISTRATION_QUERY,
            variables: {
              locationIds: ['123456789'],
              skip: 0,
              count: 10
            }
          },
          result: {
            data: {
              listEventRegistrations: {
                totalItems: 1,
                results: [
                  {
                    id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8',
                    registration: {
                      id: '123',
                      registrationNumber: null,
                      trackingId: 'B111111',
                      type: 'BIRTH',
                      duplicates: null,
                      status: [
                        {
                          id: '123',
                          timestamp: null,
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
                              comment: 'reason=misspelling&comment=misspel'
                            }
                          ]
                        }
                      ]
                    },
                    child: {
                      id: '123',
                      name: [
                        {
                          use: null,
                          firstNames: 'Baby',
                          familyName: 'Doe'
                        }
                      ],
                      birthDate: null
                    },
                    createdAt: '2018-05-23T14:44:58+02:00'
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
                __typename: 'BirthRegistration'
              }
            }
          }
        }
      ]

      const testComponent = createTestComponent(
        // @ts-ignore
        <SearchResult />,
        store,
        graphqlMock
      )

      // wait for mocked data to load mockedProvider
      await new Promise(resolve => {
        setTimeout(resolve, 100)
      })

      testComponent.component.update()
      const instance = testComponent.component
        .find(DataTable)
        .find(ListItem)
        .instance() as any

      instance.toggleExpanded()

      // wait for mocked data to load mockedProvider
      await new Promise(resolve => {
        setTimeout(resolve, 100)
      })

      testComponent.component.update()

      expect(
        testComponent.component.find('#REJECTED-0').hostNodes().length
      ).toBe(1)

      testComponent.component.unmount()
    })

    it('renders registered section after expanding', async () => {
      const graphqlMock = [
        {
          request: {
            query: FETCH_REGISTRATION_QUERY,
            variables: {
              locationIds: ['123456789'],
              skip: 0,
              count: 10
            }
          },
          result: {
            data: {
              listEventRegistrations: {
                totalItems: 1,
                results: [
                  {
                    id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8',
                    registration: {
                      id: '123',
                      registrationNumber: null,
                      trackingId: 'B111111',
                      type: 'BIRTH',
                      duplicates: null,
                      status: [
                        {
                          id: '123',
                          timestamp: null,
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
                          type: 'REGISTERED',
                          comments: [
                            {
                              comment: ''
                            }
                          ]
                        }
                      ]
                    },
                    child: {
                      id: '123',
                      name: [
                        {
                          use: null,
                          firstNames: 'Baby',
                          familyName: 'Doe'
                        }
                      ],
                      birthDate: null
                    },
                    createdAt: '2018-05-23T14:44:58+02:00'
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
                      type: 'REGISTERED',
                      comments: null
                    }
                  ]
                }
              }
            }
          }
        }
      ]

      const testComponent = createTestComponent(
        // @ts-ignore
        <SearchResult />,
        store,
        graphqlMock
      )

      // wait for mocked data to load mockedProvider
      await new Promise(resolve => {
        setTimeout(resolve, 100)
      })

      testComponent.component.update()
      const instance = testComponent.component
        .find(DataTable)
        .find(ListItem)
        .instance() as any

      instance.toggleExpanded()

      // wait for mocked data to load mockedProvider
      await new Promise(resolve => {
        setTimeout(resolve, 100)
      })

      testComponent.component.update()

      expect(
        testComponent.component.find('#REGISTERED-0').hostNodes().length
      ).toBe(1)

      testComponent.component.unmount()
    })

    it('renders collected section after expanding', async () => {
      const graphqlMock = [
        {
          request: {
            query: FETCH_REGISTRATION_QUERY,
            variables: {
              locationIds: ['123456789'],
              skip: 0,
              count: 10
            }
          },
          result: {
            data: {
              listEventRegistrations: {
                totalItems: 1,
                results: [
                  {
                    id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8',
                    registration: {
                      id: '123',
                      registrationNumber: null,
                      trackingId: 'B111111',
                      type: 'BIRTH',
                      duplicates: null,
                      status: [
                        {
                          id: '123',
                          timestamp: null,
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
                          type: 'CERTIFIED',
                          comments: [
                            {
                              comment: ''
                            }
                          ]
                        }
                      ]
                    },
                    child: {
                      id: '123',
                      name: [
                        {
                          use: null,
                          firstNames: 'Baby',
                          familyName: 'Doe'
                        }
                      ],
                      birthDate: null
                    },
                    createdAt: '2018-05-23T14:44:58+02:00'
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
                      type: 'CERTIFIED',
                      comments: null
                    }
                  ]
                }
              }
            }
          }
        }
      ]

      const testComponent = createTestComponent(
        // @ts-ignore
        <SearchResult />,
        store,
        graphqlMock
      )

      // wait for mocked data to load mockedProvider
      await new Promise(resolve => {
        setTimeout(resolve, 100)
      })

      testComponent.component.update()
      const instance = testComponent.component
        .find(DataTable)
        .find(ListItem)
        .instance() as any

      instance.toggleExpanded()

      // wait for mocked data to load mockedProvider
      await new Promise(resolve => {
        setTimeout(resolve, 100)
      })

      testComponent.component.update()

      expect(
        testComponent.component.find('#CERTIFIED-0').hostNodes().length
      ).toBe(1)

      testComponent.component.unmount()
    })

    it('check branches  using miscellaneous data', async () => {
      const graphqlMock = [
        {
          request: {
            query: FETCH_REGISTRATION_QUERY,
            variables: {
              locationIds: ['123456789'],
              skip: 0,
              count: 10
            }
          },
          result: {
            data: {
              listEventRegistrations: {
                totalItems: 1,
                results: [
                  {
                    id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8',
                    registration: {
                      id: '123',
                      registrationNumber: null,
                      trackingId: 'B111111',
                      type: '',
                      duplicates: null,
                      status: [
                        {
                          id: '123',
                          timestamp: null,
                          user: {
                            id: '153f8364-96b3-4b90-8527-bf2ec4a367bd',
                            name: [
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
                            name: '',
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
                          type: '',
                          comments: [
                            {
                              comment: ''
                            }
                          ]
                        }
                      ]
                    },
                    child: {
                      id: '123',
                      name: [
                        {
                          use: null,
                          firstNames: 'Baby',
                          familyName: 'Doe'
                        }
                      ],
                      birthDate: '2011-05-23T14:44:58+02:00'
                    },
                    createdAt: '2018-05-23T14:44:58+02:00'
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
                  certificates: [
                    {
                      collector: {
                        individual: {
                          name: [
                            {
                              use: 'bn',
                              firstNames: 'গায়ত্রী',
                              familyName: 'পিভক'
                            }
                          ]
                        },
                        relationship: 'MOTHER'
                      }
                    }
                  ],
                  status: [
                    {
                      id:
                        '17e9b24-b00f-4a0f-a5a4-9c84c6e64e98/_history/86c3044a-329f-418',
                      timestamp: '2019-04-03T07:08:24.936Z',
                      user: {
                        id: '153f8364-96b3-4b90-8527-bf2ec4a367bd',
                        name: [
                          {
                            use: 'bn',
                            firstNames: 'গায়ত্রী',
                            familyName: 'পিভক'
                          }
                        ],
                        role: ''
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
                      type: 'CERTIFIED',
                      comments: null
                    }
                  ]
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
        <SearchResult />,
        store,
        graphqlMock
      )

      // wait for mocked data to load mockedProvider
      await new Promise(resolve => {
        setTimeout(resolve, 100)
      })

      testComponent.component.update()
      const instance = testComponent.component
        .find(DataTable)
        .find(ListItem)
        .instance() as any

      instance.toggleExpanded()

      // wait for mocked data to load mockedProvider
      await new Promise(resolve => {
        setTimeout(resolve, 100)
      })

      testComponent.component.update()

      expect(
        testComponent.component.find('#CERTIFIED-0').hostNodes().length
      ).toBe(1)

      testComponent.component.unmount()
    })
  })
})

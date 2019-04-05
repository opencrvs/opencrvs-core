import * as React from 'react'
import { SearchResult } from './SearchResult'
import { createTestComponent, mockUserResponse } from 'src/tests/util'
import { createStore } from 'src/store'
import {
  Spinner,
  DataTable,
  ListItem
} from '@opencrvs/components/lib/interface'
import { checkAuth } from '@opencrvs/register/src/profile/profileActions'
import { queries } from 'src/profile/queries'
import { merge } from 'lodash'
import {
  FETCH_TASK_HISTORY_BY_COMPOSITION,
  FETCH_REGISTRATION_QUERY
} from './queries'

const declareScope =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJpYXQiOjE1MzMxOTUyMjgsImV4cCI6MTU0MzE5NTIyNywiYXVkIjpbImdhdGV3YXkiXSwic3ViIjoiMSJ9.G4KzkaIsW8fTkkF-O8DI0qESKeBI332UFlTXRis3vJ6daisu06W5cZsgYhmxhx_n0Q27cBYt2OSOnjgR72KGA5IAAfMbAJifCul8ib57R4VJN8I90RWqtvA0qGjV-sPndnQdmXzCJx-RTumzvr_vKPgNDmHzLFNYpQxcmQHA-N8li-QHMTzBHU4s9y8_5JOCkudeoTMOd_1021EDAQbrhonji5V1EOSY2woV5nMHhmq166I1L0K_29ngmCqQZYi1t6QBonsIowlXJvKmjOH5vXHdCCJIFnmwHmII4BK-ivcXeiVOEM_ibfxMWkAeTRHDshOiErBFeEvqd6VWzKvbKAH0UY-Rvnbh4FbprmO4u4_6Yd2y2HnbweSo-v76dVNcvUS0GFLFdVBt0xTay-mIeDy8CKyzNDOWhmNUvtVi9mhbXYfzzEkwvi9cWwT1M8ZrsWsvsqqQbkRCyBmey_ysvVb5akuabenpPsTAjiR8-XU2mdceTKqJTwbMU5gz-8fgulbTB_9TNJXqQlH7tyYXMWHUY3uiVHWg2xgjRiGaXGTiDgZd01smYsxhVnPAddQOhqZYCrAgVcT1GBFVvhO7CC-rhtNlLl21YThNNZNpJHsCgg31WA9gMQ_2qAJmw2135fAyylO8q7ozRUvx46EezZiPzhCkPMeELzLhQMEIqjo'

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
  const { store } = createStore()
  it('sets loading state while waiting for data', () => {
    const testComponent = createTestComponent(
      // @ts-ignore
      <SearchResult />,
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
              totalItems: 2,
              results: [
                {
                  id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8',
                  registration: {
                    id: '123',
                    registrationNumber: null,
                    trackingId: 'B111111',
                    duplicates: null,
                    type: 'BIRTH',
                    status: [
                      {
                        id: '123',
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
                        use: 'bn',
                        firstNames: '',
                        familyName: 'অনিক'
                      }
                    ],
                    birthDate: null
                  },
                  createdAt: '2018-05-23T14:44:58+02:00'
                },
                {
                  id: 'cc66d69c-7f0a-4047-9283-f066571830f1',
                  registration: {
                    id: '123',
                    registrationNumber: null,
                    trackingId: 'B222222',
                    type: 'DEATH',
                    duplicates: null,
                    status: [
                      {
                        id: '123',
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
                        type: 'REGISTERED',
                        comments: [
                          {
                            comment: ''
                          }
                        ]
                      }
                    ]
                  },
                  deceased: {
                    id: '123',
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
      <SearchResult />,
      store,
      graphqlMock
    )

    getItem.mockReturnValue(declareScope)
    testComponent.store.dispatch(checkAuth({ '?token': declareScope }))

    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 100)
    })
    testComponent.component.update()
    const data = testComponent.component.find(DataTable).prop('data')
    expect(data).toEqual([
      {
        id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8',
        name: 'অনিক',
        dob: '',
        dod: '',
        date_of_application: '23-05-2018',
        registrationNumber: '',
        tracking_id: 'B111111',
        createdAt: '2018-05-23T14:44:58+02:00',
        declaration_status: 'REGISTERED',
        event: 'BIRTH',
        duplicates: null,
        status: [
          {
            officeName: 'Kaliganj Union Sub Center',
            timestamp: '07-12-2018',
            type: 'REGISTERED',
            practitionerName: 'Mohammad Ashraful',
            practitionerRole: 'Registrar'
          }
        ],
        rejection_reasons: '',
        rejection_comment: '',
        location: 'Kaliganj Union Sub Center'
      },
      {
        id: 'cc66d69c-7f0a-4047-9283-f066571830f1',
        name: 'মাসুম',
        dob: '',
        dod: '10-10-2010',
        date_of_application: '23-05-2018',
        registrationNumber: '',
        tracking_id: 'B222222',
        createdAt: '2018-05-23T14:44:58+02:00',
        declaration_status: 'REGISTERED',
        event: 'DEATH',
        duplicates: null,
        status: [
          {
            officeName: 'Kaliganj Union Sub Center',
            timestamp: '07-12-2018',
            type: 'REGISTERED',
            practitionerName: 'Mohammad Ashraful',
            practitionerRole: 'Registrar'
          }
        ],
        rejection_reasons: '',
        rejection_comment: '',
        location: 'Kaliganj Union Sub Center'
      }
    ])

    testComponent.component.unmount()
  })

  it('renders error text when an error occurs', async () => {
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
        error: new Error('boom')
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

    expect(
      testComponent.component
        .find('#search-result-error-text')
        .children()
        .text()
    ).toBe('An error occurred while searching')

    testComponent.component.unmount()
  })

  describe('SearchResult tests for register scope', () => {
    beforeAll(() => {
      getItem.mockReturnValue(registerScopeToken)
      store.dispatch(checkAuth({ '?token': registerScopeToken }))
    })
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
            query: FETCH_TASK_HISTORY_BY_COMPOSITION,
            variables: {
              id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8'
            }
          },
          result: {
            data: {
              queryTaskHistory: [
                {
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
                  certificate: null,
                  comments: null,
                  informant: null
                }
              ]
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
            query: FETCH_TASK_HISTORY_BY_COMPOSITION,
            variables: {
              id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8'
            }
          },
          result: {
            data: {
              queryTaskHistory: null
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
            query: FETCH_TASK_HISTORY_BY_COMPOSITION,
            variables: {
              id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8'
            }
          },
          result: {
            data: {
              queryTaskHistory: [
                {
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
                  certificate: null,
                  comments: {
                    comment: 'reason=duplicate&comment=dup'
                  },
                  informant: null
                }
              ]
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
            query: FETCH_TASK_HISTORY_BY_COMPOSITION,
            variables: {
              id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8'
            }
          },
          result: {
            data: {
              queryTaskHistory: [
                {
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
                  type: 'REGISTERED',
                  certificate: null,
                  comments: null,
                  informant: null
                }
              ]
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
            query: FETCH_TASK_HISTORY_BY_COMPOSITION,
            variables: {
              id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8'
            }
          },
          result: {
            data: {
              queryTaskHistory: [
                {
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
                  certificate: {
                    collector: {
                      individual: {
                        name: [
                          {
                            use: 'en',
                            firstNames: 'Rakib',
                            familyName: 'Hasan'
                          }
                        ]
                      },
                      relationship: 'OTHER'
                    }
                  },
                  comments: null,
                  informant: {
                    telecom: [
                      {
                        use: null,
                        system: 'phone',
                        value: '01686972106'
                      }
                    ]
                  }
                }
              ]
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

    it('renders collected section after expanding in collector english name not present', async () => {
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
            query: FETCH_TASK_HISTORY_BY_COMPOSITION,
            variables: {
              id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8'
            }
          },
          result: {
            data: {
              queryTaskHistory: [
                {
                  timestamp: '2019-04-03T07:08:24.936Z',
                  user: {
                    id: '153f8364-96b3-4b90-8527-bf2ec4a367bd',
                    name: [
                      {
                        use: 'bn',
                        firstNames: 'মোহাম্মদ',
                        familyName: 'আশরাফুল'
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
                    name: '',
                    alias: ['Kaliganj Union Sub Center'],
                    address: {
                      district: '7876',
                      state: 'iuyiuy'
                    }
                  },
                  type: 'CERTIFIED',
                  certificate: {
                    collector: {
                      individual: {
                        name: [
                          {
                            use: 'bn',
                            firstNames: 'তৌফিক',
                            familyName: 'শাহরিয়ার'
                          }
                        ]
                      },
                      relationship: 'OTHER'
                    }
                  },
                  comments: null,
                  informant: {
                    telecom: [
                      {
                        use: null,
                        system: 'phone',
                        value: '01686972106'
                      }
                    ]
                  }
                },
                {
                  timestamp: '2019-04-03T07:08:24.936Z',
                  user: {
                    id: '153f8364-96b3-4b90-8527-bf2ec4a367bd',
                    name: [
                      {
                        use: 'bn',
                        firstNames: 'মোহাম্মদ',
                        familyName: 'আশরাফুল'
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
                    name: '',
                    alias: ['Kaliganj Union Sub Center'],
                    address: {
                      district: '7876',
                      state: 'iuyiuy'
                    }
                  },
                  type: '',
                  certificate: {
                    collector: {
                      individual: {
                        name: [
                          {
                            use: 'bn',
                            firstNames: 'তৌফিক',
                            familyName: 'শাহরিয়ার'
                          }
                        ]
                      },
                      relationship: 'OTHER'
                    }
                  },
                  comments: null,
                  informant: {
                    telecom: [
                      {
                        use: null,
                        system: 'phone',
                        value: '01686972106'
                      }
                    ]
                  }
                }
              ]
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

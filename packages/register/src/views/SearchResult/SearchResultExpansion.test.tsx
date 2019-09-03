import { DataTable, ListItem } from '@opencrvs/components/lib/interface'
import { checkAuth } from '@opencrvs/register/src/profile/profileActions'
import { merge } from 'lodash'
import * as React from 'react'
import { queries } from '@register/profile/queries'
import { SEARCH_EVENTS } from '@register/search/queries'
import { createStore } from '@register/store'
import { createTestComponent, mockUserResponse } from '@register/tests/util'
import { FETCH_REGISTRATION_BY_COMPOSITION } from '@register/views/SearchResult/queries'
import { SearchResult } from '@register/views/SearchResult/SearchResult'

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

describe('SearchResult expansion related tests', () => {
  const { store } = createStore()

  beforeAll(() => {
    getItem.mockReturnValue(registerScopeToken)
    store.dispatch(checkAuth({ '?token': registerScopeToken }))
  })

  describe('SearchResult tests for different application activity', () => {
    it('renders declare section after expanding', async () => {
      const graphqlMock = [
        {
          request: {
            operationName: null,
            query: SEARCH_EVENTS,
            variables: {
              locationIds: ['2a83cf14-b959-47f4-8097-f75a75d1867f'],
              sort: 'DESC',
              trackingId: 'DW0UTHR',
              registrationNumber: '',
              contactNumber: ''
            }
          },
          result: {
            data: {
              searchEvents: {
                totalItems: 1,
                results: [
                  {
                    id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8',
                    type: 'Birth',
                    registration: {
                      status: 'REGISTERED',
                      duplicates: null,
                      trackingId: 'BDQNYZH',
                      registrationNumber: '123456789098765432',
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
                    __typename: 'BirthEventSearchSet',

                    // TODO: When fragmentMatching work is completed, remove unnecessary result objects
                    // PR: https://github.com/jembi/OpenCRVS/pull/836/commits/6302fa8f015fe313cbce6197980f1300bf4eba32
                    dateOfDeath: '',
                    deceasedName: []
                  }
                ],
                __typename: 'EventSearchResultSet'
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
                // TODO: When fragmentMatching work is completed, remove unnecessary result objects
                // PR: https://github.com/jembi/OpenCRVS/pull/836/commits/6302fa8f015fe313cbce6197980f1300bf4eba32
                informant: {
                  __typename: 'X',
                  individual: {
                    __typename: 'X',
                    telecom: [
                      {
                        __typename: 'X',
                        system: 'phone',
                        use: '',
                        value: '01622688231'
                      }
                    ]
                  }
                },
                registration: {
                  id: '345678',
                  certificates: null,
                  __typename: 'X',
                  status: [
                    {
                      id:
                        '17e9b24-b00f-4a0f-a5a4-9c84c6e64e98/_history/86c3044a-329f-418',
                      timestamp: '2019-04-03T07:08:24.936Z',
                      __typename: 'X',
                      user: {
                        id: '153f8364-96b3-4b90-8527-bf2ec4a367bd',
                        __typename: 'X',
                        name: [
                          {
                            use: 'en',
                            __typename: 'X',
                            firstNames: 'Mohammad',
                            familyName: 'Ashraful'
                          },
                          {
                            use: 'bn',
                            __typename: 'X',
                            firstNames: '',
                            familyName: ''
                          }
                        ],
                        role: 'LOCAL_REGISTRAR'
                      },
                      location: {
                        __typename: 'X',
                        id: '123',
                        name: 'Kaliganj Union Sub Center',
                        alias: ['']
                      },
                      office: {
                        __typename: 'X',
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

      const testComponent = await createTestComponent(
        // @ts-ignore
        <SearchResult
          match={{
            params: {
              searchText: 'DW0UTHR',
              searchType: 'tracking-id'
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
    })

    it('renders error while expanded section can not load data', async () => {
      const graphqlMock = [
        {
          request: {
            operationName: null,
            query: SEARCH_EVENTS,
            variables: {
              locationIds: ['2a83cf14-b959-47f4-8097-f75a75d1867f'],
              sort: 'DESC',
              trackingId: 'DW0UTHR',
              registrationNumber: '',
              contactNumber: ''
            }
          },
          result: {
            data: {
              searchEvents: {
                totalItems: 1,
                results: [
                  {
                    id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8',
                    type: 'Birth',
                    registration: {
                      status: 'CERTIFIED',
                      duplicates: null,
                      trackingId: 'BDQNYZH',
                      registrationNumber: '123456789098765432',
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
                    __typename: 'BirthEventSearchSet',
                    // TODO: When fragmentMatching work is completed, remove unnecessary result objects
                    // PR: https://github.com/jembi/OpenCRVS/pull/836/commits/6302fa8f015fe313cbce6197980f1300bf4eba32
                    dateOfDeath: '',
                    deceasedName: []
                  }
                ],
                __typename: 'EventSearchResultSet'
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

      const testComponent = await createTestComponent(
        // @ts-ignore
        <SearchResult
          match={{
            params: {
              searchText: 'DW0UTHR',
              searchType: 'tracking-id'
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
    })

    it('renders rejected section after expanding', async () => {
      const graphqlMock = [
        {
          request: {
            operationName: null,
            query: SEARCH_EVENTS,
            variables: {
              locationIds: ['2a83cf14-b959-47f4-8097-f75a75d1867f'],
              sort: 'DESC',
              trackingId: 'DW0UTHR',
              registrationNumber: '',
              contactNumber: ''
            }
          },
          result: {
            data: {
              searchEvents: {
                totalItems: 1,
                results: [
                  {
                    id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8',
                    type: 'Birth',
                    registration: {
                      status: 'REJECTED',
                      duplicates: null,
                      trackingId: 'BDQNYZH',
                      registrationNumber: null,
                      registeredLocationId:
                        '308c35b4-04f8-4664-83f5-9790e790cde1',
                      reason: 'duplicate',
                      comment: 'Possible duplicate',
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
                    __typename: 'BirthEventSearchSet',
                    // TODO: When fragmentMatching work is completed, remove unnecessary result objects
                    // PR: https://github.com/jembi/OpenCRVS/pull/836/commits/6302fa8f015fe313cbce6197980f1300bf4eba32
                    dateOfDeath: '',
                    deceasedName: []
                  }
                ],
                __typename: 'EventSearchResultSet'
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
                // TODO: When fragmentMatching work is completed, remove unnecessary result objects
                // PR: https://github.com/jembi/OpenCRVS/pull/836/commits/6302fa8f015fe313cbce6197980f1300bf4eba32
                informant: {
                  __typename: 'X',
                  individual: {
                    __typename: 'X',
                    telecom: [
                      {
                        __typename: 'X',
                        system: 'phone',
                        use: '',
                        value: '01622688231'
                      }
                    ]
                  }
                },
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

      const testComponent = await createTestComponent(
        // @ts-ignore
        <SearchResult
          match={{
            params: {
              searchText: 'DW0UTHR',
              searchType: 'tracking-id'
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
    })

    it('renders registered section after expanding', async () => {
      const graphqlMock = [
        {
          request: {
            operationName: null,
            query: SEARCH_EVENTS,
            variables: {
              locationIds: ['2a83cf14-b959-47f4-8097-f75a75d1867f'],
              sort: 'DESC',
              trackingId: '',
              registrationNumber: '0FRTRSC111HHH',
              contactNumber: ''
            }
          },
          result: {
            data: {
              searchEvents: {
                totalItems: 1,
                results: [
                  {
                    id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8',
                    type: 'Birth',
                    registration: {
                      status: 'DECLARED',
                      duplicates: null,
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
                    // TODO: When fragmentMatching work is completed, remove unnecessary result objects
                    // PR: https://github.com/jembi/OpenCRVS/pull/836/commits/6302fa8f015fe313cbce6197980f1300bf4eba32
                    dateOfDeath: '',
                    deceasedName: [],
                    __typename: 'BirthEventSearchSet'
                  }
                ],
                __typename: 'EventSearchResultSet'
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
                // TODO: When fragmentMatching work is completed, remove unnecessary result objects
                // PR: https://github.com/jembi/OpenCRVS/pull/836/commits/6302fa8f015fe313cbce6197980f1300bf4eba32
                informant: {
                  __typename: 'X',
                  individual: {
                    __typename: 'X',
                    telecom: [
                      {
                        __typename: 'X',
                        system: 'phone',
                        use: '',
                        value: '01622688231'
                      }
                    ]
                  }
                },
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

      const testComponent = await createTestComponent(
        // @ts-ignore
        <SearchResult
          match={{
            params: {
              searchText: '0FRTRSC111HHH',
              searchType: 'brn-drn'
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
    })

    it('renders collected section after expanding', async () => {
      const graphqlMock = [
        {
          request: {
            operationName: null,
            query: SEARCH_EVENTS,
            variables: {
              locationIds: ['2a83cf14-b959-47f4-8097-f75a75d1867f'],
              sort: 'DESC',
              trackingId: '',
              registrationNumber: '',
              contactNumber: '017111111111'
            }
          },
          result: {
            data: {
              searchEvents: {
                totalItems: 1,
                results: [
                  {
                    id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8',
                    type: '',
                    registration: {
                      status: 'DECLARED',
                      duplicates: null,
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
                    // TODO: When fragmentMatching work is completed, remove unnecessary result objects
                    // PR: https://github.com/jembi/OpenCRVS/pull/836/commits/6302fa8f015fe313cbce6197980f1300bf4eba32
                    dateOfDeath: '',
                    deceasedName: [],
                    __typename: 'BirthEventSearchSet'
                  }
                ],
                __typename: 'EventSearchResultSet'
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
                // TODO: When fragmentMatching work is completed, remove unnecessary result objects
                // PR: https://github.com/jembi/OpenCRVS/pull/836/commits/6302fa8f015fe313cbce6197980f1300bf4eba32
                informant: {
                  __typename: 'X',
                  individual: {
                    __typename: 'X',
                    telecom: [
                      {
                        __typename: 'X',
                        system: 'phone',
                        use: '',
                        value: '01622688231'
                      }
                    ]
                  }
                },
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

      const testComponent = await createTestComponent(
        // @ts-ignore
        <SearchResult
          match={{
            params: {
              searchText: '017111111111',
              searchType: 'phone'
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
    })

    it('check branches  using miscellaneous data', async () => {
      const graphqlMock = [
        {
          request: {
            operationName: null,
            query: SEARCH_EVENTS,
            variables: {
              locationIds: ['2a83cf14-b959-47f4-8097-f75a75d1867f'],
              sort: 'DESC',
              trackingId: '',
              registrationNumber: '',
              contactNumber: '017111111111'
            }
          },
          result: {
            data: {
              searchEvents: {
                totalItems: 1,
                results: [
                  {
                    id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8',
                    type: 'Birth',
                    registration: {
                      status: 'DEFAULT',
                      duplicates: null,
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
                    // TODO: When fragmentMatching work is completed, remove unnecessary result objects
                    // PR: https://github.com/jembi/OpenCRVS/pull/836/commits/6302fa8f015fe313cbce6197980f1300bf4eba32
                    dateOfDeath: '',
                    deceasedName: [],
                    __typename: 'BirthEventSearchSet'
                  }
                ],
                __typename: 'EventSearchResultSet'
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
                // TODO: When fragmentMatching work is completed, remove unnecessary result objects
                // PR: https://github.com/jembi/OpenCRVS/pull/836/commits/6302fa8f015fe313cbce6197980f1300bf4eba32
                informant: {
                  __typename: 'X',
                  individual: {
                    __typename: 'X',
                    telecom: [
                      {
                        __typename: 'X',
                        system: 'phone',
                        use: '',
                        value: '01622688231'
                      }
                    ]
                  }
                },
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
                }
              }
            }
          }
        }
      ]

      const testComponent = await createTestComponent(
        // @ts-ignore
        <SearchResult
          match={{
            params: {
              searchText: '017111111111',
              searchType: 'phone'
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
    })
  })
})

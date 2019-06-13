import {
  DataTable,
  ListItem,
  Spinner
} from '@opencrvs/components/lib/interface'
import { checkAuth } from '@opencrvs/register/src/profile/profileActions'
import { merge } from 'lodash'
import * as React from 'react'
import { queries } from '@register/profile/queries'
import { SEARCH_EVENTS } from '@register/search/queries'
import { createStore } from '@register/store'
import { createTestComponent, mockUserResponse } from '@register/tests/util'
import { FETCH_REGISTRATION_BY_COMPOSITION } from '@register/views/SearchResult/queries'
import { SearchResult } from '@register/views/SearchResult/SearchResult'
import { goToSearch } from '@register/navigation'

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

describe('SearchResult tests', () => {
  const { store } = createStore()

  beforeAll(() => {
    getItem.mockReturnValue(registerScopeToken)
    store.dispatch(checkAuth({ '?token': registerScopeToken }))
  })

  it('sets loading state while waiting for data', () => {
    const testComponent = createTestComponent(
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
            sort: 'DESC',
            trackingId: 'DW0UTHR',
            registrationNumber: '',
            contactNumber: ''
          }
        },
        result: {
          data: {
            searchEvents: {
              totalItems: 4,
              results: [
                {
                  id: 'bc09200d-0160-43b4-9e2b-5b9e90424e95',
                  type: 'Death',
                  __typename: 'X',
                  registration: {
                    __typename: 'X',
                    status: 'DECLARED',
                    trackingId: 'DW0UTHR',
                    registrationNumber: null,
                    duplicates: ['308c35b4-04f8-4664-83f5-9790e790cd33'],
                    registeredLocationId: '308c35b4-04f8-4664-83f5-9790e790cde1'
                  },
                  dateOfDeath: '2007-01-01',
                  deceasedName: [
                    {
                      __typename: 'X',
                      firstNames: 'Iliyas',
                      familyName: 'Khan'
                    },
                    {
                      __typename: 'X',
                      firstNames: 'ইলিয়াস',
                      familyName: 'খান'
                    }
                  ],

                  // TODO: When fragmentMatching work is completed, remove unnecessary result objects
                  // PR: https://github.com/jembi/OpenCRVS/pull/836/commits/6302fa8f015fe313cbce6197980f1300bf4eba32
                  dateOfBirth: '',
                  childName: []
                },
                {
                  id: 'c7e83060-4db9-4057-8b14-71841243b05f',
                  type: 'Death',
                  __typename: 'X',
                  registration: {
                    __typename: 'X',
                    status: 'REJECTED',
                    trackingId: 'DXMJPYA',
                    registrationNumber: null,
                    duplicates: null,
                    registeredLocationId:
                      '308c35b4-04f8-4664-83f5-9790e790cde1',
                    reason:
                      'duplicate,misspelling,missing_supporting_doc,other',
                    comment: 'Rejected'
                  },
                  dateOfDeath: '2010-01-01',
                  deceasedName: [
                    {
                      __typename: 'X',
                      firstNames: 'Zahir',
                      familyName: 'Raihan'
                    },
                    {
                      __typename: 'X',
                      firstNames: 'জহির',
                      familyName: 'রায়হান'
                    }
                  ],

                  // TODO: When fragmentMatching work is completed, remove unnecessary result objects
                  // PR: https://github.com/jembi/OpenCRVS/pull/836/commits/6302fa8f015fe313cbce6197980f1300bf4eba32
                  dateOfBirth: '',
                  childName: []
                },
                {
                  id: '150dd4ca-6822-4f94-ad92-b9be037dec2f',
                  type: 'Birth',
                  __typename: 'X',
                  registration: {
                    __typename: 'X',
                    status: 'REGISTERED',
                    trackingId: 'BQRZWDR',
                    registrationNumber: '2019333494BQRZWDR2',
                    duplicates: null,
                    registeredLocationId: '308c35b4-04f8-4664-83f5-9790e790cde1'
                  },
                  dateOfBirth: '2010-01-01',
                  childName: [
                    {
                      __typename: 'X',
                      firstNames: 'Fokrul',
                      familyName: 'Islam'
                    },
                    {
                      __typename: 'X',
                      firstNames: 'ফকরুল',
                      familyName: 'ইসলাম'
                    }
                  ],

                  // TODO: When fragmentMatching work is completed, remove unnecessary result objects
                  // PR: https://github.com/jembi/OpenCRVS/pull/836/commits/6302fa8f015fe313cbce6197980f1300bf4eba32
                  dateOfDeath: '',
                  deceasedName: []
                },
                {
                  id: 'fd60a75e-314e-4231-aab7-e6b71fb1106a',
                  type: 'Birth',
                  __typename: 'X',
                  registration: {
                    __typename: 'X',
                    status: 'CERTIFIED',
                    trackingId: 'B3DBJMP',
                    registrationNumber: '2019333494B3DBJMP5',
                    duplicates: null,
                    registeredLocationId: '308c35b4-04f8-4664-83f5-9790e790cde1'
                  },
                  dateOfBirth: '2008-01-01',
                  childName: [
                    {
                      __typename: 'X',
                      firstNames: 'Rafiq',
                      familyName: 'Islam'
                    },
                    {
                      __typename: 'X',
                      firstNames: 'রফিক',
                      familyName: 'ইসলাম'
                    }
                  ],

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
      }
    ]

    const testComponent = createTestComponent(
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
    const data = testComponent.component.find(DataTable).prop('data')
    expect(data).toEqual([
      {
        id: 'bc09200d-0160-43b4-9e2b-5b9e90424e95',
        name: 'ইলিয়াস খান',
        dob: '',
        dod: '01-01-2007',
        registrationNumber: '',
        trackingId: 'DW0UTHR',
        event: 'Death',
        declarationStatus: 'DECLARED',
        duplicates: ['308c35b4-04f8-4664-83f5-9790e790cd33'],
        rejectionReasons: '',
        rejectionComment: '',
        contactNumber: '',
        dateOfEvent: '2007-01-01',
        createdAt: undefined,
        modifiedAt: undefined
      },
      {
        id: 'c7e83060-4db9-4057-8b14-71841243b05f',
        name: 'জহির রায়হান',
        dob: '',
        dod: '01-01-2010',
        registrationNumber: '',
        trackingId: 'DXMJPYA',
        event: 'Death',
        declarationStatus: 'REJECTED',
        duplicates: [],
        rejectionReasons: '',
        rejectionComment: '',
        contactNumber: '',
        dateOfEvent: '2010-01-01',
        createdAt: undefined,
        modifiedAt: undefined
      },
      {
        id: '150dd4ca-6822-4f94-ad92-b9be037dec2f',
        name: 'ফকরুল ইসলাম',
        dob: '01-01-2010',
        dod: '',
        registrationNumber: '2019333494BQRZWDR2',
        duplicates: [],
        trackingId: 'BQRZWDR',
        event: 'Birth',
        declarationStatus: 'REGISTERED',
        rejectionReasons: '',
        rejectionComment: '',
        contactNumber: '',
        dateOfEvent: '2010-01-01',
        createdAt: undefined,
        modifiedAt: undefined
      },
      {
        id: 'fd60a75e-314e-4231-aab7-e6b71fb1106a',
        name: 'রফিক ইসলাম',
        dob: '01-01-2008',
        dod: '',
        registrationNumber: '2019333494B3DBJMP5',
        duplicates: [],
        trackingId: 'B3DBJMP',
        event: 'Birth',
        declarationStatus: 'CERTIFIED',
        rejectionReasons: '',
        rejectionComment: '',
        contactNumber: '',
        dateOfEvent: '2008-01-01',
        createdAt: undefined,
        modifiedAt: undefined
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
            locationIds: ['1234567s2323289'],
            sort: 'DESC',
            trackingId: 'DW0sdsHR',
            registrationNumber: '',
            contactNumber: ''
          }
        },
        error: new Error('boom')
      }
    ]

    const testComponent = createTestComponent(
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
    testComponent.component.debug()
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
            operationName: null,
            query: SEARCH_EVENTS,
            variables: {
              locationIds: ['123456789'],
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

      const testComponent = createTestComponent(
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

      testComponent.component.unmount()
    })

    it('renders error while expanded section can not load data', async () => {
      const graphqlMock = [
        {
          request: {
            operationName: null,
            query: SEARCH_EVENTS,
            variables: {
              locationIds: ['123456789'],
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

      const testComponent = createTestComponent(
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

      testComponent.component.unmount()
    })

    it('renders rejected section after expanding', async () => {
      const graphqlMock = [
        {
          request: {
            operationName: null,
            query: SEARCH_EVENTS,
            variables: {
              locationIds: ['123456789'],
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

      const testComponent = createTestComponent(
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

      testComponent.component.unmount()
    })

    it('renders registered section after expanding', async () => {
      const graphqlMock = [
        {
          request: {
            operationName: null,
            query: SEARCH_EVENTS,
            variables: {
              locationIds: ['123456789'],
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

      const testComponent = createTestComponent(
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

      testComponent.component.unmount()
    })

    it('renders collected section after expanding', async () => {
      const graphqlMock = [
        {
          request: {
            operationName: null,
            query: SEARCH_EVENTS,
            variables: {
              locationIds: ['123456789'],
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

      const testComponent = createTestComponent(
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

      testComponent.component.unmount()
    })

    it('check branches  using miscellaneous data', async () => {
      const graphqlMock = [
        {
          request: {
            operationName: null,
            query: SEARCH_EVENTS,
            variables: {
              locationIds: ['123456789'],
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

      const testComponent = createTestComponent(
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

      testComponent.component.unmount()
    })

    it('renders empty search page with a header in small devices', () => {
      const testSearchResultComponent = createTestComponent(
        // @ts-ignore
        <SearchResult match={{ params: {} }} />,
        store
      ).component

      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 200
      })
      store.dispatch(goToSearch())

      const searchTextInput = testSearchResultComponent
        .find('#searchText')
        .hostNodes()

      expect(searchTextInput).toHaveLength(1)

      searchTextInput.simulate('change', { target: { value: 'DW0UTHR' } })

      testSearchResultComponent
        .find('#searchIconButton')
        .hostNodes()
        .simulate('click')

      expect(window.location.pathname).toBe(
        '/search-result/tracking-id/DW0UTHR'
      )
    })
  })
})

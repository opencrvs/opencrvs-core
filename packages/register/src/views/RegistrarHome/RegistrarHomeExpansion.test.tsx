import * as React from 'react'
import { createTestComponent, mockUserResponse } from '@register/tests/util'
import { queries } from '@register/profile/queries'
import { merge } from 'lodash'
import { storage } from '@register/storage'
import { createStore } from '@register/store'
import {
  RegistrarHome,
  EVENT_STATUS
} from '@register/views/RegistrarHome/RegistrarHome'
import { GridTable } from '@opencrvs/components/lib/interface'
import {
  SEARCH_EVENTS,
  FETCH_REGISTRATION_BY_COMPOSITION,
  COUNT_REGISTRATION_QUERY
} from '@register/views/RegistrarHome/queries'
import { checkAuth } from '@register/profile/profileActions'
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

describe('RegistrarHome expansion related tests', () => {
  const { store } = createStore()

  beforeAll(() => {
    getItem.mockReturnValue(registerScopeToken)
    store.dispatch(checkAuth({ '?token': registerScopeToken }))
  })
  it('redirects to print form if print button is clicked', async () => {
    Date.now = jest.fn(() => 1554055200000)
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
            countEvents: {
              declared: 10,
              registered: 2,
              rejected: 5
            }
          }
        }
      },
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
                  id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8',
                  type: 'Birth',
                  registration: {
                    status: 'REGISTERED',
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
                      familyName: 'Khan',
                      use: 'en'
                    },
                    {
                      firstNames: 'ইলিয়াস',
                      familyName: 'খান',
                      use: 'bn'
                    }
                  ],
                  dateOfDeath: null,
                  deceasedName: null
                },
                {
                  id: 'bc09200d-0160-43b4-9e2b-5b9e90424e95',
                  type: 'Death',
                  registration: {
                    status: 'REGISTERED',
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
      setTimeout(resolve, 100)
    })
    testComponent.component.update()
    testComponent.component
      .find('#ListItemAction-e302f7c5-ad87-4117-91c1-35eaf2ea7be8-Print')
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
                      familyName: 'Khan',
                      use: 'en'
                    },
                    {
                      firstNames: 'ইলিয়াস',
                      familyName: 'খান',
                      use: 'bn'
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
                ],
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
                      familyName: 'Khan',
                      use: 'en'
                    },
                    {
                      firstNames: 'ইলিয়াস',
                      familyName: 'খান',
                      use: 'bn'
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
                ],
                contactPhoneNumber: '01622688231'
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
  it('renders expanded area for ready to print', async () => {
    Date.now = jest.fn(() => 1554055200000)
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
                  id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8',
                  type: 'Birth',
                  registration: {
                    status: 'REGISTERED',
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
                      familyName: 'Khan',
                      use: 'en'
                    },
                    {
                      firstNames: 'ইলিয়াস',
                      familyName: 'খান',
                      use: 'bn'
                    }
                  ],
                  dateOfDeath: null,
                  deceasedName: null
                },
                {
                  id: 'bc09200d-0160-43b4-9e2b-5b9e90424e95',
                  type: 'Death',
                  registration: {
                    status: 'REGISTERED',
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
                    type: 'REGISTERED',
                    comments: [
                      {
                        comment: 'reason=duplicate&comment=dup'
                      }
                    ]
                  }
                ],
                contactPhoneNumber: '01622688231'
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
      <RegistrarHome match={{ params: { tabId: 'print' } }} />,
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
    expect(
      testComponent.component.find('#REGISTERED-0').hostNodes().length
    ).toBe(1)
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
                      familyName: 'Khan',
                      use: 'en'
                    },
                    {
                      firstNames: 'ইলিয়াস',
                      familyName: 'খান',
                      use: 'bn'
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

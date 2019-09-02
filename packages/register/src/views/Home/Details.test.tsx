import * as React from 'react'
import {
  createTestComponent,
  mockUserResponse,
  fieldAgentScopeToken,
  registerScopeToken
} from '@register/tests/util'

import { FETCH_REGISTRATION_BY_COMPOSITION } from '@register/views/Home/queries'
import { queries } from '@register/profile/queries'
import { merge } from 'lodash'
import { storage } from '@register/storage'
import { createStore } from '@register/store'
import { FIELD_AGENT_ROLES, REGISTRAR_ROLES } from '@register/utils/constants'
import { checkAuth } from '@register/profile/profileActions'
import { Details } from '@register/views/Home/Details'
import {
  createApplication,
  storeApplication,
  modifyApplication,
  SUBMISSION_STATUS
} from '@register/applications'
import { Event } from '@register/forms'

const getItem = window.localStorage.getItem as jest.Mock
const mockFetchUserDetails = jest.fn()

const registrarNameObj = {
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
      role: REGISTRAR_ROLES[0]
    }
  }
}

const nameObj = {
  data: {
    getUser: {
      name: [
        {
          use: 'en',
          firstNames: 'Sakib',
          familyName: 'Al Hasan',
          __typename: 'HumanName'
        },
        { use: 'bn', firstNames: '', familyName: '', __typename: 'HumanName' }
      ],
      role: FIELD_AGENT_ROLES[0],
      practitionerId: '43ac3486-7df1-4bd9-9b5e-728054ccd6ba'
    }
  }
}

const defaultStatus = {
  id: '17e9b24-b00f-4a0f-a5a4-9c84c6e64e98/_history/86c3044a-329f-418',
  timestamp: '2019-04-03T07:08:24.936Z',
  user: {
    id: '153f8364-96b3-4b90-8527-bf2ec4a367bd',
    name: [
      {
        use: 'en',
        firstNames: 'Sakib',
        familyName: 'Al Hasan'
      },
      {
        use: 'bn',
        firstNames: '',
        familyName: ''
      }
    ],
    role: FIELD_AGENT_ROLES[0]
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

const registrarDefaultStatus = {
  id: '17e9b24-b00f-4a0f-a5a4-9c84c6e64e98/_history/86c3044a-329f-418',
  timestamp: '2019-04-03T07:08:24.936Z',
  user: {
    id: '153f8364-96b3-4b90-8527-bf2ec4a367bd',
    name: [
      {
        use: 'en',
        firstNames: 'Sakib',
        familyName: 'Al Hasan'
      },
      {
        use: 'bn',
        firstNames: '',
        familyName: ''
      }
    ],
    role: FIELD_AGENT_ROLES[0]
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

storage.getItem = jest.fn()
storage.setItem = jest.fn()

describe('Field Agnet tests', () => {
  const { store } = createStore()

  beforeAll(() => {
    merge(mockUserResponse, nameObj)
    mockFetchUserDetails.mockReturnValue(mockUserResponse)
    queries.fetchUserDetails = mockFetchUserDetails
    getItem.mockReturnValue(fieldAgentScopeToken)
    store.dispatch(checkAuth({ '?token': fieldAgentScopeToken }))
  })

  it('loads properly for draft application with create row', async () => {
    const draft = createApplication(Event.BIRTH)
    store.dispatch(storeApplication(draft))
    const testComponent = await createTestComponent(
      // @ts-ignore
      <Details
        match={{
          params: {
            applicationId: draft.id
          },
          isExact: true,
          path: '',
          url: ''
        }}
      />,
      store
    )

    expect(
      testComponent.component.find('#history_row_0_DRAFT_STARTED').hostNodes()
    ).toHaveLength(1)
    expect(
      testComponent.component.find('#history_row_1_DRAFT_MODIFIED').hostNodes()
    ).toHaveLength(0)
  })

  it('loads properly for draft application with create and update row', async () => {
    const draft = createApplication(Event.DEATH)
    store.dispatch(storeApplication(draft))
    // @ts-ignore
    draft.data.deceased = {
      familyNameEng: 'Anik'
    }
    store.dispatch(modifyApplication(draft))
    const testComponent = await createTestComponent(
      // @ts-ignore
      <Details
        match={{
          params: {
            applicationId: draft.id
          },
          isExact: true,
          path: '',
          url: ''
        }}
      />,
      store
    )

    expect(
      testComponent.component.find('#history_row_0_DRAFT_MODIFIED').hostNodes()
    ).toHaveLength(1)
    expect(
      testComponent.component.find('#history_row_1_DRAFT_STARTED').hostNodes()
    ).toHaveLength(1)
  })
  it('loads properly for failed application', async () => {
    const draft = createApplication(Event.DEATH)
    store.dispatch(storeApplication(draft))
    // @ts-ignore
    draft.data.deceased = {
      familyNameEng: 'Anik'
    }
    draft.submissionStatus = SUBMISSION_STATUS[SUBMISSION_STATUS.FAILED]
    store.dispatch(modifyApplication(draft))
    const testComponent = await createTestComponent(
      // @ts-ignore
      <Details
        match={{
          params: {
            applicationId: draft.id
          },
          isExact: true,
          path: '',
          url: ''
        }}
      />,
      store
    )

    expect(
      testComponent.component.find('#history_row_0_FAILED').hostNodes()
    ).toHaveLength(1)
    expect(
      testComponent.component.find('#failed_retry').hostNodes()
    ).toHaveLength(1)
  })
  it('loads properly for sent_for_review application', async () => {
    const graphqlMock = [
      {
        request: {
          query: FETCH_REGISTRATION_BY_COMPOSITION,
          variables: {
            id: '1'
          }
        },
        result: {
          data: {
            fetchRegistration: {
              id: '1',
              child: {
                name: [
                  {
                    use: 'en',
                    firstNames: '',
                    familyName: 'Anik'
                  },
                  {
                    use: 'bn',
                    firstNames: '',
                    familyName: 'অনিক'
                  }
                ]
              },
              // TODO: When fragmentMatching work is completed, remove unnecessary result objects
              // PR: https://github.com/jembi/OpenCRVS/pull/836/commits/6302fa8f015fe313cbce6197980f1300bf4eba32
              deceased: {
                name: []
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
              registration: {
                id: '1',
                type: 'birth',
                trackingId: 'BQRZWDR',
                contactPhoneNumber: '01622688231',
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
    const testComponent = await createTestComponent(
      // @ts-ignore
      <Details
        match={{
          params: {
            applicationId: '1'
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
      testComponent.component.find('#history_row_0_DECLARED').hostNodes()
    ).toHaveLength(1)
  })
  it('loads properly for required update application, and does not show update button for a field agent', async () => {
    const graphqlMock = [
      {
        request: {
          query: FETCH_REGISTRATION_BY_COMPOSITION,
          variables: {
            id: '1'
          }
        },
        result: {
          data: {
            fetchRegistration: {
              id: '1',
              // TODO: When fragmentMatching work is completed, remove unnecessary result objects
              // PR: https://github.com/jembi/OpenCRVS/pull/836/commits/6302fa8f015fe313cbce6197980f1300bf4eba32
              child: {
                name: [
                  {
                    use: 'en',
                    firstNames: '',
                    familyName: 'Anik'
                  },
                  {
                    use: 'bn',
                    firstNames: '',
                    familyName: 'অনিক'
                  }
                ]
              },
              deceased: {
                name: [
                  {
                    use: 'en',
                    firstNames: '',
                    familyName: 'Anik'
                  },
                  {
                    use: 'bn',
                    firstNames: '',
                    familyName: 'অনিক'
                  }
                ]
              },
              informant: {
                individual: {
                  telecom: [
                    {
                      use: '',
                      system: 'phone',
                      value: '01622688231'
                    }
                  ]
                }
              },
              registration: {
                id: '1',
                type: 'death',
                trackingId: 'DQRZWDR',
                contactPhoneNumber: '',
                status: [
                  {
                    ...defaultStatus,
                    type: 'REJECTED',
                    comments: [
                      {
                        comment: 'reason=duplicate&comment=dup'
                      }
                    ]
                  },
                  { ...defaultStatus, type: 'APPLICATION' }
                ]
              }
            }
          }
        }
      }
    ]
    const testComponent = await createTestComponent(
      // @ts-ignore
      <Details
        match={{
          params: {
            applicationId: '1'
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
      testComponent.component.find('#history_row_0_REJECTED').hostNodes()
    ).toHaveLength(1)
    expect(
      testComponent.component.find('#registrar_update').hostNodes()
    ).toHaveLength(0)
    expect(
      testComponent.component.find('#history_row_1_APPLICATION').hostNodes()
    ).toHaveLength(1)
  })
  it('loads history properly for all statuses of an application', async () => {
    const graphqlMock = [
      {
        request: {
          query: FETCH_REGISTRATION_BY_COMPOSITION,
          variables: {
            id: '1'
          }
        },
        result: {
          data: {
            fetchRegistration: {
              id: '1',
              deceased: {
                name: [
                  {
                    use: 'en',
                    firstNames: '',
                    familyName: 'Anik'
                  },
                  {
                    use: 'bn',
                    firstNames: '',
                    familyName: 'অনিক'
                  }
                ]
              },
              // TODO: When fragmentMatching work is completed, remove unnecessary result objects
              // PR: https://github.com/jembi/OpenCRVS/pull/836/commits/6302fa8f015fe313cbce6197980f1300bf4eba32
              child: {
                name: [
                  {
                    use: 'en',
                    firstNames: '',
                    familyName: 'Anik'
                  },
                  {
                    use: 'bn',
                    firstNames: '',
                    familyName: 'অনিক'
                  }
                ]
              },
              informant: {
                individual: {
                  telecom: [
                    {
                      use: '',
                      system: 'phone',
                      value: '01622688231'
                    }
                  ]
                }
              },
              registration: {
                id: '1',
                type: 'death',
                trackingId: 'DQRZWDR',
                contactPhoneNumber: '',
                status: [
                  {
                    ...defaultStatus,
                    type: 'CERTIFIED'
                  },
                  {
                    ...defaultStatus,
                    type: 'REGISTERED'
                  },
                  defaultStatus
                ]
              }
            }
          }
        }
      }
    ]
    const testComponent = await createTestComponent(
      // @ts-ignore
      <Details
        match={{
          params: {
            applicationId: '1'
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
      testComponent.component.find('#history_row_2_DECLARED').hostNodes()
    ).toHaveLength(1)
    expect(
      testComponent.component.find('#history_row_1_REGISTERED').hostNodes()
    ).toHaveLength(1)
    expect(
      testComponent.component.find('#history_row_0_CERTIFIED').hostNodes()
    ).toHaveLength(1)
  })
  it('loads successfuly with empty history ', async () => {
    const graphqlMock = [
      {
        request: {
          query: FETCH_REGISTRATION_BY_COMPOSITION,
          variables: {
            id: '1'
          }
        },
        result: {
          data: {
            fetchRegistration: {
              id: '1',
              registration: {
                id: '1',
                type: null,
                trackingId: null,
                contactPhoneNumber: null,
                status: [
                  {
                    id: '1',
                    timestamp: null,
                    user: null,
                    location: null,
                    office: null,
                    type: null,
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
      <Details
        match={{
          params: {
            applicationId: '1'
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
      testComponent.component.find('#sub_page_back_button').hostNodes()
    ).toHaveLength(1)
  })
})

describe('Registrar tests', () => {
  const { store } = createStore()

  beforeAll(() => {
    merge(mockUserResponse, registrarNameObj)
    mockFetchUserDetails.mockReturnValue(mockUserResponse)
    queries.fetchUserDetails = mockFetchUserDetails
  })

  it('Shows update button for a rejected application if the user is a registrar', async () => {
    const graphqlMock = [
      {
        request: {
          query: FETCH_REGISTRATION_BY_COMPOSITION,
          variables: {
            id: '1'
          }
        },
        result: {
          data: {
            fetchRegistration: {
              id: '1',
              // TODO: When fragmentMatching work is completed, remove unnecessary result objects
              // PR: https://github.com/jembi/OpenCRVS/pull/836/commits/6302fa8f015fe313cbce6197980f1300bf4eba32
              child: {
                name: [
                  {
                    use: 'en',
                    firstNames: '',
                    familyName: 'Anik'
                  },
                  {
                    use: 'bn',
                    firstNames: '',
                    familyName: 'অনিক'
                  }
                ]
              },
              deceased: {
                name: [
                  {
                    use: 'en',
                    firstNames: '',
                    familyName: 'Anik'
                  },
                  {
                    use: 'bn',
                    firstNames: '',
                    familyName: 'অনিক'
                  }
                ]
              },
              informant: {
                individual: {
                  telecom: [
                    {
                      use: '',
                      system: 'phone',
                      value: '01622688231'
                    }
                  ]
                }
              },
              registration: {
                id: '1',
                type: 'death',
                trackingId: 'DQRZWDR',
                contactPhoneNumber: '',
                status: [
                  {
                    ...registrarDefaultStatus,
                    type: 'REJECTED',
                    comments: [
                      {
                        comment: 'reason=duplicate&comment=dup'
                      }
                    ]
                  },
                  { ...registrarDefaultStatus, type: 'APPLICATION' }
                ]
              }
            }
          }
        }
      }
    ]
    const testComponent = await createTestComponent(
      // @ts-ignore
      <Details
        match={{
          params: {
            applicationId: '1'
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
    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 100)
    })
    getItem.mockReturnValue(registerScopeToken)
    testComponent.store.dispatch(checkAuth({ '?token': registerScopeToken }))

    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 100)
    })
    testComponent.component.update()
    expect(
      testComponent.component.find('#registrar_update').hostNodes()
    ).toHaveLength(1)
  })

  it('Shows print button for a registered application if the user is a registrar', async () => {
    const graphqlMock = [
      {
        request: {
          query: FETCH_REGISTRATION_BY_COMPOSITION,
          variables: {
            id: '1'
          }
        },
        result: {
          data: {
            fetchRegistration: {
              id: '1',
              // TODO: When fragmentMatching work is completed, remove unnecessary result objects
              // PR: https://github.com/jembi/OpenCRVS/pull/836/commits/6302fa8f015fe313cbce6197980f1300bf4eba32
              child: {
                name: [
                  {
                    use: 'en',
                    firstNames: '',
                    familyName: 'Anik'
                  },
                  {
                    use: 'bn',
                    firstNames: '',
                    familyName: 'অনিক'
                  }
                ]
              },
              deceased: {
                name: [
                  {
                    use: 'en',
                    firstNames: '',
                    familyName: 'Anik'
                  },
                  {
                    use: 'bn',
                    firstNames: '',
                    familyName: 'অনিক'
                  }
                ]
              },
              informant: {
                individual: {
                  telecom: [
                    {
                      use: '',
                      system: 'phone',
                      value: '01622688231'
                    }
                  ]
                }
              },
              registration: {
                id: '1',
                type: 'death',
                trackingId: 'DQRZWDR',
                contactPhoneNumber: '',
                status: [
                  {
                    ...registrarDefaultStatus,
                    type: 'REGISTERED',
                    comments: [
                      {
                        comment: 'reason=duplicate&comment=dup'
                      }
                    ]
                  },
                  { ...registrarDefaultStatus, type: 'APPLICATION' }
                ]
              }
            }
          }
        }
      }
    ]
    const testComponent = await createTestComponent(
      // @ts-ignore
      <Details
        match={{
          params: {
            applicationId: '1'
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
    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 100)
    })
    getItem.mockReturnValue(registerScopeToken)
    testComponent.store.dispatch(checkAuth({ '?token': registerScopeToken }))

    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 100)
    })
    testComponent.component.update()
    expect(
      testComponent.component.find('#registrar_print').hostNodes()
    ).toHaveLength(1)
  })

  it('Renders error page in-case of any network error', async () => {
    const graphqlMock = [
      {
        request: {
          query: FETCH_REGISTRATION_BY_COMPOSITION,
          variables: {
            id: '1'
          }
        },
        error: new Error('boom')
      }
    ]
    try {
      await createTestComponent(
        // @ts-ignore
        <Details
          match={{
            params: {
              applicationId: '1'
            },
            isExact: true,
            path: '',
            url: ''
          }}
        />,
        store,
        graphqlMock
      )
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })
})

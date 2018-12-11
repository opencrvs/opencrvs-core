import * as React from 'react'
import { WorkQueue, FETCH_REGISTRATION_QUERY } from './WorkQueue'
import { createTestComponent, mockUserResponse } from 'src/tests/util'
import { createStore } from 'src/store'
import {
  Spinner,
  DataTable,
  ListItem
} from '@opencrvs/components/lib/interface'
import { checkAuth } from '@opencrvs/register/src/profile/profileActions'
import { queries } from 'src/profile/queries'

const declareScope =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJpYXQiOjE1MzMxOTUyMjgsImV4cCI6MTU0MzE5NTIyNywiYXVkIjpbImdhdGV3YXkiXSwic3ViIjoiMSJ9.G4KzkaIsW8fTkkF-O8DI0qESKeBI332UFlTXRis3vJ6daisu06W5cZsgYhmxhx_n0Q27cBYt2OSOnjgR72KGA5IAAfMbAJifCul8ib57R4VJN8I90RWqtvA0qGjV-sPndnQdmXzCJx-RTumzvr_vKPgNDmHzLFNYpQxcmQHA-N8li-QHMTzBHU4s9y8_5JOCkudeoTMOd_1021EDAQbrhonji5V1EOSY2woV5nMHhmq166I1L0K_29ngmCqQZYi1t6QBonsIowlXJvKmjOH5vXHdCCJIFnmwHmII4BK-ivcXeiVOEM_ibfxMWkAeTRHDshOiErBFeEvqd6VWzKvbKAH0UY-Rvnbh4FbprmO4u4_6Yd2y2HnbweSo-v76dVNcvUS0GFLFdVBt0xTay-mIeDy8CKyzNDOWhmNUvtVi9mhbXYfzzEkwvi9cWwT1M8ZrsWsvsqqQbkRCyBmey_ysvVb5akuabenpPsTAjiR8-XU2mdceTKqJTwbMU5gz-8fgulbTB_9TNJXqQlH7tyYXMWHUY3uiVHWg2xgjRiGaXGTiDgZd01smYsxhVnPAddQOhqZYCrAgVcT1GBFVvhO7CC-rhtNlLl21YThNNZNpJHsCgg31WA9gMQ_2qAJmw2135fAyylO8q7ozRUvx46EezZiPzhCkPMeELzLhQMEIqjo'

const registerScopeToken =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWdpc3RlciIsImNlcnRpZnkiLCJkZW1vIl0sImlhdCI6MTU0MjY4ODc3MCwiZXhwIjoxNTQzMjkzNTcwLCJhdWQiOlsib3BlbmNydnM6YXV0aC11c2VyIiwib3BlbmNydnM6dXNlci1tZ250LXVzZXIiLCJvcGVuY3J2czpoZWFydGgtdXNlciIsIm9wZW5jcnZzOmdhdGV3YXktdXNlciIsIm9wZW5jcnZzOm5vdGlmaWNhdGlvbi11c2VyIiwib3BlbmNydnM6d29ya2Zsb3ctdXNlciJdLCJpc3MiOiJvcGVuY3J2czphdXRoLXNlcnZpY2UiLCJzdWIiOiI1YmVhYWY2MDg0ZmRjNDc5MTA3ZjI5OGMifQ.ElQd99Lu7WFX3L_0RecU_Q7-WZClztdNpepo7deNHqzro-Cog4WLN7RW3ZS5PuQtMaiOq1tCb-Fm3h7t4l4KDJgvC11OyT7jD6R2s2OleoRVm3Mcw5LPYuUVHt64lR_moex0x_bCqS72iZmjrjS-fNlnWK5zHfYAjF2PWKceMTGk6wnI9N49f6VwwkinJcwJi6ylsjVkylNbutQZO0qTc7HRP-cBfAzNcKD37FqTRNpVSvHdzQSNcs7oiv3kInDN5aNa2536XSd3H-RiKR9hm9eID9bSIJgFIGzkWRd5jnoYxT70G0t03_mTVnDnqPXDtyI-lmerx24Ost0rQLUNIg'
const getItem = window.localStorage.getItem as jest.Mock
const mockFetchUserDetails = jest.fn()
mockFetchUserDetails.mockReturnValue(mockUserResponse)
queries.fetchUserDetails = mockFetchUserDetails

describe('WorkQueue tests', async () => {
  const { store } = createStore()
  it('sets loading state while waiting for data', () => {
    const testComponent = createTestComponent(
      // @ts-ignore
      <WorkQueue />,
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
            locationIds: ['123456789']
          }
        },
        result: {
          data: {
            listBirthRegistrations: [
              {
                id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8',
                registration: {
                  trackingId: 'B111111',
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
                        name: 'Kaliganj Union Sub Center',
                        alias: ['']
                      },
                      type: 'REGISTERED'
                    }
                  ]
                },
                child: {
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
              },
              {
                id: 'cc66d69c-7f0a-4047-9283-f066571830f1',
                registration: {
                  trackingId: 'B222222',
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
                        name: 'Kaliganj Union Sub Center',
                        alias: ['']
                      },
                      type: 'REGISTERED'
                    }
                  ]
                },
                child: {
                  name: [
                    {
                      use: 'en',
                      firstNames: 'Baby',
                      familyName: 'Smith'
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
    ]

    const testComponent = createTestComponent(
      // @ts-ignore
      <WorkQueue />,
      store,
      graphqlMock
    )

    getItem.mockReturnValue(declareScope)
    testComponent.store.dispatch(checkAuth({ '?token': declareScope }))

    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 0)
    })
    testComponent.component.update()
    const data = testComponent.component.find(DataTable).prop('data')
    expect(data).toEqual([
      {
        id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8',
        name: 'Baby Doe',
        dob: '',
        date_of_application: '2018-05-23',
        tracking_id: 'B111111',
        createdAt: '2018-05-23T14:44:58+02:00',
        declaration_status: 'REGISTERED',
        event: 'birth',
        status: [
          {
            location: 'Kaliganj Union Sub Center',
            timestamp: '2018-12-07',
            type: 'REGISTERED',
            practitionerName: 'Mohammad Ashraful',
            practitionerRole: 'LOCAL_REGISTRAR'
          }
        ],
        location: 'Kaliganj Union Sub Center'
      },
      {
        id: 'cc66d69c-7f0a-4047-9283-f066571830f1',
        name: 'Baby Smith',
        dob: '',
        date_of_application: '2018-05-23',
        tracking_id: 'B222222',
        createdAt: '2018-05-23T14:44:58+02:00',
        declaration_status: 'REGISTERED',
        event: 'birth',
        status: [
          {
            location: 'Kaliganj Union Sub Center',
            timestamp: '2018-12-07',
            type: 'REGISTERED',
            practitionerName: 'Mohammad Ashraful',
            practitionerRole: 'LOCAL_REGISTRAR'
          }
        ],
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
            locationIds: ['123456789']
          }
        },
        error: new Error('boom')
      }
    ]

    const testComponent = createTestComponent(
      // @ts-ignore
      <WorkQueue />,
      store,
      graphqlMock
    )

    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 0)
    })

    testComponent.component.update()

    expect(
      testComponent.component
        .find('#work-queue-error-text')
        .children()
        .text()
    ).toBe('An error occurred while searching')

    testComponent.component.unmount()
  })

  describe('WorkQueue tests for register scope', () => {
    beforeAll(() => {
      getItem.mockReturnValue(registerScopeToken)
      store.dispatch(checkAuth({ '?token': registerScopeToken }))
    })
    it('renders review and register button for user with register scope', async () => {
      const graphqlMock = [
        {
          request: {
            query: FETCH_REGISTRATION_QUERY,
            variables: {
              locationIds: ['123456789']
            }
          },
          result: {
            data: {
              listBirthRegistrations: [
                {
                  id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8',
                  registration: {
                    trackingId: 'B111111',
                    status: [
                      {
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
                          name: 'Kaliganj Union Sub Center',
                          alias: ['']
                        },
                        type: 'REGISTERED'
                      }
                    ]
                  },
                  child: {
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
      ]

      const testComponent = createTestComponent(
        // @ts-ignore
        <WorkQueue />,
        store,
        graphqlMock
      )

      // wait for mocked data to load mockedProvider
      await new Promise(resolve => {
        setTimeout(resolve, 0)
      })

      testComponent.component.update()
      const instance = testComponent.component
        .find(DataTable)
        .find(ListItem)
        .instance() as any

      instance.toggleExpanded()
      testComponent.component.update()

      expect(
        testComponent.component
          .find(DataTable)
          .find('#reviewAndRegisterBtn_B111111')
          .hostNodes().length
      ).toBe(1)
      testComponent.component
        .find(DataTable)
        .find('#reviewAndRegisterBtn_B111111')
        .hostNodes()
        .simulate('click')

      testComponent.component
        .find(DataTable)
        .find('button')
        .at(1)
        .hostNodes()
        .simulate('click')

      expect(
        testComponent.component
          .find('#new_registration')
          .hostNodes()
          .text()
      ).toContain('New birth registration')

      testComponent.component.unmount()
    })
  })

  describe('WorkQueue tests for declare scope', () => {
    beforeAll(() => {
      getItem.mockReturnValue(declareScope)
      store.dispatch(checkAuth({ '?token': declareScope }))
    })
    it('does not render review and register button for user with declare scope', async () => {
      const graphqlMock = [
        {
          request: {
            query: FETCH_REGISTRATION_QUERY,
            variables: {
              locationIds: ['123456789']
            }
          },
          result: {
            data: {
              listBirthRegistrations: [
                {
                  id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8',
                  registration: {
                    trackingId: 'B111111',
                    status: [
                      {
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
                          name: 'Kaliganj Union Sub Center',
                          alias: ['']
                        },
                        type: 'REGISTERED'
                      }
                    ]
                  },
                  child: {
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
      ]

      const testComponent = createTestComponent(
        // @ts-ignore
        <WorkQueue />,
        store,
        graphqlMock
      )

      // wait for mocked data to load mockedProvider
      await new Promise(resolve => {
        setTimeout(resolve, 0)
      })

      testComponent.component.update()

      const instance = testComponent.component
        .find(DataTable)
        .find(ListItem)
        .instance() as any

      instance.toggleExpanded()
      testComponent.component.update()

      expect(
        testComponent.component
          .find(DataTable)
          .find('#reviewAndRegisterBtn_B111111')
          .hostNodes().length
      ).toBe(0)

      testComponent.component
        .find(DataTable)
        .find('button')
        .at(0)
        .simulate('click')

      expect(
        testComponent.component
          .find('#new_registration')
          .hostNodes()
          .text()
      ).toContain('New birth application')

      testComponent.component.unmount()
    })
  })
})

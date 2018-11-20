import * as React from 'react'
import { WorkQueue, FETCH_REGISTRATION_QUERY } from './WorkQueue'
import { createTestComponent } from 'src/tests/util'
import { createStore } from 'src/store'
import {
  Spinner,
  DataTable,
  ListItem
} from '@opencrvs/components/lib/interface'
import { checkAuth } from '@opencrvs/register/src/profile/profileActions'

const registerScopeToken =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWdpc3RlciIsImNlcnRpZnkiLCJkZW1vIl0sImlhdCI6MTU0MjY4ODc3MCwiZXhwIjoxNTQzMjkzNTcwLCJhdWQiOlsib3BlbmNydnM6YXV0aC11c2VyIiwib3BlbmNydnM6dXNlci1tZ250LXVzZXIiLCJvcGVuY3J2czpoZWFydGgtdXNlciIsIm9wZW5jcnZzOmdhdGV3YXktdXNlciIsIm9wZW5jcnZzOm5vdGlmaWNhdGlvbi11c2VyIiwib3BlbmNydnM6d29ya2Zsb3ctdXNlciJdLCJpc3MiOiJvcGVuY3J2czphdXRoLXNlcnZpY2UiLCJzdWIiOiI1YmVhYWY2MDg0ZmRjNDc5MTA3ZjI5OGMifQ.ElQd99Lu7WFX3L_0RecU_Q7-WZClztdNpepo7deNHqzro-Cog4WLN7RW3ZS5PuQtMaiOq1tCb-Fm3h7t4l4KDJgvC11OyT7jD6R2s2OleoRVm3Mcw5LPYuUVHt64lR_moex0x_bCqS72iZmjrjS-fNlnWK5zHfYAjF2PWKceMTGk6wnI9N49f6VwwkinJcwJi6ylsjVkylNbutQZO0qTc7HRP-cBfAzNcKD37FqTRNpVSvHdzQSNcs7oiv3kInDN5aNa2536XSd3H-RiKR9hm9eID9bSIJgFIGzkWRd5jnoYxT70G0t03_mTVnDnqPXDtyI-lmerx24Ost0rQLUNIg'
const getItem = window.localStorage.getItem as jest.Mock

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
          query: FETCH_REGISTRATION_QUERY
        },
        result: {
          data: {
            listBirthRegistrations: [
              {
                id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8',
                registration: {
                  trackingId: 'B111111'
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
                  trackingId: 'B222222'
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

    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 0)
    })

    testComponent.component.update()
    const data = testComponent.component.find(DataTable).prop('data')
    expect(data).toEqual([
      {
        name: 'Baby Doe',
        dob: '',
        date_of_application: '2018-05-23',
        tracking_id: 'B111111',
        createdAt: '2018-05-23T14:44:58+02:00',
        declaration_status: 'application',
        event: 'birth',
        location: ''
      },
      {
        name: 'Baby Smith',
        dob: '',
        date_of_application: '2018-05-23',
        tracking_id: 'B222222',
        createdAt: '2018-05-23T14:44:58+02:00',
        declaration_status: 'application',
        event: 'birth',
        location: ''
      }
    ])

    testComponent.component.unmount()
  })

  it('renders error text when an error occurs', async () => {
    const graphqlMock = [
      {
        request: {
          query: FETCH_REGISTRATION_QUERY
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
            query: FETCH_REGISTRATION_QUERY
          },
          result: {
            data: {
              listBirthRegistrations: [
                {
                  id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8',
                  registration: {
                    trackingId: 'B111111'
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

      testComponent.component.unmount()
    })
  })
})

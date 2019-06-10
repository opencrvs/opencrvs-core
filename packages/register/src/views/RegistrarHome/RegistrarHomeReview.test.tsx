import * as React from 'react'
import { createTestComponent, mockUserResponse } from '@register/tests/util'
import { queries } from '@register/profile/queries'
import { merge } from 'lodash'
import { v4 as uuid } from 'uuid'

import { storage } from '@register/storage'
import { createStore } from '@register/store'
import {
  RegistrarHome,
  EVENT_STATUS
} from '@register/views/RegistrarHome/RegistrarHome'
import { Spinner, GridTable } from '@opencrvs/components/lib/interface'
import {
  COUNT_REGISTRATION_QUERY,
  FETCH_REGISTRATIONS_QUERY
} from '@register/views/RegistrarHome/queries'
import { checkAuth } from '@register/profile/profileActions'
import {
  storeApplication,
  createReviewApplication
} from '@register/applications'
import { Event } from '@register/forms'
import moment from 'moment'

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

describe('RegistrarHome tests', () => {
  const { store } = createStore()

  beforeAll(() => {
    getItem.mockReturnValue(registerScopeToken)
    store.dispatch(checkAuth({ '?token': registerScopeToken }))
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
})

import * as React from 'react'
import { createTestComponent } from 'src/tests/util'
import { queries } from 'src/profile/queries'
import { merge } from 'lodash'
import { v4 as uuid } from 'uuid'
import { mockUserResponse } from 'src/tests/util'
import { storage } from 'src/storage'
import { createStore } from 'src/store'
import { WorkQueue } from './WorkQueue'
import { Spinner } from '@opencrvs/components/lib/interface'
import { COUNT_REGISTRATION_QUERY } from './queries'
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
})

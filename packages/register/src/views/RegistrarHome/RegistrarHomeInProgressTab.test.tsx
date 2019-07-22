import * as React from 'react'
import { createTestComponent, mockUserResponse } from '@register/tests/util'
import { queries } from '@register/profile/queries'
import { merge } from 'lodash'
import { storage } from '@register/storage'
import { createStore } from '@register/store'
import { RegistrarHome } from '@register/views/RegistrarHome/RegistrarHome'
import { Spinner, GridTable } from '@opencrvs/components/lib/interface'
import { COUNT_REGISTRATION_QUERY } from '@register/views/RegistrarHome/queries'
import { checkAuth } from '@register/profile/profileActions'
import {
  SUBMISSION_STATUS,
  storeApplication,
  createApplication
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
merge(mockUserResponse, nameObj)
mockFetchUserDetails.mockReturnValue(mockUserResponse)
queries.fetchUserDetails = mockFetchUserDetails

storage.getItem = jest.fn()
storage.setItem = jest.fn()

describe('RegistrarHome In Progress tab related tests', () => {
  const { store } = createStore()
  beforeAll(() => {
    getItem.mockReturnValue(registerScopeToken)
    store.dispatch(checkAuth({ '?token': registerScopeToken }))
  })

  it('sets loading state while waiting for data', () => {
    const testComponent = createTestComponent(
      // @ts-ignore
      <RegistrarHome
        match={{
          params: {
            tabId: 'progress'
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

  it('renders page with four tabs', async () => {
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
              registered: 7,
              rejected: 5
            }
          }
        }
      }
    ]
    store.dispatch(storeApplication(createApplication(Event.BIRTH)))
    const testComponent = createTestComponent(
      // @ts-ignore
      <RegistrarHome match={{ params: { tabId: 'progress' } }} />,
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
    app
      .find('#tab_print')
      .hostNodes()
      .simulate('click')
    testComponent.component.unmount()
  })

  it('renders all items returned from graphql query in inProgress tab', async () => {
    Date.now = jest.fn(() => 1554055200000)
    const { store } = createStore()
    const TIME_STAMP = '2018-12-07T13:11:49.380Z'
    const drafts = [
      {
        id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8',
        event: 'birth',
        modifiedOn: TIME_STAMP,
        submissionStatus: SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT],
        data: {
          child: {
            firstNamesEng: 'Anik',
            firstNames: 'অনিক',
            familyNameEng: 'Hoque',
            familyName: 'অনিক'
          }
        }
      },
      {
        id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8',
        event: 'birth',
        modifiedOn: TIME_STAMP,
        submissionStatus: SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT],
        data: {
          child: {
            firstNames: 'অনিক',
            familyName: 'অনিক'
          }
        }
      },
      {
        id: 'cc66d69c-7f0a-4047-9283-f066571830f1',
        event: 'death',
        modifiedOn: TIME_STAMP,
        submissionStatus: SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT],
        data: {
          deceased: {
            firstNamesEng: 'Anik',
            firstNames: 'অনিক',
            familyNameEng: 'Hoque',
            familyName: 'অনিক'
          }
        }
      },
      {
        id: 'cc66d69c-7f0a-4047-9283-f066571830f1',
        event: 'death',
        modifiedOn: TIME_STAMP,
        submissionStatus: SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT],
        data: {
          deceased: {
            firstNames: 'অনিক',
            familyName: 'অনিক'
          }
        }
      }
    ]
    // @ts-ignore
    store.dispatch(storeApplication(drafts))
    const testComponent = createTestComponent(
      // @ts-ignore
      <RegistrarHome match={{ params: { tabId: 'progress' } }} />,
      store
    )

    getItem.mockReturnValue(registerScopeToken)
    testComponent.store.dispatch(checkAuth({ '?token': registerScopeToken }))

    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 100)
    })
    testComponent.component.update()
    const data = testComponent.component.find(GridTable).prop('content')
    Date.now = jest.fn(() => 1563732000000) // 2019-07-21
    const EXPECTED_DATE_OF_REJECTION = moment(
      TIME_STAMP,
      'YYYY-MM-DD'
    ).fromNow()

    expect(data[0].id).toBe('e302f7c5-ad87-4117-91c1-35eaf2ea7be8')
    expect(data[0].name).toBe('Anik Hoque')
    expect(data[0].dateOfModification).toBe(EXPECTED_DATE_OF_REJECTION)
    expect(data[0].event).toBe('Birth')
    expect(data[0].actions).toBeDefined()

    testComponent.component.unmount()
  })

  it('Should render pagination in progress tab if data is more than 10', async () => {
    jest.clearAllMocks()
    for (let i = 0; i < 12; i++) {
      store.dispatch(storeApplication(createApplication(Event.BIRTH)))
    }
    const testComponent = createTestComponent(
      // @ts-ignore
      <RegistrarHome
        match={{
          params: {
            tabId: 'progress'
          },
          isExact: true,
          path: '',
          url: ''
        }}
      />,
      store
    )

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

  it('redirects user to draft preview page on update click', async () => {
    const { store } = createStore()
    const TIME_STAMP = '2018-12-07T13:11:49.380Z'
    const drafts = [
      {
        id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8',
        event: 'birth',
        modifiedOn: TIME_STAMP,
        submissionStatus: SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT],
        data: {
          child: {
            firstNamesEng: 'Anik',
            firstNames: 'অনিক',
            familyNameEng: 'Hoque',
            familyName: 'অনিক'
          }
        }
      },
      {
        id: 'bd22s7c5-ad87-4117-91c1-35eaf2ese32bw',
        event: 'birth',
        submissionStatus: SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT],
        data: {
          child: {
            familyNameEng: 'Hoque'
          }
        }
      },
      {
        id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be9',
        event: 'birth',
        modifiedOn: TIME_STAMP,
        submissionStatus: SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT],
        data: {
          child: {
            familyName: 'অনিক'
          }
        }
      },
      {
        id: 'cc66d69c-7f0a-4047-9283-f066571830f1',
        event: 'death',
        modifiedOn: TIME_STAMP,
        submissionStatus: SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT],
        data: {
          deceased: {
            firstNamesEng: 'Anik',
            firstNames: 'অনিক',
            familyNameEng: 'Hoque',
            familyName: 'অনিক'
          }
        }
      },
      {
        id: 'cc66d69c-7f0a-4047-9283-f066571830f2',
        event: 'death',
        modifiedOn: TIME_STAMP,
        submissionStatus: SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT],
        data: {
          deceased: {
            familyNameEng: 'Hoque'
          }
        }
      },
      {
        id: 'cc66d69c-7f0a-4047-9283-f066571830f3',
        event: 'death',
        modifiedOn: TIME_STAMP,
        submissionStatus: SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT],
        data: {
          deceased: {
            familyName: 'অনিক'
          }
        }
      },
      {
        id: 'cc66d69c-7f0a-4047-9283-f066571830f4',
        event: 'death',
        modifiedOn: TIME_STAMP,
        submissionStatus: SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT]
      }
    ]
    // @ts-ignore
    store.dispatch(storeApplication(drafts))
    const testComponent = createTestComponent(
      // @ts-ignore
      <RegistrarHome match={{ params: { tabId: 'progress' } }} />,
      store
    )

    getItem.mockReturnValue(registerScopeToken)
    testComponent.store.dispatch(checkAuth({ '?token': registerScopeToken }))

    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 100)
    })
    testComponent.component.update()
    expect(
      testComponent.component.find('#ListItemAction-0-Update').hostNodes()
    ).toHaveLength(1)
    testComponent.component
      .find('#ListItemAction-0-Update')
      .hostNodes()
      .simulate('click')

    await new Promise(resolve => {
      setTimeout(resolve, 100)
    })
    testComponent.component.update()

    expect(window.location.href).toContain(
      '/drafts/e302f7c5-ad87-4117-91c1-35eaf2ea7be8'
    )
    testComponent.component.unmount()
  })
})

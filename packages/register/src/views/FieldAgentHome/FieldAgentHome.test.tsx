import * as React from 'react'
import {
  createTestComponent,
  validToken,
  flushPromises,
  mockApplicationData,
  mockUserResponse
} from '@register/tests/util'
import { ReactWrapper } from 'enzyme'
import { storage } from '@register/storage'
import { FIELD_AGENT_ROLES } from '@register/utils/constants'
import { FieldAgentHome } from '@register/views/FieldAgentHome/FieldAgentHome'
import { storeApplication, SUBMISSION_STATUS } from '@register/applications'
import uuid from 'uuid'
import { Event } from '@register/forms'
import { queries } from '@register/profile/queries'
import { merge } from 'lodash'
import { createStore } from '@register/store'
import { checkAuth } from '@register/profile/profileActions'
import { EVENT_STATUS } from '@register/views/RegistrarHome/RegistrarHome'
import {
  COUNT_USER_WISE_APPLICATIONS,
  SEARCH_APPLICATIONS_USER_WISE
} from '@register/search/queries'

const getItem = window.localStorage.getItem as jest.Mock

const mockFetchUserDetails = jest.fn()

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

const countQueryGraphqlMock = {
  request: {
    query: COUNT_USER_WISE_APPLICATIONS,
    variables: {
      userId: nameObj.data.getUser.practitionerId,
      status: EVENT_STATUS.REJECTED,
      locationIds: ['123456789']
    }
  },
  result: {
    data: {
      searchEvents: {
        totalItems: 1
      }
    }
  }
}

merge(mockUserResponse, nameObj)
mockFetchUserDetails.mockReturnValue(mockUserResponse)
queries.fetchUserDetails = mockFetchUserDetails

storage.getItem = jest.fn()
storage.setItem = jest.fn()

describe('FieldAgentHome tests', () => {
  const { store } = createStore()

  beforeAll(() => {
    getItem.mockReturnValue(validToken)
    store.dispatch(checkAuth({ '?token': validToken }))
  })

  it('renders loading icon while loading page', async () => {
    const testComponent = createTestComponent(
      // @ts-ignore
      <FieldAgentHome
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
      [countQueryGraphqlMock]
    )

    testComponent.component.update()
    const app = testComponent.component
    expect(app.find('#field-agent-home-spinner').hostNodes()).toHaveLength(1)
  })

  it('renders error text when an error occurs', async () => {
    const graphqlMock = [
      {
        request: {
          query: COUNT_USER_WISE_APPLICATIONS,
          variables: {
            status: EVENT_STATUS.REJECTED,
            locationIds: ['123456789']
          }
        },
        error: new Error('boom')
      }
    ]

    const testComponent = createTestComponent(
      // @ts-ignore
      <FieldAgentHome
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

    const app = testComponent.component.update()

    expect(app.find('#field-agent-home_error').hostNodes()).toHaveLength(1)

    testComponent.component.unmount()
  })

  it('renders page with three tabs', async () => {
    const testComponent = createTestComponent(
      // @ts-ignore
      <FieldAgentHome
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
      [countQueryGraphqlMock]
    )

    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 100)
    })

    testComponent.component.update()
    const app = testComponent.component
    expect(app.find('#top-bar').hostNodes()).toHaveLength(1)
    expect(app.find('#tab_progress').hostNodes()).toHaveLength(1)
    expect(app.find('#tab_review').hostNodes()).toHaveLength(1)
    expect(app.find('#tab_updates').hostNodes()).toHaveLength(1)
  })

  it('when user clicks the floating action button', async () => {
    const testComponent = createTestComponent(
      // @ts-ignore
      <FieldAgentHome
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
      [countQueryGraphqlMock]
    )

    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 100)
    })

    testComponent.component.update()
    testComponent.component
      .find('#new_event_declaration')
      .hostNodes()
      .simulate('click')

    expect(window.location.href).toContain('event')
  })

  it('renders require for updates section while on updates tab', async () => {
    const requireUpdatesMock = {
      request: {
        query: SEARCH_APPLICATIONS_USER_WISE,
        variables: {
          userId: nameObj.data.getUser.practitionerId,
          status: EVENT_STATUS.REJECTED,
          locationIds: ['123456789'],
          count: 10,
          skip: 0
        }
      },
      result: {
        data: {
          searchEvents: {
            totalItems: 1,
            results: [
              {
                id: '613da949-db8c-49ad-94b4-631ab0b7503e',
                type: 'Birth',
                registration: {
                  dateOfApplication: '2019-05-22T10:22:21.840Z',
                  status: 'REJECTED'
                },
                childName: [
                  {
                    use: 'en',
                    firstNames: 'Gayatri',
                    familyName: 'Spivak'
                  },
                  {
                    use: 'bn',
                    firstNames: 'গায়ত্রী',
                    familyName: 'স্পিভক'
                  }
                ],
                // TODO: need to remove this once fragement type issue is resolved
                deceasedName: [
                  {
                    use: 'en',
                    firstNames: 'Gayatri',
                    familyName: 'Spivak'
                  },
                  {
                    use: 'bn',
                    firstNames: 'গায়ত্রী',
                    familyName: 'স্পিভক'
                  }
                ]
              }
            ]
          }
        }
      }
    }
    const testComponent = createTestComponent(
      // @ts-ignore
      <FieldAgentHome
        match={{
          params: {
            tabId: 'updates'
          },
          isExact: true,
          path: '',
          url: ''
        }}
      />,
      store,
      [countQueryGraphqlMock, requireUpdatesMock]
    )

    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 100)
    })

    testComponent.component.update()
    const app = testComponent.component
    expect(app.find('#require_updates_list').hostNodes()).toHaveLength(1)
  })

  it('render application details page after clicking require for updates applications', async () => {
    const requireUpdatesMock = {
      request: {
        query: SEARCH_APPLICATIONS_USER_WISE,
        variables: {
          userId: nameObj.data.getUser.practitionerId,
          status: EVENT_STATUS.REJECTED,
          locationIds: ['123456789'],
          count: 10,
          skip: 0
        }
      },
      result: {
        data: {
          searchEvents: {
            totalItems: 1,
            results: [
              {
                id: '613da949-db8c-49ad-94b4-631ab0b7503e',
                type: 'Birth',
                registration: {
                  dateOfApplication: '2019-05-22T10:22:21.840Z',
                  status: 'REJECTED'
                },
                childName: [
                  {
                    use: 'en',
                    firstNames: 'Gayatri',
                    familyName: 'Spivak'
                  },
                  {
                    use: 'bn',
                    firstNames: 'গায়ত্রী',
                    familyName: 'স্পিভক'
                  }
                ],
                // TODO: need to remove this once fragement type issue is resolved
                deceasedName: [
                  {
                    use: 'en',
                    firstNames: 'Gayatri',
                    familyName: 'Spivak'
                  },
                  {
                    use: 'bn',
                    firstNames: 'গায়ত্রী',
                    familyName: 'স্পিভক'
                  }
                ]
              }
            ]
          }
        }
      }
    }
    const testComponent = createTestComponent(
      // @ts-ignore
      <FieldAgentHome
        match={{
          params: {
            tabId: 'updates'
          },
          isExact: true,
          path: '',
          url: ''
        }}
      />,
      store,
      [countQueryGraphqlMock, requireUpdatesMock]
    )

    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 100)
    })

    testComponent.component.update()
    testComponent.component
      .find('#row_0')
      .hostNodes()
      .simulate('click')

    expect(window.location.href).toContain(
      'details/613da949-db8c-49ad-94b4-631ab0b7503e'
    )
  })

  it('when user clicks the sent for review tab', async () => {
    const testComponent = createTestComponent(
      // @ts-ignore
      <FieldAgentHome
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
      [countQueryGraphqlMock]
    )

    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 100)
    })

    testComponent.component.update()
    testComponent.component
      .find('#tab_review')
      .hostNodes()
      .simulate('click')
    await flushPromises()

    testComponent.component.update()
    expect(window.location.href).toContain('field-agent-home/review')
  })

  it('when user clicks the sent for updates tab', async () => {
    const testComponent = createTestComponent(
      // @ts-ignore
      <FieldAgentHome
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
      [countQueryGraphqlMock]
    )

    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 100)
    })

    testComponent.component.update()
    testComponent.component
      .find('#tab_updates')
      .hostNodes()
      .simulate('click')
    await flushPromises()

    testComponent.component.update()
    expect(window.location.href).toContain('field-agent-home/updates')
  })

  it('when user clicks the sent for inprogress tab', async () => {
    const testComponent = createTestComponent(
      // @ts-ignore
      <FieldAgentHome
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
      [countQueryGraphqlMock]
    )

    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 100)
    })

    testComponent.component.update()
    testComponent.component
      .find('#tab_progress')
      .hostNodes()
      .simulate('click')
    await flushPromises()

    testComponent.component.update()
    expect(window.location.href).toContain('field-agent-home/progress')
  })

  describe('when user is in sent for review tab', () => {
    let component: ReactWrapper

    beforeEach(() => {
      component = createTestComponent(
        // @ts-ignore
        <FieldAgentHome
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
      ).component
    })

    it('renders no records text when no data in grid table', () => {
      const testComponent = createTestComponent(
        // @ts-ignore
        <FieldAgentHome
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
      expect(
        testComponent.component.find('#no-record').hostNodes()
      ).toHaveLength(1)
    })

    it('when online renders submission status', () => {
      const readyApplication = {
        id: uuid(),
        data: mockApplicationData,
        event: Event.BIRTH,
        submissionStatus: SUBMISSION_STATUS[SUBMISSION_STATUS.READY_TO_SUBMIT]
      }

      const submittingApplication = {
        id: uuid(),
        data: mockApplicationData,
        event: Event.BIRTH,
        submissionStatus: SUBMISSION_STATUS[SUBMISSION_STATUS.SUBMITTING]
      }

      const submittedApplication = {
        id: uuid(),
        data: mockApplicationData,
        event: Event.BIRTH,
        submissionStatus: SUBMISSION_STATUS[SUBMISSION_STATUS.SUBMITTED]
      }

      const failedApplication = {
        id: uuid(),
        data: mockApplicationData,
        event: Event.BIRTH,
        submissionStatus: SUBMISSION_STATUS[SUBMISSION_STATUS.FAILED]
      }

      store.dispatch(storeApplication(readyApplication))
      store.dispatch(storeApplication(submittingApplication))
      store.dispatch(storeApplication(submittedApplication))
      store.dispatch(storeApplication(failedApplication))

      component.update()

      expect(component.find('#waiting0').hostNodes()).toHaveLength(1)
      expect(component.find('#submitting1').hostNodes()).toHaveLength(1)
      expect(component.find('#submitted2').hostNodes()).toHaveLength(1)
      expect(component.find('#failed3').hostNodes()).toHaveLength(1)
    })

    it('when offline renders pending submission status', () => {
      Object.defineProperty(window.navigator, 'onLine', { value: false })

      const readyApplication = {
        id: uuid(),
        data: mockApplicationData,
        event: Event.BIRTH,
        submissionStatus: SUBMISSION_STATUS[SUBMISSION_STATUS.READY_TO_SUBMIT]
      }

      store.dispatch(storeApplication(readyApplication))

      component.update()
      expect(component.find('#offline0').hostNodes()).toHaveLength(1)
    })
  })

  describe('when user is in progress tab', () => {
    let component: ReactWrapper

    beforeEach(() => {
      component = createTestComponent(
        // @ts-ignore
        <FieldAgentHome
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
      ).component
    })

    it('renders no records text when no data in grid table', () => {
      expect(component.find('#no-record').hostNodes()).toHaveLength(1)
    })
  })
})

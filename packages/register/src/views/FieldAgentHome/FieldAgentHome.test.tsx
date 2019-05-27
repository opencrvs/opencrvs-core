import { getStorageUserDetailsSuccess } from '@opencrvs/register/src/profile/profileActions'
import {
  createTestComponent,
  mockApplicationData,
  currentUserApplications
} from 'src/tests/util'
import { ReactWrapper } from 'enzyme'
import { History } from 'history'
import * as fetch from 'jest-fetch-mock'
import { Store } from 'redux'
import { getStorageApplicationsSuccess } from 'src/applications'
import { HOME } from 'src/navigation/routes'
import { getOfflineDataSuccess } from 'src/offline/actions'
import { storage } from 'src/storage'
import { createStore } from 'src/store'
import { checkAuth } from 'src/profile/profileActions'
import { FIELD_AGENT_ROLE } from 'src/utils/constants'
import { EVENT_STATUS } from '../RegistrarHome/RegistrarHome'
import {
  COUNT_USER_WISE_APPLICATIONS,
  SEARCH_APPLICATIONS_USER_WISE
} from 'src/search/queries'
import { FieldAgentHome } from './FieldAgentHome'
import { ReactWrapper } from 'enzyme'
import * as uuid from 'uuid'
import { SUBMISSION_STATUS, storeApplication } from 'src/applications'
import { Event } from 'src/forms'

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
      role: FIELD_AGENT_ROLE
    }
  }
}

const countQueryGraphqlMock = {
  request: {
    query: COUNT_USER_WISE_APPLICATIONS,
    variables: {
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

describe('FieldAgentHome tests', async () => {
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

  describe('when Field Agent is in home view with no drafts', () => {
    const registerUserDetails = Object.assign({}, userDetails)
    registerUserDetails.role = FIELD_AGENT_ROLE
    beforeEach(async () => {
      store.dispatch(getStorageUserDetailsSuccess(JSON.stringify(userDetails)))
      history.replace(HOME)
      app.update()
      app
        .find('#createPinBtn')
        .hostNodes()
        .simulate('click')
      await flushPromises()
      app.update()
      for (let i = 1; i <= 8; i++) {
        app
          .find(`#keypad-${i % 2}`)
          .hostNodes()
          .simulate('click')
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

    it('redirect to in progress tab', async () => {
      app
        .find('#tab_progress')
        .hostNodes()
        .simulate('click')

      await new Promise(resolve => {
        setTimeout(resolve, 100)
      })

      app.update()

      expect(history.location.pathname).toContain('progress')
    })
    it('redirect to in review tab', async () => {
      app
        .find('#tab_review')
        .hostNodes()
        .simulate('click')

      await new Promise(resolve => {
        setTimeout(resolve, 100)
      })

      app.update()

      expect(history.location.pathname).toContain('review')
    })
    it('redirect to in update tab', async () => {
      app
        .find('#tab_updates')
        .hostNodes()
        .simulate('click')

      await new Promise(resolve => {
        setTimeout(resolve, 100)
      })

      app.update()

      expect(history.location.pathname).toContain('updates')
    })

    it('loads no grid table when there is no applications', () => {
      expect(app.find('#no-record').hostNodes()).toHaveLength(1)
    })

    describe('when user clicks the floating action button', () => {
      beforeEach(() => {
        app
          .find('#new_event_declaration')
          .hostNodes()
          .simulate('click')
      })
      it('changes to new vital event screen', () => {
        expect(app.find('#select_birth_event').hostNodes()).toHaveLength(1)
      })
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
      expect(component.find('#no-record').hostNodes()).toHaveLength(1)
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

  describe('when Field Agent is in home view with drafts', () => {
    const registerUserDetails = Object.assign({}, userDetails)
    registerUserDetails.role = FIELD_AGENT_ROLE
    beforeEach(async () => {
      store.dispatch(getStorageUserDetailsSuccess(JSON.stringify(userDetails)))
      store.dispatch(
        getStorageApplicationsSuccess(JSON.stringify(currentUserApplications))
      )
      history.replace(HOME)
      app.update()
      app
        .find('#createPinBtn')
        .hostNodes()
        .simulate('click')
      await flushPromises()
      app.update()
      for (let i = 1; i <= 8; i++) {
        app
          .find(`#keypad-${i % 2}`)
          .hostNodes()
          .simulate('click')
      }
      await flushPromises()
      app.update()
    })
    it('shows count for application in corresponding tab', () => {
      expect(
        app
          .find('#tab_progress')
          .hostNodes()
          .text()
      ).toContain(
        `In progress (${currentUserApplications.applications.length})`
      )
      expect(
        app
          .find('#tab_review')
          .hostNodes()
          .text()
      ).toContain('Sent for review (0)')
      expect(
        app
          .find('#tab_updates')
          .hostNodes()
          .text()
      ).toContain('Require updates (1)')
    })
    it('loads grid table', () => {
      expect(app.find('#no-record').hostNodes()).toHaveLength(0)
    })
    it('redirect to details page', async () => {
      expect(app.find('#row_0').hostNodes()).toHaveLength(1)

      app
        .find('#row_0')
        .hostNodes()
        .simulate('click')

      expect(history.location.pathname).toContain('details')
    })
  })

  describe('Pagination', () => {
    const registerUserDetails = Object.assign({}, userDetails)
    registerUserDetails.role = FIELD_AGENT_ROLE
    beforeEach(async () => {
      store.dispatch(getStorageUserDetailsSuccess(JSON.stringify(userDetails)))
      store.dispatch(
        getStorageApplicationsSuccess(JSON.stringify(currentUserApplications))
      )
      history.replace(HOME)
      app.update()
      app
        .find('#createPinBtn')
        .hostNodes()
        .simulate('click')
      await flushPromises()
      app.update()
      for (let i = 1; i <= 8; i++) {
        app
          .find(`#keypad-${i % 2}`)
          .hostNodes()
          .simulate('click')
      }
      await flushPromises()
      app.update()
    })

    it('the pagination block will be visible', () => {
      expect(app.find('#pagination').hostNodes()).toHaveLength(1)
    })
    it('the next page will view valid number of items', () => {
      app
        .find('#next')
        .hostNodes()
        .simulate('click')
      app.update()

      expect(
        app
          .find('#pagination')
          .hostNodes()
          .text()
      ).toContain('2/')
    })
  })
})

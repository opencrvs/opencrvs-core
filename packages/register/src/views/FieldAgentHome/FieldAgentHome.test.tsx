import {
  createTestApp,
  mockOfflineData,
  userDetails,
  assign,
  validToken,
  getItem,
  flushPromises,
  setItem,
  createTestComponent,
  mockApplicationData
} from 'src/tests/util'
import { FIELD_AGENT_HOME_TAB } from 'src/navigation/routes'
import { ReactWrapper } from 'enzyme'
import { History } from 'history'
import { Store } from 'redux'
import { getStorageUserDetailsSuccess } from '@opencrvs/register/src/profile/profileActions'
import { getOfflineDataSuccess } from 'src/offline/actions'
import * as fetch from 'jest-fetch-mock'
import { storage } from 'src/storage'
import * as CommonUtils from 'src/utils/commonUtils'
import { FIELD_AGENT_ROLE } from 'src/utils/constants'
import { FieldAgentHome } from './FieldAgentHome'
import * as React from 'react'
import { storeApplication, SUBMISSION_STATUS } from 'src/applications'
import * as uuid from 'uuid'
import { Event } from 'src/forms'

storage.getItem = jest.fn()
storage.setItem = jest.fn()
jest.spyOn(CommonUtils, 'isMobileDevice').mockReturnValue(true)

beforeEach(() => {
  history.replaceState({}, '', '/')
  assign.mockClear()
})

describe('when the home page loads for a field worker', () => {
  let app: ReactWrapper
  let history: History
  let store: Store

  beforeEach(async () => {
    getItem.mockReturnValue(validToken)
    setItem.mockClear()
    fetch.resetMocks()
    fetch.mockResponses(
      [JSON.stringify({ data: mockOfflineData.locations }), { status: 200 }],
      [JSON.stringify({ data: mockOfflineData.facilities }), { status: 200 }]
    )
    const testApp = createTestApp()
    app = testApp.app
    await flushPromises()
    app.update()
    history = testApp.history
    store = testApp.store
    store.dispatch(getOfflineDataSuccess(JSON.stringify(mockOfflineData)))
  })

  describe('when Field Agent is in home view', () => {
    const registerUserDetails = Object.assign({}, userDetails)
    registerUserDetails.role = FIELD_AGENT_ROLE
    beforeEach(async () => {
      store.dispatch(getStorageUserDetailsSuccess(JSON.stringify(userDetails)))
      history.replace(FIELD_AGENT_HOME_TAB)
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
    it('loads top bar and tab', () => {
      expect(app.find('#top-bar').hostNodes()).toHaveLength(1)
      expect(app.find('#tab_progress').hostNodes()).toHaveLength(1)
      expect(app.find('#tab_review').hostNodes()).toHaveLength(1)
      expect(app.find('#tab_updates').hostNodes()).toHaveLength(1)
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
    })
  })
})

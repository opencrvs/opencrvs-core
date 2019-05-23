import { getStorageUserDetailsSuccess } from '@opencrvs/register/src/profile/profileActions'
import { ReactWrapper } from 'enzyme'
import { History } from 'history'
import * as fetch from 'jest-fetch-mock'
import { Store } from 'redux'
import { getStorageApplicationsSuccess } from 'src/applications'
import { HOME } from 'src/navigation/routes'
import { getOfflineDataSuccess } from 'src/offline/actions'
import { storage } from 'src/storage'
import {
  assign,
  createTestApp,
  currentUserApplications,
  flushPromises,
  getItem,
  mockOfflineData,
  setItem,
  userDetails,
  validToken
} from 'src/tests/util'
import * as CommonUtils from 'src/utils/commonUtils'
import { FIELD_AGENT_ROLE } from 'src/utils/constants'

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
      await flushPromises()
      app.update()
    })
    it('loads top bar and tab', () => {
      expect(app.find('#top-bar').hostNodes()).toHaveLength(1)
      expect(app.find('#tab_progress').hostNodes()).toHaveLength(1)
      expect(app.find('#tab_review').hostNodes()).toHaveLength(1)
      expect(app.find('#tab_updates').hostNodes()).toHaveLength(1)
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
      ).toContain('In progress (3)')
      expect(
        app
          .find('#tab_review')
          .hostNodes()
          .text()
      ).toContain('Sent for review (1)')
      expect(
        app
          .find('#tab_updates')
          .hostNodes()
          .text()
      ).toContain('Require updates (1)')
    })
    it('loads grid table when there is no applications', () => {
      expect(app.find('#no-record').hostNodes()).toHaveLength(0)
    })
  })
})

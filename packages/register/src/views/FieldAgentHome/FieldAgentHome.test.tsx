import {
  createTestApp,
  mockOfflineData,
  userDetails,
  assign,
  validToken,
  getItem,
  flushPromises,
  setItem
} from '@register/tests/util'
import { FIELD_AGENT_HOME_TAB } from '@register/navigation/routes'
import { ReactWrapper } from 'enzyme'
import { History } from 'history'
import { Store } from 'redux'
import { getStorageUserDetailsSuccess } from '@opencrvs/register/src/profile/profileActions'
import { getOfflineDataSuccess } from '@register/offline/actions'
import { storage } from '@register/storage'
import * as CommonUtils from '@register/utils/commonUtils'
import { FIELD_AGENT_ROLE } from '@register/utils/constants'
import * as fetchAny from 'jest-fetch-mock'

const fetch = fetchAny as any

storage.getItem = jest.fn()
storage.setItem = jest.fn()
jest.spyOn(CommonUtils, 'isMobileDevice').mockReturnValue(true)

beforeEach(() => {
  window.history.replaceState({}, '', '/')
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
  })
})

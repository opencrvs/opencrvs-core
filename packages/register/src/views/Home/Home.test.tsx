import {
  createTestApp,
  mockOfflineData,
  userDetails,
  assign,
  validToken,
  getItem,
  flushPromises,
  setItem
} from 'src/tests/util'
import { HOME } from 'src/navigation/routes'
import { ReactWrapper } from 'enzyme'
import { History } from 'history'
import { Store } from 'redux'
import { getStorageUserDetailsSuccess } from '@opencrvs/register/src/profile/profileActions'
import { getOfflineDataSuccess } from 'src/offline/actions'
import * as fetch from 'jest-fetch-mock'
import { storage } from 'src/storage'

storage.getItem = jest.fn()
storage.setItem = jest.fn()

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

  describe('when user is in home view', () => {
    const registerUserDetails = Object.assign({}, userDetails)
    registerUserDetails.role = 'LOCAL_REGISTRAR'
    beforeEach(() => {
      store.dispatch(getStorageUserDetailsSuccess(JSON.stringify(userDetails)))
      history.replace(HOME)
      app.update()
    })
    it('lists the actions', () => {
      expect(app.find('#home_action_list').hostNodes()).toHaveLength(1)
    })
    describe('when user clicks the "Declare a new vital event" button', () => {
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
    describe('when user has a register scope they are redirected to the search-result', () => {
      beforeEach(() => {
        store.dispatch(
          getStorageUserDetailsSuccess(JSON.stringify(registerUserDetails))
        )
        app.update()
      })

      it('search result view renders to load list', () => {
        expect(app.find('#search-result-spinner').hostNodes()).toHaveLength(1)
      })
    })
  })
})

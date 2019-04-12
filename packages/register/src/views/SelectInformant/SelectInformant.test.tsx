import {
  createTestApp,
  mockOfflineData,
  assign,
  validToken,
  getItem,
  flushPromises,
  setItem
} from 'src/tests/util'
import { SELECT_INFORMANT } from 'src/navigation/routes'
import { ReactWrapper } from 'enzyme'
import { History } from 'history'
import { Store } from 'redux'
import { getOfflineDataSuccess } from 'src/offline/actions'
import * as fetch from 'jest-fetch-mock'
import { storage } from 'src/storage'

storage.getItem = jest.fn()
storage.setItem = jest.fn()

beforeEach(() => {
  history.replaceState({}, '', '/')
  assign.mockClear()
})

describe('when user is selecting the informant', () => {
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

  beforeEach(async () => {
    history.replace(SELECT_INFORMANT)
    app.update()
    app
      .find('#createPinBtn')
      .hostNodes()
      .simulate('click')
    await flushPromises()
    app.update()
    Array.apply(null, { length: 8 }).map(() => {
      app
        .find('#keypad-1')
        .hostNodes()
        .simulate('click')
    })
    await flushPromises()
    app.update()
  })
  describe('when selects "Parent"', () => {
    beforeEach(() => {
      app
        .find('#select_parent_informant')
        .hostNodes()
        .simulate('click')
    })
    it('takes user to the birth registration by parent informant view', () => {
      expect(app.find('#informant_parent_view').hostNodes()).toHaveLength(1)
    })
  })
})

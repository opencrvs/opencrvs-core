import {
  createTestApp,
  mockOfflineData,
  assign,
  validToken,
  getItem,
  flushPromises,
  setItem
} from '@register/tests/util'
import { SELECT_INFORMANT } from '@register/navigation/routes'
import { ReactWrapper } from 'enzyme'
import { History } from 'history'
import { Store } from 'redux'
import { getOfflineDataSuccess } from '@register/offline/actions'
import { storage } from '@register/storage'
import * as CommonUtils from '@register/utils/commonUtils'
import * as fetchAny from 'jest-fetch-mock'

const fetch = fetchAny as any

storage.getItem = jest.fn()
storage.setItem = jest.fn()
jest.spyOn(CommonUtils, 'isMobileDevice').mockReturnValue(true)

beforeEach(() => {
  window.history.replaceState({}, '', '/')
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
    await flushPromises()
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
  describe('when selects "Parent"', () => {
    it('takes user to the birth registration by parent informant view', () => {
      app
        .find('#select_informant_mother')
        .hostNodes()
        .simulate('change')
      app
        .find('#continue')
        .hostNodes()
        .simulate('click')

      expect(app.find('#informant_parent_view').hostNodes()).toHaveLength(1)
    })
  })
  describe('when click continue without select anything', () => {
    it('show the error message', () => {
      app
        .find('#continue')
        .hostNodes()
        .simulate('click')

      expect(app.find('#error_text').hostNodes()).toHaveLength(1)
    })
  })

  describe('when traverse list then continue', () => {
    it('takes user to the birth registration by parent informant view', () => {
      app
        .find('#select_informant_mother')
        .hostNodes()
        .simulate('change')
      app
        .find('#select_informant_father')
        .hostNodes()
        .simulate('change')

      app
        .find('#select_informant_self')
        .hostNodes()
        .simulate('change')
      app
        .find('#select_informant_someone')
        .hostNodes()
        .simulate('change')
      app
        .find('#select_informant_parents')
        .hostNodes()
        .simulate('change')
      app
        .find('#continue')
        .hostNodes()
        .simulate('click')

      expect(app.find('#informant_parent_view').hostNodes()).toHaveLength(1)
    })
  })
})

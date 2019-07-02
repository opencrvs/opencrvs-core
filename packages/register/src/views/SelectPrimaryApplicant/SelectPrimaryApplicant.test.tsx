import {
  createTestApp,
  mockOfflineData,
  assign,
  validToken,
  getItem,
  flushPromises,
  setItem
} from '@register/tests/util'
import { SELECT_PRIMARY_APPLICANT } from '@register/navigation/routes'
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

describe('when user is selecting the vital event', () => {
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

  describe('when user is in primary applicant selection view', () => {
    beforeEach(async () => {
      history.replace(SELECT_PRIMARY_APPLICANT)
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
    it('lists the options', () => {
      expect(app.find('#primary_applicant_selection_view')).toHaveLength(2)
    })
    describe('when selects "Mother"', () => {
      beforeEach(() => {
        app
          .find('#select_mother_event')
          .hostNodes()
          .simulate('change')

        app
          .find('#continue')
          .hostNodes()
          .simulate('click')
      })
      it('takes user to the birth selection view', () => {
        expect(history.location.pathname).toContain('events/birth')
      })
    })

    describe('when selects "Father"', () => {
      beforeEach(() => {
        app
          .find('#select_father_event')
          .hostNodes()
          .simulate('change')
        app
          .find('#continue')
          .hostNodes()
          .simulate('click')
      })
      it('takses user to the death registration form', () => {
        expect(history.location.pathname).toContain('events/birth')
      })
    })
    describe('when selects "Father"', () => {
      beforeEach(() => {
        app
          .find('#continue')
          .hostNodes()
          .simulate('click')
      })
      it('shows error message', () => {
        expect(app.find('#error_text')).toHaveLength(1)
      })
    })
  })
})

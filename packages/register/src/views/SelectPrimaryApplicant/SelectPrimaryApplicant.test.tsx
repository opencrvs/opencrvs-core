import {
  createApplication,
  IApplication,
  storeApplication
} from '@register/applications'
import { Event } from '@register/forms'
import { SELECT_BIRTH_PRIMARY_APPLICANT } from '@register/navigation/routes'
import { getOfflineDataSuccess } from '@register/offline/actions'
import { storage } from '@register/storage'
import {
  assign,
  createTestApp,
  flushPromises,
  getItem,
  mockOfflineData,
  setItem,
  validToken
} from '@register/tests/util'
import * as CommonUtils from '@register/utils/commonUtils'
import { ReactWrapper } from 'enzyme'
import { History } from 'history'
import * as fetchAny from 'jest-fetch-mock'
import { Store } from 'redux'

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
  let draft: IApplication

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
      draft = createApplication(Event.BIRTH)
      store.dispatch(storeApplication(draft))
      history.replace(
        SELECT_BIRTH_PRIMARY_APPLICANT.replace(':applicationId', draft.id)
      )
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
      it('takes user to the contact selection view', () => {
        expect(window.location.pathname).toContain(
          '/events/birth/registration/contact'
        )
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
      it('takses user to the contact selection form', () => {
        expect(window.location.pathname).toContain(
          '/events/birth/registration/contact'
        )
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
        expect(
          app
            .find('#error_text')
            .hostNodes()
            .text()
        ).toBe('Please select who is the primary applicant')
      })
    })
  })
})

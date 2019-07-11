import {
  createApplication,
  IApplication,
  storeApplication
} from '@register/applications'
import { Event } from '@register/forms'
import { SELECT_INFORMANT } from '@register/navigation/routes'
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

describe('when user is selecting the informant', () => {
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
    draft = createApplication(Event.BIRTH)
    store.dispatch(storeApplication(draft))
    history.replace(SELECT_INFORMANT.replace(':applicationId', draft.id))
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

      expect(window.location.pathname).toContain(
        '/events/birth/registration/contact'
      )
    })
  })
  describe('when click continue without select anything', () => {
    it('show the error message', () => {
      app
        .find('#continue')
        .hostNodes()
        .simulate('click')

      expect(
        app
          .find('#error_text')
          .hostNodes()
          .text()
      ).toBe('Please select who is present and applying')
    })
  })

  describe('when traverse list then continue', () => {
    it('takes user to the birth registration by parent informant view', () => {
      app
        .find('#select_informant_parents')
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
        .find('#select_informant_mother')
        .hostNodes()
        .simulate('change')
      app
        .find('#continue')
        .hostNodes()
        .simulate('click')

      expect(window.location.pathname).toContain(
        '/events/birth/registration/contact'
      )
    })
  })

  describe('when select both parents', () => {
    it('takes user to the select primary applicant view', () => {
      app
        .find('#select_informant_parents')
        .hostNodes()
        .simulate('change')
      app
        .find('#continue')
        .hostNodes()
        .simulate('click')

      expect(
        app.find('#primary_applicant_selection_view').hostNodes()
      ).toHaveLength(1)
    })
  })

  describe('when clicked on cross button', () => {
    it('go back to home page', async () => {
      app
        .find('#crcl-btn')
        .hostNodes()
        .simulate('click')

      expect(window.location.href).toContain('/')
    })
  })
})

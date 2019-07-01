import {
  createTestApp,
  mockOfflineData,
  assign,
  validToken,
  getItem,
  flushPromises,
  setItem
} from '@register/tests/util'
import { SELECT_MAIN_CONTACT_POINT } from '@register/navigation/routes'
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
    history.replace(SELECT_MAIN_CONTACT_POINT.replace(':applicant', 'mother'))
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
  describe('In select main contact point', () => {
    it('when selects Mother it opens phone number input', async () => {
      app
        .find('#contact_mother')
        .hostNodes()
        .simulate('change')

      await flushPromises()
      app.update()

      expect(app.find('#phone_number_input').hostNodes().length).toBe(1)
    })

    it('when selects Father it opens phone number input', async () => {
      app
        .find('#contact_father')
        .hostNodes()
        .simulate('change')

      await flushPromises()
      app.update()

      expect(app.find('#phone_number_input').hostNodes().length).toBe(1)
    })

    it('goes to form page while after giving mother mobile no', async () => {
      app
        .find('#contact_mother')
        .hostNodes()
        .simulate('change')

      await flushPromises()
      app.update()

      app
        .find('#phone_number_input')
        .hostNodes()
        .simulate('change', {
          target: { id: 'phone_number_input', value: '01656972106' }
        })

      await flushPromises()
      app.update()

      app
        .find('#continue')
        .hostNodes()
        .simulate('click')

      await flushPromises()
      app.update()

      expect(window.location.pathname).toContain('events/birth/parent')
    })

    it('goes to form page while after giving father mobile no', async () => {
      app
        .find('#contact_father')
        .hostNodes()
        .simulate('change')

      await flushPromises()
      app.update()

      app
        .find('#phone_number_input')
        .hostNodes()
        .simulate('change', {
          target: { id: 'phone_number_input', value: '01656972106' }
        })

      await flushPromises()
      app.update()

      app
        .find('#continue')
        .hostNodes()
        .simulate('click')

      await flushPromises()
      app.update()

      expect(window.location.pathname).toContain('events/birth/parent')
    })

    it('show error while giving invalid mother mobile no', async () => {
      app
        .find('#contact_mother')
        .hostNodes()
        .simulate('change')

      await flushPromises()
      app.update()

      app
        .find('#phone_number_input')
        .hostNodes()
        .simulate('change', {
          target: { id: 'phone_number_input', value: '016562106' }
        })

      await flushPromises()
      app.update()

      expect(
        app
          .find('#phone_number_error')
          .hostNodes()
          .text()
      ).toBe('Not a valid mobile number')
    })

    it('show error while giving invalid father mobile no', async () => {
      app
        .find('#contact_father')
        .hostNodes()
        .simulate('change')

      await flushPromises()
      app.update()

      app
        .find('#phone_number_input')
        .hostNodes()
        .simulate('change', {
          target: { id: 'phone_number_input', value: '016562106' }
        })

      await flushPromises()
      app.update()

      expect(
        app
          .find('#phone_number_error')
          .hostNodes()
          .text()
      ).toBe('Not a valid mobile number')
    })

    it('show error without selecting any input', async () => {
      app
        .find('#contact_mother')
        .hostNodes()
        .simulate('change')

      app
        .find('#continue')
        .hostNodes()
        .simulate('click')

      await flushPromises()
      app.update()

      expect(app.find('#error_text').hostNodes()).toHaveLength(1)
    })
  })
})

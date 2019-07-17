import {
  createApplication,
  IApplication,
  storeApplication
} from '@register/applications'
import { Event } from '@register/forms'
import { SELECT_DEATH_MAIN_CONTACT_POINT } from '@register/navigation/routes'
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

describe('when user is selecting the Main point of contact', () => {
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
    history.replace(
      SELECT_DEATH_MAIN_CONTACT_POINT.replace(':applicationId', draft.id)
    )
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
    it('when selects Spouse it opens phone number input', async () => {
      app
        .find('#contact_SPOUSE')
        .hostNodes()
        .simulate('change')

      await flushPromises()
      app.update()

      expect(app.find('#phone_number_input').hostNodes().length).toBe(1)
    })

    it('when selects Son it opens phone number input', async () => {
      app
        .find('#contact_SON')
        .hostNodes()
        .simulate('change')

      await flushPromises()
      app.update()

      expect(app.find('#phone_number_input').hostNodes().length).toBe(1)
    })

    it('goes to form page while after giving spouse mobile no', async () => {
      app
        .find('#contact_SPOUSE')
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

      expect(window.location.pathname).toContain('events/death')
    })

    it('goes to form page while after giving son mobile no', async () => {
      app
        .find('#contact_SON')
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

      expect(window.location.pathname).toContain('events/death')
    })

    it('show error while giving invalid daughter mobile no', async () => {
      app
        .find('#contact_DAUGHTER')
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
        .find('#contact_FATHER')
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
        .find('#contact_MOTHER')
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
  describe('when select other contact point', () => {
    it('show error if neither relationship nor phone number entered', () => {
      app
        .find('#contact_OTHER')
        .hostNodes()
        .simulate('change')
      app
        .find('#continue')
        .hostNodes()
        .simulate('click')

      expect(
        app
          .find('#error_text')
          .hostNodes()
          .text()
      ).toBe('Please select a main point of contact')
    })
    it('show error while giving invalid mobile no', async () => {
      app
        .find('#contact_OTHER')
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
    it('show error if valid phone number but relationship not entered', async () => {
      app
        .find('#contact_OTHER')
        .hostNodes()
        .simulate('change')

      app
        .find('#phone_number_input')
        .hostNodes()
        .simulate('change', {
          target: { id: 'phone_number_input', value: '01711111111' }
        })

      app
        .find('#continue')
        .hostNodes()
        .simulate('click')

      await flushPromises()
      app.update()

      expect(
        app
          .find('#error_text')
          .hostNodes()
          .text()
      ).toBe('Please select a main point of contact')
    })
    it('advances to death application if informant is other', async () => {
      app
        .find('#contact_OTHER')
        .hostNodes()
        .simulate('change')

      app
        .find('#phone_number_input')
        .hostNodes()
        .simulate('change', {
          target: { id: 'phone_number_input', value: '01711111111' }
        })

      app
        .find('#relationship_input')
        .hostNodes()
        .simulate('change', {
          target: { id: 'relationship_input', value: 'Neighbour' }
        })

      app
        .find('#continue')
        .hostNodes()
        .simulate('click')

      await flushPromises()
      app.update()

      expect(app.find('#firstNamesEng').hostNodes()).toHaveLength(1)
    })
  })
})

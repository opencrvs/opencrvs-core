import {
  createApplication,
  IApplication,
  storeApplication
} from '@register/applications'
import { Event } from '@register/forms'
import { SELECT_BIRTH_INFORMANT } from '@register/navigation/routes'

import { storage } from '@register/storage'
import { createTestApp, flushPromises, setPinCode } from '@register/tests/util'

import { ReactWrapper } from 'enzyme'
import { History } from 'history'
import { AppStore } from '@register/store'

beforeEach(() => {
  ;(storage.getItem as jest.Mock).mockReset()
})

describe('when user is selecting the informant', () => {
  let app: ReactWrapper
  let history: History
  let store: AppStore
  let draft: IApplication

  beforeEach(async () => {
    const testApp = await createTestApp()
    app = testApp.app
    history = testApp.history
    store = testApp.store

    draft = createApplication(Event.BIRTH)
    store.dispatch(storeApplication(draft))
    history.replace(SELECT_BIRTH_INFORMANT.replace(':applicationId', draft.id))

    await flushPromises()
    await setPinCode(app)
  })
  describe('when selects "Parent"', () => {
    it('takes user to the birth registration contact view', () => {
      app
        .find('#select_informant_MOTHER')
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
        .find('#select_informant_BOTH_PARENTS')
        .hostNodes()
        .simulate('change')
      app
        .find('#select_informant_FATHER')
        .hostNodes()
        .simulate('change')

      app
        .find('#select_informant_SELF')
        .hostNodes()
        .simulate('change')
      app
        .find('#select_informant_MOTHER')
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
        .find('#select_informant_BOTH_PARENTS')
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
describe('when select informant page loads with existing data', () => {
  it('loads data properly while initiating', async () => {
    const testApp = await createTestApp()
    const app = testApp.app
    const history = testApp.history
    const store = testApp.store

    const draft = createApplication(Event.BIRTH, {
      registration: {
        presentAtBirthRegistration: 'MOTHER',
        registrationPhone: '01622688231'
      }
    })
    store.dispatch(storeApplication(draft))
    history.replace(SELECT_BIRTH_INFORMANT.replace(':applicationId', draft.id))

    await setPinCode(app)

    expect(
      app
        .find('#select_informant_MOTHER')
        .hostNodes()
        .props().checked
    ).toBe(true)
  })
})

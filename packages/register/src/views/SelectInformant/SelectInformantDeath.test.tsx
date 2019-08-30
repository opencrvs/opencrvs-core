import {
  createApplication,
  IApplication,
  storeApplication
} from '@register/applications'
import { Event } from '@register/forms'
import { SELECT_DEATH_INFORMANT } from '@register/navigation/routes'

import { createTestApp, flushPromises, setPinCode } from '@register/tests/util'
import { ReactWrapper } from 'enzyme'
import { History } from 'history'
import { Store } from 'redux'
import { storage } from '@register/storage'

beforeEach(() => {
  ;(storage.getItem as jest.Mock).mockReset()
})

describe('when user is selecting the informant', () => {
  let app: ReactWrapper
  let history: History
  let store: Store
  let draft: IApplication

  beforeEach(async () => {
    const testApp = await createTestApp()
    app = testApp.app
    history = testApp.history
    store = testApp.store

    draft = createApplication(Event.DEATH)
    store.dispatch(storeApplication(draft))
    history.replace(SELECT_DEATH_INFORMANT.replace(':applicationId', draft.id))

    await setPinCode(app)
  })
  describe('when selects "Parent"', () => {
    it('takes user to the death registration contact view', () => {
      app
        .find('#select_informant_MOTHER')
        .hostNodes()
        .simulate('change')

      app
        .find('#continue')
        .hostNodes()
        .simulate('click')

      expect(window.location.pathname).toContain(
        '/events/death/registration/contact'
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
      ).toBe(
        'Please select the relationship to the deceased and any relevant contact details.'
      )
    })
  })

  describe('when traverse list then continue', () => {
    it('takes user to the death registration by parent informant view', () => {
      app
        .find('#select_informant_MOTHER')
        .hostNodes()
        .simulate('change')
      app
        .find('#select_informant_FATHER')
        .hostNodes()
        .simulate('change')

      app
        .find('#select_informant_SPOUSE')
        .hostNodes()
        .simulate('change')
      app
        .find('#select_informant_SON')
        .hostNodes()
        .simulate('change')
      app
        .find('#select_informant_DAUGHTER')
        .hostNodes()
        .simulate('change')
      app
        .find('#continue')
        .hostNodes()
        .simulate('click')

      expect(window.location.pathname).toContain(
        '/events/death/registration/contact'
      )
    })
  })

  describe('when select other informant', () => {
    it('show error if neither relationship nor phone number entered', () => {
      app
        .find('#select_informant_OTHER')
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
      ).toBe(
        'Please select the relationship to the deceased and any relevant contact details.'
      )
    })
    it('show error while giving invalid mobile no', async () => {
      app
        .find('#select_informant_OTHER')
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
        .find('#select_informant_OTHER')
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
      ).toBe(
        'Please select the relationship to the deceased and any relevant contact details.'
      )
    })
    it('advances to death application if informant is other', async () => {
      app
        .find('#select_informant_OTHER')
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

    const draft = createApplication(Event.DEATH, {
      informant: {
        applicantsRelationToDeceased: 'OTHER',
        applicantPhone: '01622688231',
        applicantOtherRelationship: 'Grand Mother'
      }
    })
    store.dispatch(storeApplication(draft))
    history.replace(SELECT_DEATH_INFORMANT.replace(':applicationId', draft.id))
    await setPinCode(app)

    expect(
      app
        .find('#select_informant_OTHER')
        .hostNodes()
        .props().checked
    ).toBe(true)
  })
})

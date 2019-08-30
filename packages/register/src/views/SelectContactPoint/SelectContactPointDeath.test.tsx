import {
  createApplication,
  IApplication,
  storeApplication
} from '@register/applications'
import { Event } from '@register/forms'
import { SELECT_DEATH_MAIN_CONTACT_POINT } from '@register/navigation/routes'

import { createTestApp, flushPromises } from '@register/tests/util'
import { ReactWrapper } from 'enzyme'
import { History } from 'history'
import { Store } from 'redux'

describe('when user is selecting the Main point of contact', () => {
  let app: ReactWrapper
  let history: History
  let store: Store
  let draft: IApplication
  beforeEach(async () => {
    const testApp = await createTestApp()

    app = testApp.app
    history = testApp.history
    store = testApp.store

    draft = createApplication(Event.BIRTH)
    await store.dispatch(storeApplication(draft))
    history.replace(
      SELECT_DEATH_MAIN_CONTACT_POINT.replace(':applicationId', draft.id)
    )
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
      ).toBe('Must be a valid 11 digit number that starts with 01')
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
      ).toBe('Must be a valid 11 digit number that starts with 01')
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
      ).toBe('Must be a valid 11 digit number that starts with 01')
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

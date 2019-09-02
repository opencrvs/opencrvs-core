import {
  createApplication,
  IApplication,
  storeApplication
} from '@register/applications'
import { Event } from '@register/forms'
import { SELECT_BIRTH_MAIN_CONTACT_POINT } from '@register/navigation/routes'

import { storage } from '@register/storage'
import { createTestApp, flushPromises, setPinCode } from '@register/tests/util'

import { ReactWrapper } from 'enzyme'
import { History } from 'history'
import { Store } from 'redux'

describe('when user is selecting the Main point of contact', () => {
  let app: ReactWrapper
  let history: History
  let store: Store
  let draft: IApplication
  beforeEach(async () => {
    ;(storage.getItem as jest.Mock).mockReset()
    const testApp = await createTestApp()
    app = testApp.app
    history = testApp.history
    store = testApp.store

    draft = createApplication(Event.BIRTH)
    store.dispatch(storeApplication(draft))
    history.replace(
      SELECT_BIRTH_MAIN_CONTACT_POINT.replace(':applicationId', draft.id)
    )
    await setPinCode(app)
  })
  describe('In select main contact point', () => {
    it('when selects Mother it opens phone number input', async () => {
      app
        .find('#contact_MOTHER')
        .hostNodes()
        .simulate('change')

      await flushPromises()
      app.update()

      expect(app.find('#phone_number_input').hostNodes().length).toBe(1)
    })

    it('when selects Father it opens phone number input', async () => {
      app
        .find('#contact_FATHER')
        .hostNodes()
        .simulate('change')

      await flushPromises()
      app.update()

      expect(app.find('#phone_number_input').hostNodes().length).toBe(1)
    })

    it('goes to form page while after giving mother mobile no', async () => {
      app
        .find('#contact_MOTHER')
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

      expect(window.location.pathname).toContain('events/birth')
    })

    it('goes to form page while after giving father mobile no', async () => {
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

      expect(window.location.pathname).toContain('events/birth')
    })

    it('show error while giving invalid mother mobile no', async () => {
      app
        .find('#contact_MOTHER')
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
})

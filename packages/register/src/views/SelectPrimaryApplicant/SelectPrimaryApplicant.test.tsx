import {
  createApplication,
  IApplication,
  storeApplication
} from '@register/applications'
import { Event } from '@register/forms'
import { SELECT_BIRTH_PRIMARY_APPLICANT } from '@register/navigation/routes'

import { createTestApp, flushPromises, setPinCode } from '@register/tests/util'
import { ReactWrapper } from 'enzyme'
import { History } from 'history'
import { Store } from 'redux'
import { storage } from '@register/storage'

describe('when user is selecting the vital event', () => {
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
  })

  describe('when user is in primary applicant selection view', () => {
    beforeEach(async () => {
      draft = createApplication(Event.BIRTH)
      await store.dispatch(storeApplication(draft))
      history.replace(
        SELECT_BIRTH_PRIMARY_APPLICANT.replace(':applicationId', draft.id)
      )
      await flushPromises()
      await setPinCode(app)
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

/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import {
  createApplication,
  IApplication,
  storeApplication
} from '@client/applications'
import { Event } from '@client/forms'
import { SELECT_BIRTH_PRIMARY_APPLICANT } from '@client/navigation/routes'

import { createTestApp, flushPromises, setPinCode } from '@client/tests/util'
import { ReactWrapper } from 'enzyme'
import { History } from 'history'
import { Store } from 'redux'
import { storage } from '@client/storage'

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
      expect(
        app.find('#primary_applicant_selection_view').hostNodes()
      ).toHaveLength(1)
    })
    describe('when selects "Mother"', () => {
      beforeEach(() => {
        app.find('#select_mother_event').hostNodes().simulate('change')

        app.find('#continue').hostNodes().simulate('click')
      })
      it('takes user to the contact selection view', () => {
        expect(window.location.pathname).toContain(
          '/events/birth/registration/contact'
        )
      })
    })

    describe('when selects "Father"', () => {
      beforeEach(() => {
        app.find('#select_father_event').hostNodes().simulate('change')
        app.find('#continue').hostNodes().simulate('click')
      })
      it('takses user to the contact selection form', () => {
        expect(window.location.pathname).toContain(
          '/events/birth/registration/contact'
        )
      })
    })
    describe('when selects "Father"', () => {
      beforeEach(() => {
        app.find('#continue').hostNodes().simulate('click')
      })
      it('shows error message', () => {
        expect(app.find('#error_text').hostNodes().text()).toBe(
          'Please select who is the primary applicant'
        )
      })
    })
  })
})

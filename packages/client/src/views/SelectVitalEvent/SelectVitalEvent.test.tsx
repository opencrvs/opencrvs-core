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
import { createTestApp, flushPromises, waitForReady } from '@client/tests/util'
import { SELECT_VITAL_EVENT } from '@client/navigation/routes'
import { ReactWrapper } from 'enzyme'
import { History } from 'history'
import { waitForElement } from '@client/tests/wait-for-element'

describe('when user is selecting the vital event', () => {
  let app: ReactWrapper
  let history: History

  beforeEach(async () => {
    const testApp = await createTestApp()
    app = testApp.app
    history = testApp.history
    await waitForReady(app)
  })

  describe('when user is in vital event selection view', () => {
    beforeEach(async () => {
      history.replace(SELECT_VITAL_EVENT)
      await waitForElement(app, '#select_vital_event_view')
    })
    it('lists the options', () => {
      expect(app.find('#select_vital_event_view').hostNodes()).toHaveLength(1)
    })
    describe('when selects "Birth"', () => {
      beforeEach(() => {
        app.find('#select_birth_event').hostNodes().simulate('change')

        app.find('#continue').hostNodes().simulate('click')
      })
      it('takes user to the event info view', () => {
        expect(app.find('#birth-info-container').hostNodes()).toHaveLength(1)
      })
    })

    describe('when selects "Death"', () => {
      beforeEach(() => {
        app.find('#select_death_event').hostNodes().simulate('change')
        app.find('#continue').hostNodes().simulate('click')
      })
      it('takses user to the death registration form', () => {
        expect(history.location.pathname).toContain('events/death')
      })
    })

    describe('when no event is selected', () => {
      beforeEach(() => {
        app.find('#continue').hostNodes().simulate('click')
      })
      it('shows the required error to user', () => {
        expect(app.find('#require-error').hostNodes().length).toBe(1)
      })
    })

    describe('when clicked on cross button', () => {
      beforeEach(async () => {
        app.find('#crcl-btn').hostNodes().simulate('click')
        await flushPromises()
        app.update()
      })
      it('go back to home page', async () => {
        expect(window.location.href).toContain('/')
      })
    })
  })
})

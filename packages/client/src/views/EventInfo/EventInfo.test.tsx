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
import * as React from 'react'
import { ReactWrapper } from 'enzyme'
import { createTestStore, createTestComponent } from '@client/tests/util'
import { EventInfo } from '@client/views/EventInfo/EventInfo'
import { Event } from '@client/utils/gateway'
import { waitForElement } from '@client/tests/wait-for-element'
import { History } from 'history'
import { AppStore } from '@client/store'

describe('EventInfo tests', () => {
  let component: ReactWrapper<{}, {}>
  let history: History<any>
  let store: AppStore

  describe('For birth event', () => {
    beforeAll(async () => {
      ;({ store, history } = await createTestStore())

      const testComponent = await createTestComponent(
        // @ts-ignore
        <EventInfo match={{ params: { eventType: Event.Birth } }} />,
        { store, history }
      )
      component = testComponent
    })

    it('renders birth bullet list items', async () => {
      const element = await waitForElement(component, '#birth-info-bullet-list')
      expect(element).toBeDefined()
    })

    it('clicking on continue takes user to select birth informant view', async () => {
      const continueButton = await waitForElement(component, '#continue')
      continueButton.hostNodes().simulate('click')
      expect(history.location.pathname).toContain(
        'events/birth/registration/informant'
      )
    })
  })

  describe('For death event', () => {
    beforeAll(async () => {
      ;({ store, history } = await createTestStore())

      const testComponent = await createTestComponent(
        // @ts-ignore
        <EventInfo match={{ params: { eventType: Event.Death } }} />,
        { store, history }
      )
      component = testComponent
    })

    it('renders death bullet list items', async () => {
      const element = await waitForElement(component, '#death-info-bullet-list')
      expect(element).toBeDefined()
    })

    it('clicking on continue takes user to select death informant view', async () => {
      const continueButton = await waitForElement(component, '#continue')
      continueButton.hostNodes().simulate('click')
      expect(history.location.pathname).toContain(
        'events/death/registration/informant'
      )
    })
  })

  describe('For unknown event', () => {
    beforeAll(async () => {
      ;({ store, history } = await createTestStore())

      const testComponent = await createTestComponent(
        // @ts-ignore
        <EventInfo match={{ params: { eventType: 'unknwown' } }} />,
        { store, history }
      )
      component = testComponent
    })

    it('clicking on continue throws error', async () => {
      const continueButton = await waitForElement(component, '#continue')
      try {
        continueButton.hostNodes().simulate('click')
      } catch (error) {
        expect((error as any).message).toMatch(/Unknown eventType/)
      }
    })
  })
})

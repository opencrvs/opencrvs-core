/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import * as React from 'react'
import { createStore } from '@client/store'
import {
  createTestComponent,
  mockDeclarationData,
  mockDeathDeclarationData,
  flushPromises
} from '@client/tests/util'
import { VerifyCollector } from './VerifyCollector'
import { storeDeclaration } from '@client/declarations'
import { Event } from '@client/utils/gateway'
import { ReactWrapper } from 'enzyme'

// Common mock data
const birthDeclaration = {
  id: 'mockBirth1234',
  data: {
    ...mockDeclarationData,
    history: [
      {
        date: '2022-03-21T08:16:24.467+00:00',
        regStatus: 'REGISTERED',
        reinstated: false
      }
    ]
  },
  event: Event.Birth
}

const deathDeclaration = {
  id: 'mockDeath1234',
  data: {
    ...{
      ...mockDeathDeclarationData,
      deathEvent: {
        ...mockDeathDeclarationData.deathEvent,
        deathDate: new Date().toISOString().slice(0, 10)
      }
    },
    history: [
      {
        date: '2022-03-21T08:16:24.467+00:00',
        regStatus: 'REGISTERED',
        reinstated: false
      }
    ]
  },
  event: Event.Death
}

// Helper function for setting up tests
async function setupTest({
  registrationId,
  event,
  collector,
  declaration,
  store,
  history
}: {
  registrationId: string
  event: string
  collector: string
  declaration: any
  store: any
  history: any
}) {
  store.dispatch(storeDeclaration(declaration))
  await flushPromises()

  const testComponent = await createTestComponent(
    // @ts-ignore
    <VerifyCollector
      history={history}
      match={{
        params: {
          registrationId,
          eventType: event as Event,
          collector
        },
        isExact: true,
        path: '',
        url: ''
      }}
    />,
    { store, history }
  )

  return testComponent
}

describe('verify collector tests', () => {
  const { store, history } = createStore()

  describe('in case of birth declaration', () => {
    let testComponent: ReactWrapper

    beforeAll(async () => {
      testComponent = await setupTest({
        registrationId: 'mockBirth1234',
        event: 'birth',
        collector: 'mother',
        declaration: birthDeclaration,
        store,
        history
      })
    })

    it('renders idVerifier component when mother is collector', () => {
      expect(testComponent.find('#idVerifier').hostNodes()).toHaveLength(1)
    })

    it('takes user back on clicking back button', async () => {
      testComponent
        .find('#action_page_back_button')
        .hostNodes()
        .simulate('click')

      await flushPromises()
      testComponent.update()

      expect(history.location.pathname).toBe('/')
    })
  })

  describe('when informant is collector for death declaration', () => {
    let testComponent: ReactWrapper

    beforeAll(async () => {
      testComponent = await setupTest({
        registrationId: 'mockDeath1234',
        event: 'death',
        collector: 'informant',
        declaration: deathDeclaration,
        store,
        history
      })
    })

    it('renders idVerifier component', () => {
      expect(testComponent.find('#idVerifier').hostNodes()).toHaveLength(1)
    })

    it('redirects to review page on clicking yes button with no fee', () => {
      testComponent
        .find('#idVerifier #verifyPositive')
        .hostNodes()
        .simulate('click')

      expect(history.location.pathname).toContain('review')
    })
    it('clicking on cancel button hides the modal', () => {
      testComponent
        .find('#idVerifier #verifyNegative')
        .hostNodes()
        .simulate('click')

      testComponent.update()
      testComponent
        .find('#withoutVerificationPrompt #cancel')
        .hostNodes()
        .simulate('click')

      testComponent.update()
      expect(
        testComponent.find('#withoutVerificationPrompt').hostNodes()
      ).toHaveLength(0)
    })
    it('shows modal on clicking no button', () => {
      testComponent
        .find('#idVerifier #verifyNegative')
        .hostNodes()
        .simulate('click')

      testComponent.update()
      expect(
        testComponent.find('#withoutVerificationPrompt').hostNodes()
      ).toHaveLength(1)
    })
  })

  describe('when father is collector for birth declaration', () => {
    let testComponent: ReactWrapper

    beforeAll(async () => {
      testComponent = await setupTest({
        registrationId: 'mockBirth1234',
        event: 'birth',
        collector: 'father',
        declaration: birthDeclaration,
        store,
        history
      })
    })

    it('takes user to payment page on clicking send button when there is fee', () => {
      testComponent
        .find('#idVerifier #verifyNegative')
        .hostNodes()
        .simulate('click')

      testComponent.update()
      testComponent
        .find('#withoutVerificationPrompt #send')
        .hostNodes()
        .simulate('click')

      expect(history.location.pathname).toContain('payment')
    })
  })

  describe('in case of death declaration with informant as collector', () => {
    let testComponent: ReactWrapper

    beforeAll(async () => {
      testComponent = await setupTest({
        registrationId: 'mockDeath1234',
        event: 'death',
        collector: 'informant',
        declaration: deathDeclaration,
        store,
        history
      })
    })

    it('renders idVerifier component', () => {
      expect(testComponent.find('#idVerifier').hostNodes()).toHaveLength(1)
    })
  })
})

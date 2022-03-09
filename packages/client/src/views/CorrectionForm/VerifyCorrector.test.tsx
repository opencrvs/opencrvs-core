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
import { createStore } from '@client/store'
import {
  createTestComponent,
  flushPromises,
  mockDeclarationData,
  mockDeathDeclarationData
} from '@client/tests/util'
import { VerifyCorrector } from './VerifyCorrector'
import { storeDeclaration } from '@client/declarations'
import { Event } from '@client/forms'
import { ReactWrapper } from 'enzyme'

describe('verify corrector tests', () => {
  const { store, history } = createStore()

  const birthDeclaration = {
    id: 'mockBirth1234',
    data: mockDeclarationData,
    event: Event.BIRTH
  }

  const deathDeclaration = {
    id: 'mockDeath1234',
    data: mockDeathDeclarationData,
    event: Event.DEATH
  }

  describe('in case of birth declaration', () => {
    beforeAll(async () => {
      store.dispatch(storeDeclaration(birthDeclaration))
    })

    it('when mother is corrector renders idVerifier component', async () => {
      const testComponent = await createTestComponent(
        <VerifyCorrector
          history={history}
          location={history.location}
          match={{
            params: {
              declarationId: 'mockBirth1234',
              corrector: 'mother'
            },
            isExact: true,
            path: '',
            url: ''
          }}
        />,
        { store, history }
      )

      expect(testComponent.find('#idVerifier').hostNodes()).toHaveLength(1)
    })

    it('when child is corrector renders idVerifier component', async () => {
      const testComponent = await createTestComponent(
        <VerifyCorrector
          history={history}
          location={history.location}
          match={{
            params: {
              declarationId: 'mockBirth1234',
              corrector: 'child'
            },
            isExact: true,
            path: '',
            url: ''
          }}
        />,
        { store, history }
      )

      expect(testComponent.find('#idVerifier').hostNodes()).toHaveLength(1)
    })

    it('should takes user go back', async () => {
      const testComponent = await createTestComponent(
        <VerifyCorrector
          history={history}
          location={history.location}
          match={{
            params: {
              declarationId: 'mockBirth1234',
              corrector: 'mother'
            },
            isExact: true,
            path: '',
            url: ''
          }}
        />,
        { store, history }
      )

      testComponent
        .find('#action_page_back_button')
        .hostNodes()
        .simulate('click')

      await flushPromises()

      testComponent.update()

      expect(history.location.pathname).toBe('/')
    })
  })

  describe('when father is corrector', () => {
    let testComponent: ReactWrapper
    beforeEach(async () => {
      testComponent = await createTestComponent(
        <VerifyCorrector
          history={history}
          location={history.location}
          match={{
            params: {
              declarationId: 'mockBirth1234',
              corrector: 'father'
            },
            isExact: true,
            path: '',
            url: ''
          }}
        />,
        { store, history }
      )
    })

    it('renders idVerifier compomnent', () => {
      expect(testComponent.find('#idVerifier').hostNodes()).toHaveLength(1)
    })

    it('clicking on yes button takes user to review certificate', () => {
      Date.now = jest.fn(() => 243885600000)

      testComponent
        .find('#idVerifier')
        .find('#verifyPositive')
        .hostNodes()
        .simulate('click')

      testComponent.update()

      expect(history.location.pathname).not.toContain('/verify')
    })

    it('clicking on cancel button hides the modal', () => {
      testComponent
        .find('#idVerifier')
        .find('#verifyNegative')
        .hostNodes()
        .simulate('click')

      testComponent.update()

      testComponent
        .find('#withoutVerificationPrompt')
        .find('#cancel')
        .hostNodes()
        .simulate('click')

      testComponent.update()

      expect(
        testComponent.find('#withoutVerificationPrompt').hostNodes()
      ).toHaveLength(0)
    })

    it('clicking on Confirm button and go to review', () => {
      testComponent
        .find('#idVerifier')
        .find('#verifyNegative')
        .hostNodes()
        .simulate('click')

      testComponent.update()

      testComponent
        .find('#withoutVerificationPrompt')
        .find('#send')
        .hostNodes()
        .simulate('click')

      testComponent.update()

      expect(history.location.pathname).toContain('/review-view-group')
    })

    it('go to review page', () => {
      testComponent.find('#crcl-btn').hostNodes().simulate('click')

      testComponent.update()

      expect(history.location.pathname).toContain('/review')
    })
  })

  describe('in case correction is not father, mother, child or informant', () => {
    let testComponent: ReactWrapper
    beforeEach(async () => {
      testComponent = await createTestComponent(
        <VerifyCorrector
          history={history}
          location={history.location}
          match={{
            params: {
              declarationId: 'mockBirth1234',
              corrector: 'other'
            },
            isExact: true,
            path: '',
            url: ''
          }}
        />,
        { store, history }
      )
    })

    it('renders idVerifier compomnent', () => {
      expect(testComponent.find('#idVerifier').hostNodes()).toHaveLength(1)
    })

    it('clicking on yes button takes user to review certificate', () => {
      Date.now = jest.fn(() => 243885600000)

      testComponent
        .find('#idVerifier')
        .find('#verifyPositive')
        .hostNodes()
        .simulate('click')

      testComponent.update()

      expect(history.location.pathname).not.toContain('/verify')
    })

    it('clicking on no button shows up modal', () => {
      testComponent
        .find('#idVerifier')
        .find('#verifyNegative')
        .hostNodes()
        .simulate('click')

      testComponent.update()

      expect(
        testComponent.find('#withoutVerificationPrompt').hostNodes()
      ).toHaveLength(1)
    })
  })

  describe('in case of death declaration', () => {
    beforeAll(async () => {
      store.dispatch(storeDeclaration(deathDeclaration))
    })

    it('when informant is corrector renders idVerifier component', async () => {
      const testComponent = await createTestComponent(
        <VerifyCorrector
          history={history}
          location={history.location}
          match={{
            params: {
              declarationId: 'mockDeath1234',
              corrector: 'informant'
            },
            isExact: true,
            path: '',
            url: ''
          }}
        />,
        { store, history }
      )

      expect(testComponent.find('#idVerifier').hostNodes()).toHaveLength(1)
    })
  })
})

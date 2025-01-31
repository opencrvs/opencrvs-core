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
  flushPromises,
  mockDeclarationData,
  mockDeathDeclarationData,
  TestComponentWithRouteMock
} from '@client/tests/util'
import { VerifyCorrector } from './VerifyCorrector'
import { storeDeclaration } from '@client/declarations'
import { EventType } from '@client/utils/gateway'
import { WORKQUEUE_TABS } from '@client/components/interface/WorkQueueTabs'
import { vi } from 'vitest'
import { formatUrl } from '@client/navigation'
import { VERIFY_CORRECTOR } from '@client/navigation/routes'

describe('verify corrector tests', () => {
  const { store } = createStore()

  const birthDeclaration = {
    id: 'mockBirth1234',
    data: mockDeclarationData,
    event: EventType.Birth
  }

  const deathDeclaration = {
    id: 'mockDeath1234',
    data: mockDeathDeclarationData,
    event: EventType.Death
  }

  describe('in case of birth declaration', () => {
    beforeAll(async () => {
      store.dispatch(storeDeclaration(birthDeclaration))
    })

    it('when mother is corrector renders idVerifier component', async () => {
      const { component: testComponent } = await createTestComponent(
        <VerifyCorrector />,
        {
          store,
          path: VERIFY_CORRECTOR,
          initialEntries: [
            formatUrl(VERIFY_CORRECTOR, {
              declarationId: 'mockBirth1234',
              corrector: 'mother'
            })
          ]
        }
      )

      expect(testComponent.find('#idVerifier').hostNodes()).toHaveLength(1)
    })

    it('when child is corrector renders idVerifier component', async () => {
      const { component: testComponent } = await createTestComponent(
        <VerifyCorrector />,
        {
          store,
          path: VERIFY_CORRECTOR,
          initialEntries: [
            formatUrl(VERIFY_CORRECTOR, {
              declarationId: 'mockBirth1234',
              corrector: 'child'
            })
          ]
        }
      )

      expect(testComponent.find('#idVerifier').hostNodes()).toHaveLength(1)
    })

    it('should takes user go back', async () => {
      const { component: testComponent, router } = await createTestComponent(
        <VerifyCorrector />,
        {
          store,
          path: VERIFY_CORRECTOR,
          initialEntries: [
            '/',
            formatUrl(VERIFY_CORRECTOR, {
              declarationId: 'mockBirth1234',
              corrector: 'mother'
            })
          ]
        }
      )

      testComponent
        .find('#action_page_back_button')
        .hostNodes()
        .simulate('click')

      await flushPromises()

      testComponent.update()

      expect(router.state.location.pathname).toBe('/')
    })
  })

  describe('when father is corrector', () => {
    let testComponent: TestComponentWithRouteMock
    beforeEach(async () => {
      testComponent = await createTestComponent(<VerifyCorrector />, {
        store,
        path: VERIFY_CORRECTOR,
        initialEntries: [
          formatUrl(VERIFY_CORRECTOR, {
            declarationId: 'mockBirth1234',
            corrector: 'father'
          })
        ]
      })
    })

    it('renders idVerifier compomnent', () => {
      expect(
        testComponent.component.find('#idVerifier').hostNodes()
      ).toHaveLength(1)
    })

    it('clicking on yes button takes user to review certificate', () => {
      const date = new Date(243885600000)
      vi.setSystemTime(date)

      testComponent.component
        .find('#idVerifier')
        .find('#verifyPositive')
        .hostNodes()
        .simulate('click')

      testComponent.component.update()

      expect(testComponent.router.state.location.pathname).not.toContain(
        '/verify'
      )
    })

    it('clicking on cancel button hides the modal', () => {
      testComponent.component
        .find('#idVerifier')
        .find('#verifyNegative')
        .hostNodes()
        .simulate('click')

      testComponent.component.update()

      testComponent.component
        .find('#withoutVerificationPrompt')
        .find('#cancel')
        .hostNodes()
        .simulate('click')

      testComponent.component.update()

      expect(
        testComponent.component.find('#withoutVerificationPrompt').hostNodes()
      ).toHaveLength(0)
    })

    it('clicking on Confirm button and go to review', () => {
      testComponent.component
        .find('#idVerifier')
        .find('#verifyNegative')
        .hostNodes()
        .simulate('click')

      testComponent.component.update()

      testComponent.component
        .find('#withoutVerificationPrompt')
        .find('#send')
        .hostNodes()
        .simulate('click')

      testComponent.component.update()

      expect(testComponent.router.state.location.pathname).toContain(
        '/review-view-group'
      )
    })

    it('go to review page', () => {
      testComponent.component.find('#crcl-btn').hostNodes().simulate('click')

      testComponent.component.update()

      expect(testComponent.router.state.location.pathname).toContain(
        WORKQUEUE_TABS.readyForReview
      )
    })
  })

  describe('in case correction is not father, mother, child or informant', () => {
    let testComponent: TestComponentWithRouteMock
    beforeEach(async () => {
      testComponent = await createTestComponent(<VerifyCorrector />, {
        store,
        path: VERIFY_CORRECTOR,
        initialEntries: [
          formatUrl(VERIFY_CORRECTOR, {
            declarationId: 'mockBirth1234',
            corrector: 'other'
          })
        ]
      })
    })

    it('renders idVerifier compomnent', () => {
      expect(
        testComponent.component.find('#idVerifier').hostNodes()
      ).toHaveLength(1)
    })

    it('clicking on yes button takes user to review certificate', () => {
      const date = new Date(243885600000)
      vi.setSystemTime(date)

      testComponent.component
        .find('#idVerifier')
        .find('#verifyPositive')
        .hostNodes()
        .simulate('click')

      testComponent.component.update()

      expect(testComponent.router.state.location.pathname).not.toContain(
        '/verify'
      )
    })

    it('clicking on no button shows up modal', () => {
      testComponent.component
        .find('#idVerifier')
        .find('#verifyNegative')
        .hostNodes()
        .simulate('click')

      testComponent.component.update()

      expect(
        testComponent.component.find('#withoutVerificationPrompt').hostNodes()
      ).toHaveLength(1)
    })
  })

  describe('in case of death declaration', () => {
    beforeAll(async () => {
      store.dispatch(storeDeclaration(deathDeclaration))
    })

    it('when informant is corrector renders idVerifier component', async () => {
      const { component: testComponent } = await createTestComponent(
        <VerifyCorrector />,
        {
          store,
          path: VERIFY_CORRECTOR,
          initialEntries: [
            formatUrl(VERIFY_CORRECTOR, {
              declarationId: 'mockDeath1234',
              corrector: 'informant'
            })
          ]
        }
      )

      expect(testComponent.find('#idVerifier').hostNodes()).toHaveLength(1)
    })
  })
})

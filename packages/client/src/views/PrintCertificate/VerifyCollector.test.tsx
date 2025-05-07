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
  TestComponentWithRouteMock
} from '@client/tests/util'
import { VerifyCollector } from './VerifyCollector'
import { storeDeclaration } from '@client/declarations'
import { EventType } from '@client/utils/gateway'
import { formatUrl } from '@client/navigation'
import { VERIFY_COLLECTOR } from '@client/navigation/routes'

describe('verify collector tests', () => {
  const { store } = createStore()

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
    event: EventType.Birth
  }

  const deathDeclaration = {
    id: 'mockDeath1234',
    data: {
      ...mockDeathDeclarationData,
      history: [
        {
          date: '2022-03-21T08:16:24.467+00:00',
          regStatus: 'REGISTERED',
          reinstated: false
        }
      ]
    },
    event: EventType.Death
  }

  describe('in case of birth declaration', () => {
    beforeAll(async () => {
      // @ts-ignore
      store.dispatch(storeDeclaration(birthDeclaration))
    })

    it('when mother is collector renders idVerifier component', async () => {
      const { component: testComponent } = await createTestComponent(
        <VerifyCollector />,
        {
          store,
          path: VERIFY_COLLECTOR,
          initialEntries: [
            formatUrl(VERIFY_COLLECTOR, {
              registrationId: 'mockBirth1234',
              eventType: EventType.Birth,
              collector: 'mother'
            })
          ]
        }
      )

      expect(testComponent.find('#idVerifier').hostNodes()).toHaveLength(1)
    })

    it('should take user go back', async () => {
      const { component: testComponent, router } = await createTestComponent(
        <VerifyCollector />,
        {
          store,
          path: VERIFY_COLLECTOR,
          initialEntries: [
            '/',
            formatUrl(VERIFY_COLLECTOR, {
              registrationId: 'mockBirth1234',
              eventType: EventType.Birth,
              collector: 'mother'
            })
          ]
        }
      )

      testComponent
        .find('#action_page_back_button')
        .hostNodes()
        .simulate('click')

      await new Promise((resolve) => {
        setTimeout(resolve, 500)
      })

      testComponent.update()

      expect(router.state.location.pathname).toBe('/')
    })

    describe('when informant is collector', () => {
      let testComponent: TestComponentWithRouteMock
      beforeAll(() => {
        // @ts-ignore
        store.dispatch(storeDeclaration(deathDeclaration))
      })
      beforeEach(async () => {
        testComponent = await createTestComponent(<VerifyCollector />, {
          store,
          path: VERIFY_COLLECTOR,
          initialEntries: [
            formatUrl(VERIFY_COLLECTOR, {
              registrationId: 'mockDeath1234',
              eventType: EventType.Death,
              collector: 'informant'
            })
          ]
        })
      })

      it('renders idVerifier compomnent', () => {
        expect(
          testComponent.component.find('#idVerifier').hostNodes()
        ).toHaveLength(1)
      })

      it('clicking on yes button takes user to review certificate if there is no fee', () => {
        testComponent.component
          .find('#idVerifier')
          .find('#verifyPositive')
          .hostNodes()
          .simulate('click')

        expect(testComponent.router.state.location.pathname).toContain('review')
      })

      describe('when father is collector', () => {
        let testComponent: TestComponentWithRouteMock
        beforeAll(() => {
          // @ts-ignore
          store.dispatch(storeDeclaration(birthDeclaration))
        })
        beforeEach(async () => {
          testComponent = await createTestComponent(<VerifyCollector />, {
            store,
            path: VERIFY_COLLECTOR,
            initialEntries: [
              formatUrl(VERIFY_COLLECTOR, {
                registrationId: 'mockBirth1234',
                eventType: EventType.Death,
                collector: 'father'
              })
            ]
          })
        })

        it('clicking on send button on modal takes user to payment if there is fee', () => {
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

          expect(testComponent.router.state.location.pathname).toContain(
            'payment'
          )
        })
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
    })
  })

  describe('in case of death declaration renders idVerifier component', () => {
    beforeAll(() => {
      // @ts-ignore
      store.dispatch(storeDeclaration(deathDeclaration))
    })

    it('when informant is collector', async () => {
      const { component: testComponent } = await createTestComponent(
        <VerifyCollector />,
        {
          store,
          path: VERIFY_COLLECTOR,
          initialEntries: [
            formatUrl(VERIFY_COLLECTOR, {
              registrationId: 'mockDeath1234',
              eventType: EventType.Death,
              collector: 'informant'
            })
          ]
        }
      )

      expect(testComponent.find('#idVerifier').hostNodes()).toHaveLength(1)
    })
  })
})

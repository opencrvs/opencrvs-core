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
  mockUserResponse,
  flushPromises,
  setScopes,
  REGISTRATION_AGENT_DEFAULT_SCOPES
} from '@client/tests/util'
import { storeDeclaration } from '@client/declarations'
import { EventType } from '@client/utils/gateway'
import { Payment } from './Payment'
import { queries } from '@client/profile/queries'
import { Mock } from 'vitest'
import {
  PRINT_CERTIFICATE_PAYMENT,
  REGISTRAR_HOME_TAB
} from '@client/navigation/routes'
import { formatUrl } from '@client/navigation'
import { WORKQUEUE_TABS } from '@client/components/interface/WorkQueueTabs'
;(queries.fetchUserDetails as Mock).mockReturnValue(mockUserResponse)

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
      setScopes(REGISTRATION_AGENT_DEFAULT_SCOPES, store)
      await flushPromises()
      // @ts-ignore
      store.dispatch(
        storeDeclaration({
          ...birthDeclaration,
          // @ts-ignore
          data: {
            ...birthDeclaration.data,
            registration: {
              ...birthDeclaration.data.registration,
              certificates: [
                {
                  collector: {
                    type: 'MOTHER'
                  },
                  hasShowedVerifiedDocument: true,
                  certificateTemplateId: 'birth-certificate'
                }
              ]
            }
          }
        })
      )
    })

    it('when mother is collector renders Payment component', async () => {
      const { component: testComponent } = await createTestComponent(
        <Payment />,
        {
          store,
          path: PRINT_CERTIFICATE_PAYMENT,
          initialEntries: [
            formatUrl(PRINT_CERTIFICATE_PAYMENT, {
              registrationId: 'mockBirth1234',
              eventType: EventType.Birth
            })
          ]
        }
      )

      expect(testComponent.find('#service').hostNodes().text()).toContain(
        'Birth'
      )

      expect(testComponent.find('#amountDue').hostNodes().text()).toContain(
        '15'
      )

      testComponent.find('#Continue').hostNodes().simulate('click')
    })

    /*

    // Commenting out this test because receipt templates are not currently configurable

    it('print payment receipt', async () => {
      const printMoneyReceiptSpy = vi.spyOn(PDFUtils, 'printMoneyReceipt')
      const {router: testComponent} = await createTestComponent(
        <Payment
          location={mockLocation}
          history={history}
          match={{
            params: {
              registrationId: 'mockBirth1234',
              eventType: EventType.Birth
            },
            isExact: true,
            path: '',
            url: ''
          }}
        />,
        { store, initialEntries: [formatUrl('/', {
         })] }
      )

      testComponent.find('#print-receipt').hostNodes().simulate('click')

      expect(printMoneyReceiptSpy).toBeCalled()
    })*/

    it('invalid declaration id', async () => {
      const { router } = await createTestComponent(<Payment />, {
        store,
        path: PRINT_CERTIFICATE_PAYMENT,
        initialEntries: [
          formatUrl(PRINT_CERTIFICATE_PAYMENT, {
            registrationId: 'mockBirth',
            eventType: EventType.Birth
          })
        ]
      })
      expect(router.state.location.pathname).toEqual(
        formatUrl(REGISTRAR_HOME_TAB, {
          tabId: WORKQUEUE_TABS.readyToPrint,
          selectorId: ''
        })
      )
    })
  })

  describe('in case of death declaration renders payment component', () => {
    beforeAll(() => {
      // @ts-ignore
      store.dispatch(storeDeclaration(deathDeclaration))
    })

    it('when informant is collector', async () => {
      const { component: testComponent } = await createTestComponent(
        <Payment />,
        {
          store,
          path: PRINT_CERTIFICATE_PAYMENT,
          initialEntries: [
            formatUrl(PRINT_CERTIFICATE_PAYMENT, {
              registrationId: 'mockDeath1234',
              eventType: EventType.Death
            })
          ]
        }
      )

      expect(testComponent.find('#service').hostNodes().text()).toContain(
        'Death'
      )
    })
  })
})

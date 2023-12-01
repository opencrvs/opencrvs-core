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
  validToken,
  mockUserResponse,
  flushPromises
} from '@client/tests/util'
import { storeDeclaration } from '@client/declarations'
import { Event } from '@client/utils/gateway'
import { Payment } from './Payment'
import { queries } from '@client/profile/queries'
import { checkAuth } from '@client/profile/profileActions'
import { vi, Mock } from 'vitest'
import { WORKQUEUE_TABS } from '@client/components/interface/Navigation'
import { REGISTRAR_HOME_TAB } from '@client/navigation/routes'
import { formatUrl } from '@client/navigation'

const getItem = window.localStorage.getItem as Mock
;(queries.fetchUserDetails as Mock).mockReturnValue(mockUserResponse)

describe('verify collector tests', () => {
  const { store, history } = createStore()
  const mockLocation: any = vi.fn()

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
      ...mockDeathDeclarationData,
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

  describe('in case of birth declaration', () => {
    beforeAll(async () => {
      getItem.mockReturnValue(validToken)
      await store.dispatch(checkAuth())
      await flushPromises()
      // @ts-ignore
      store.dispatch(storeDeclaration(birthDeclaration))
    })

    it('when mother is collector renders Payment component', async () => {
      const testComponent = await createTestComponent(
        <Payment
          history={history}
          location={mockLocation}
          match={{
            params: {
              registrationId: 'mockBirth1234',
              eventType: Event.Birth
            },
            isExact: true,
            path: '',
            url: ''
          }}
        />,
        { store, history }
      )

      expect(testComponent.find('#service').hostNodes().text()).toContain(
        'Birth'
      )

      expect(testComponent.find('#amountDue').hostNodes().text()).toContain(
        '20'
      )

      testComponent.find('#Continue').hostNodes().simulate('click')
    })

    /*

    // Commenting out this test because receipt templates are not currently configurable

    it('print payment receipt', async () => {
      const printMoneyReceiptSpy = vi.spyOn(PDFUtils, 'printMoneyReceipt')
      const testComponent = await createTestComponent(
        <Payment
          location={mockLocation}
          history={history}
          match={{
            params: {
              registrationId: 'mockBirth1234',
              eventType: Event.Birth
            },
            isExact: true,
            path: '',
            url: ''
          }}
        />,
        { store, history }
      )

      testComponent.find('#print-receipt').hostNodes().simulate('click')

      expect(printMoneyReceiptSpy).toBeCalled()
    })*/

    it('invalid declaration id', async () => {
      await createTestComponent(
        <Payment
          location={mockLocation}
          history={history}
          match={{
            params: {
              registrationId: 'mockBirth',
              eventType: Event.Birth
            },
            isExact: true,
            path: '',
            url: ''
          }}
        />,
        { store, history }
      )
      expect(history.location.pathname).toEqual(
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
      const testComponent = await createTestComponent(
        <Payment
          location={mockLocation}
          history={history}
          match={{
            params: {
              registrationId: 'mockDeath1234',
              eventType: Event.Death
            },
            isExact: true,
            path: '',
            url: ''
          }}
        />,
        { store, history }
      )

      expect(testComponent.find('#service').hostNodes().text()).toContain(
        'Death'
      )
    })
  })
})

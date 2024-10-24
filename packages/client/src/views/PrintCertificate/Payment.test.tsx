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
import { IFormSectionData } from '@client/forms'

// Mock setup
const getItem = window.localStorage.getItem as Mock
;(queries.fetchUserDetails as Mock).mockReturnValue(mockUserResponse)

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
    ] as unknown as IFormSectionData
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
    ] as unknown as IFormSectionData
  },
  event: Event.Death
}

// Helper function to set up test
async function setupPaymentTest({
  registrationId,
  eventType,
  declaration,
  store,
  history,
  mockLocation
}: {
  registrationId: string
  eventType: string
  declaration: any
  store: any
  history: any
  mockLocation: any
}) {
  store.dispatch(storeDeclaration(declaration))
  await flushPromises()

  const testComponent = await createTestComponent(
    <Payment
      history={history}
      location={mockLocation}
      match={{
        params: {
          registrationId,
          eventType
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
  const mockLocation: any = vi.fn()

  describe('in case of birth declaration', () => {
    beforeAll(async () => {
      getItem.mockReturnValue(validToken)
      await store.dispatch(checkAuth())
      await flushPromises()
      store.dispatch(storeDeclaration(birthDeclaration))
    })

    it('renders Payment component when mother is collector', async () => {
      const testComponent = await setupPaymentTest({
        registrationId: 'mockBirth1234',
        eventType: 'birth',
        declaration: birthDeclaration,
        store,
        history,
        mockLocation
      })

      expect(testComponent.find('#service').hostNodes().text()).toContain(
        'Birth'
      )
      expect(testComponent.find('#amountDue').hostNodes().text()).toContain(
        '15'
      )

      testComponent.find('#Continue').hostNodes().simulate('click')
    })

    it('redirects to home on invalid declaration id', async () => {
      await createTestComponent(
        <Payment
          location={mockLocation}
          history={history}
          match={{
            params: {
              registrationId: 'mockBirth',
              eventType: 'birth'
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

  describe('in case of death declaration renders Payment component', () => {
    beforeAll(() => {
      store.dispatch(storeDeclaration(deathDeclaration))
    })

    it('renders Payment component when informant is collector', async () => {
      const testComponent = await setupPaymentTest({
        registrationId: 'mockDeath1234',
        eventType: 'death',
        declaration: deathDeclaration,
        store,
        history,
        mockLocation
      })

      expect(testComponent.find('#service').hostNodes().text()).toContain(
        'Death'
      )
    })
  })
})

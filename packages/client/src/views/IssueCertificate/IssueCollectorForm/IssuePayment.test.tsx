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
import { WORKQUEUE_TABS } from '@client/components/interface/Navigation'
import { formatUrl } from '@client/navigation'
import { REGISTRAR_HOME_TAB } from '@client/navigation/routes'
import { checkAuth } from '@client/profile/profileActions'
import { queries } from '@client/profile/queries'
import { createStore } from '@client/store'
import {
  createTestComponent,
  flushPromises,
  mockDeathDeclarationData,
  mockDeclarationData,
  mockUserResponse,
  validToken
} from '@client/tests/util'
import { Event } from '@client/utils/gateway'
import * as React from 'react'
import { Mock, vi } from 'vitest'
import { IssuePayment } from './IssuePayment'
import { storeDeclaration } from '@client/declarations'
import { useParams } from 'react-router'

const getItem = window.localStorage.getItem as Mock
;(queries.fetchUserDetails as Mock).mockReturnValue(mockUserResponse)

const birthDeclaration = {
  id: 'mockBirth1234',
  data: {
    ...mockDeclarationData,
    history: [
      {
        date: '2021-03-21T08:16:24.467+00:00',
        regStatus: 'CERTIFIED',
        reinstated: false
      },
      {
        date: '2021-03-21T08:16:24.467+00:00',
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
        date: '2021-03-21T08:16:24.467+00:00',
        regStatus: 'CERTIFIED',
        reinstated: false
      },
      {
        date: '2021-03-21T08:16:24.467+00:00',
        regStatus: 'REGISTERED',
        reinstated: false
      }
    ]
  },
  event: Event.Death
}

describe('verify collector tests for issuance', () => {
  const { store, history } = createStore()
  beforeAll(async () => {
    getItem.mockReturnValue(validToken)
    ;(useParams as Mock).mockImplementation(() => ({
      registrationId: 'mockBirth1234',
      eventType: 'birth'
    }))
    // @ts-ignore
    store.dispatch(storeDeclaration(birthDeclaration))
  })

  it('when mother is collector renders issue payment component', async () => {
    const testComponent = await createTestComponent(<IssuePayment />, {
      store,
      history
    })
    expect(testComponent.find('#service').hostNodes().text()).toContain('Birth')
    expect(testComponent.find('#amountDue').hostNodes().text()).toContain('20')
    testComponent.find('#Continue').hostNodes().simulate('click')
  })

  it('invalid declaration id for issue certificate', async () => {
    const { store, history } = createStore()
    const mockLocation: any = vi.fn()
    await createTestComponent(
      <IssuePayment
        //@ts-ignore
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
        tabId: WORKQUEUE_TABS.readyToIssue,
        selectorId: ''
      })
    )
  })
})

describe('in case of death declaration renders issue payment component', () => {
  const { store, history } = createStore()
  beforeAll(async () => {
    getItem.mockReturnValue(validToken)
    ;(useParams as Mock).mockImplementation(() => ({
      registrationId: 'mockDeath1234',
      eventType: 'death'
    }))
    //@ts-ignore
    store.dispatch(storeDeclaration(deathDeclaration))
  })

  it('when informant is collector', async () => {
    const testComponent = await createTestComponent(<IssuePayment />, {
      store,
      history
    })
    expect(testComponent.find('#service').hostNodes().text()).toContain('Death')
    expect(testComponent.find('#amountDue').hostNodes().text()).toContain('0.0')
    testComponent.find('#Continue').hostNodes().simulate('click')
  })
})

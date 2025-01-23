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
import { WORKQUEUE_TABS } from '@client/components/interface/WorkQueueTabs'
import { formatUrl } from '@client/navigation'
import {
  ISSUE_CERTIFICATE_PAYMENT,
  REGISTRAR_HOME_TAB
} from '@client/navigation/routes'
import { queries } from '@client/profile/queries'
import { createStore } from '@client/store'
import {
  createTestComponent,
  mockDeathDeclarationData,
  mockDeclarationData,
  mockUserResponse,
  validToken
} from '@client/tests/util'
import { EventType } from '@client/utils/gateway'
import * as React from 'react'
import { Mock } from 'vitest'
import { IssuePayment } from './IssuePayment'
import { storeDeclaration } from '@client/declarations'

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
  event: EventType.Birth
}

const deathDeclaration = {
  id: 'mockDeath1234',
  data: {
    ...mockDeathDeclarationData,
    registration: {
      ...mockDeathDeclarationData.registration,
      certificates: [
        {
          certificateTemplateId: 'death-certificate-copy'
        }
      ]
    },
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
  event: EventType.Death
}

describe('verify collector tests for issuance', () => {
  const { store } = createStore()
  beforeAll(async () => {
    getItem.mockReturnValue(validToken)

    // @ts-ignore
    store.dispatch(storeDeclaration(birthDeclaration))
  })

  it('when mother is collector renders issue payment component', async () => {
    const { component: testComponent } = await createTestComponent(
      <IssuePayment />,
      {
        path: ISSUE_CERTIFICATE_PAYMENT,
        initialEntries: [
          formatUrl(ISSUE_CERTIFICATE_PAYMENT, {
            registrationId: 'mockBirth1234',
            eventType: 'birth'
          })
        ],
        store
      }
    )
    expect(testComponent.find('#service').hostNodes().text()).toContain('Birth')
    expect(testComponent.find('#amountDue').hostNodes().text()).toContain('15')
    testComponent.find('#Continue').hostNodes().simulate('click')
  })

  it('invalid declaration id for issue certificate', async () => {
    const { store } = createStore()

    const { router } = await createTestComponent(<IssuePayment />, {
      store,
      path: ISSUE_CERTIFICATE_PAYMENT,
      initialEntries: [
        formatUrl(ISSUE_CERTIFICATE_PAYMENT, {
          registrationId: 'mockBirth',
          eventType: EventType.Birth
        })
      ]
    })

    expect(router.state.location.pathname).toEqual(
      formatUrl(REGISTRAR_HOME_TAB, {
        tabId: WORKQUEUE_TABS.readyToIssue,
        selectorId: ''
      })
    )
  })
})

describe('in case of birth declaration renders issue payment component', () => {
  const { store } = createStore()
  beforeAll(async () => {
    getItem.mockReturnValue(validToken)

    //@ts-ignore
    store.dispatch(storeDeclaration(deathDeclaration))
  })

  it('when informant is collector', async () => {
    const { component: testComponent } = await createTestComponent(
      <IssuePayment />,
      {
        store,
        path: ISSUE_CERTIFICATE_PAYMENT,
        initialEntries: [
          formatUrl(ISSUE_CERTIFICATE_PAYMENT, {
            registrationId: 'mockDeath1234',
            eventType: 'death'
          })
        ]
      }
    )
    expect(testComponent.find('#service').hostNodes().text()).toContain('Death')
    expect(testComponent.find('#amountDue').hostNodes().text()).toContain('15')
    testComponent.find('#Continue').hostNodes().simulate('click')
  })
})

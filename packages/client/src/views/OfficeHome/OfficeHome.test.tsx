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

import { queries } from '@client/profile/queries'
import { storage } from '@client/storage'
import { createStore } from '@client/store'
import {
  createTestComponent,
  mockUserResponse,
  flushPromises,
  setScopes,
  REGISTRAR_DEFAULT_SCOPES
} from '@client/tests/util'
import { createClient } from '@client/utils/apolloClient'
import { OfficeHome } from '@client/views/OfficeHome/OfficeHome'
import { Spinner } from '@opencrvs/components/lib/Spinner'
import { merge } from 'lodash'
import * as React from 'react'

import { waitFor, waitForElement } from '@client/tests/wait-for-element'
import { SELECTOR_ID } from './inProgress/InProgress'
import { WORKQUEUE_TABS } from '@client/components/interface/WorkQueueTabs'
import { Scope, SCOPES, scopes } from '@opencrvs/commons/client'
import { vi } from 'vitest'
import { REGISTRAR_HOME_TAB } from '@client/navigation/routes'
import { formatUrl } from '@client/navigation'

const mockFetchUserDetails = vi.fn()
const mockListSyncController = vi.fn()

const nameObj = {
  data: {
    getUser: {
      name: [
        {
          use: 'en',
          firstNames: 'Mohammad',
          familyName: 'Ashraful',
          __typename: 'HumanName'
        },
        { use: 'bn', firstNames: '', familyName: '', __typename: 'HumanName' }
      ],
      role: {
        _id: '778464c0-08f8-4fb7-8a37-b86d1efc462a',
        labels: [
          {
            lang: 'en',
            label: 'DISTRICT_REGISTRAR'
          }
        ]
      }
    }
  }
}
merge(mockUserResponse, nameObj)
mockFetchUserDetails.mockReturnValue(mockUserResponse)
queries.fetchUserDetails = mockFetchUserDetails

storage.getItem = vi.fn()
storage.setItem = vi.fn()

let { store } = createStore()
let client = createClient(store)
beforeEach(async () => {
  ;({ store } = createStore())
  client = createClient(store)
  setScopes(REGISTRAR_DEFAULT_SCOPES, store)
})

describe('OfficeHome related tests', () => {
  it('sets loading state while waiting for data', async () => {
    const { component: testComponent } = await createTestComponent(
      <OfficeHome />,
      {
        store,
        path: REGISTRAR_HOME_TAB,
        initialEntries: [
          formatUrl(REGISTRAR_HOME_TAB, {
            tabId: WORKQUEUE_TABS.inProgress
          })
        ]
      }
    )

    expect(
      testComponent.containsMatchingElement(
        Spinner as unknown as React.ReactElement
      )
    ).toBe(true)
  })

  describe('should load data', () => {
    beforeEach(() => {
      mockListSyncController.mockReturnValue({
        data: {
          inProgressTab: { totalItems: 5, results: [] },
          notificationTab: { totalItems: 2, results: [] },
          reviewTab: { totalItems: 3, results: [] },
          rejectTab: { totalItems: 4, results: [] },
          approvalTab: { totalItems: 0, results: [] },
          printTab: { totalItems: 1, results: [] },
          externalValidationTab: { totalItems: 6, results: [] }
        }
      })
      client.query = mockListSyncController
    })
    it('renders page with five tabs', async () => {
      const { component: testComponent } = await createTestComponent(
        <OfficeHome />,
        {
          store,
          apolloClient: client,
          path: REGISTRAR_HOME_TAB,
          initialEntries: [
            formatUrl(REGISTRAR_HOME_TAB, {
              tabId: WORKQUEUE_TABS.inProgress
            })
          ]
        }
      )

      await waitForElement(testComponent, '#navigation_progress')
      await waitForElement(testComponent, '#navigation_readyForReview')
      await waitForElement(testComponent, '#navigation_requiresUpdate')
      await waitForElement(testComponent, '#navigation_print')
      await waitForElement(testComponent, '#navigation_waitingValidation')
    })

    it('renders tabs with count', async () => {
      const { component: testComponent } = await createTestComponent(
        <OfficeHome />,
        {
          store,
          apolloClient: client,
          path: REGISTRAR_HOME_TAB,
          initialEntries: [
            formatUrl(REGISTRAR_HOME_TAB, {
              tabId: WORKQUEUE_TABS.inProgress
            })
          ]
        }
      )
      await flushPromises()

      const app = testComponent
      await waitForElement(app, '#navigation_progress')
      await waitFor(() =>
        app
          .find('#navigation_progress')
          .hostNodes()
          .text()
          .includes('In progress7')
      )
      expect(
        app.find('#navigation_readyForReview').hostNodes().text()
      ).toContain('Ready for review3')
      expect(
        app.find('#navigation_requiresUpdate').hostNodes().text()
      ).toContain('Requires update4')
      expect(
        app.find('#navigation_waitingValidation').hostNodes().text()
      ).toContain('In external validation6')
      expect(app.find('#navigation_print').hostNodes().text()).toContain(
        'Ready to print1'
      )
    })
  })
  describe('shows no-record message if error there is no data', () => {
    beforeEach(() => {
      mockListSyncController.mockReturnValue({
        data: {
          inProgressTab: { totalItems: 0, results: [] },
          notificationTab: { totalItems: 0, results: [] },
          reviewTab: { totalItems: 0, results: [] },
          rejectTab: { totalItems: 0, results: [] },
          approvalTab: { totalItems: 0, results: [] },
          printTab: { totalItems: 0, results: [] },
          externalValidationTab: { totalItems: 0, results: [] }
        }
      })
      client.query = mockListSyncController
    })
    it('shows no-record message in inProgress drafts tab', async () => {
      const { component: testComponent } = await createTestComponent(
        <OfficeHome />,
        {
          store,
          apolloClient: client,
          path: REGISTRAR_HOME_TAB,
          initialEntries: [
            formatUrl(REGISTRAR_HOME_TAB, {
              tabId: WORKQUEUE_TABS.inProgress
            })
          ]
        }
      )
      await waitForElement(testComponent, '#no-record')
    })
    it('shows no-record message in inProgress fieldagent drafts tab', async () => {
      const { component: testComponent } = await createTestComponent(
        <OfficeHome />,
        {
          store,
          apolloClient: client,
          path: REGISTRAR_HOME_TAB,
          initialEntries: [
            formatUrl(REGISTRAR_HOME_TAB, {
              tabId: WORKQUEUE_TABS.inProgress,
              selectorId: SELECTOR_ID.fieldAgentDrafts
            })
          ]
        }
      )
      await waitForElement(testComponent, '#no-record')
    })
    it('shows no-record message in inProgress hospital drafts tab', async () => {
      const { component: testComponent } = await createTestComponent(
        <OfficeHome />,
        {
          store,
          apolloClient: client
        }
      )
      await waitForElement(testComponent, '#no-record')
    })
    it('shows no-record message in review tab', async () => {
      const { component: testComponent } = await createTestComponent(
        <OfficeHome />,
        {
          store,
          apolloClient: client,
          path: REGISTRAR_HOME_TAB,
          initialEntries: [
            formatUrl(REGISTRAR_HOME_TAB, {
              tabId: WORKQUEUE_TABS.readyForReview
            })
          ]
        }
      )
      await waitForElement(testComponent, '#no-record')
    })
    it('shows no-record message in reject tab', async () => {
      const { component: testComponent } = await createTestComponent(
        <OfficeHome />,
        {
          store,
          apolloClient: client,
          path: REGISTRAR_HOME_TAB,
          initialEntries: [
            formatUrl(REGISTRAR_HOME_TAB, {
              tabId: WORKQUEUE_TABS.requiresUpdate
            })
          ]
        }
      )
      await waitForElement(testComponent, '#no-record')
    })
    it('shows no-record message in approval tab', async () => {
      const { component: testComponent } = await createTestComponent(
        <OfficeHome />,
        {
          store,
          apolloClient: client,
          path: REGISTRAR_HOME_TAB,
          initialEntries: [
            formatUrl(REGISTRAR_HOME_TAB, {
              tabId: WORKQUEUE_TABS.sentForApproval
            })
          ]
        }
      )
      await waitForElement(testComponent, '#no-record')
    })
    it('shows no-record message in print tab', async () => {
      const { component: testComponent } = await createTestComponent(
        <OfficeHome />,
        {
          store,
          apolloClient: client,
          path: REGISTRAR_HOME_TAB,
          initialEntries: [
            formatUrl(REGISTRAR_HOME_TAB, {
              tabId: WORKQUEUE_TABS.readyToPrint
            })
          ]
        }
      )
      await waitForElement(testComponent, '#no-record')
    })

    it('shows no-record message in externalValidation tab', async () => {
      const { component: testComponent } = await createTestComponent(
        <OfficeHome />,
        {
          store,
          apolloClient: client,
          path: REGISTRAR_HOME_TAB,
          initialEntries: [
            formatUrl(REGISTRAR_HOME_TAB, {
              tabId: WORKQUEUE_TABS.externalValidation
            })
          ]
        }
      )

      await waitForElement(testComponent, '#no-record')
    })
  })

  describe('shows error message if error occurs while querying', () => {
    beforeEach(() => {
      mockListSyncController.mockReturnValue({
        error: true
      })
      client.query = mockListSyncController
    })
    it('shows error message in inProgress fieldagent drafts tab', async () => {
      const { component: testComponent } = await createTestComponent(
        <OfficeHome />,
        {
          store,
          apolloClient: client,
          path: REGISTRAR_HOME_TAB,
          initialEntries: [
            formatUrl(REGISTRAR_HOME_TAB, {
              tabId: WORKQUEUE_TABS.inProgress,
              selectorId: SELECTOR_ID.fieldAgentDrafts
            })
          ]
        }
      )

      await waitForElement(testComponent, '#search-result-error-text-count')
    })
    it('shows error message in inProgress hospital drafts tab', async () => {
      const { component: testComponent } = await createTestComponent(
        <OfficeHome />,
        {
          store,
          apolloClient: client,
          path: REGISTRAR_HOME_TAB,
          initialEntries: [
            formatUrl(REGISTRAR_HOME_TAB, {
              tabId: WORKQUEUE_TABS.inProgress,
              selectorId: SELECTOR_ID.hospitalDrafts
            })
          ]
        }
      )

      await waitForElement(testComponent, '#search-result-error-text-count')
    })
    it('shows error message in review tab', async () => {
      const { component: testComponent } = await createTestComponent(
        <OfficeHome />,
        {
          store,
          apolloClient: client,
          path: REGISTRAR_HOME_TAB,
          initialEntries: [
            formatUrl(REGISTRAR_HOME_TAB, {
              tabId: WORKQUEUE_TABS.readyForReview
            })
          ]
        }
      )

      await waitForElement(testComponent, '#search-result-error-text-count')
    })
    it('shows error message in reject tab', async () => {
      const { component: testComponent } = await createTestComponent(
        <OfficeHome />,
        {
          store,
          apolloClient: client,
          path: REGISTRAR_HOME_TAB,
          initialEntries: [
            formatUrl(REGISTRAR_HOME_TAB, {
              tabId: WORKQUEUE_TABS.requiresUpdate
            })
          ]
        }
      )

      await waitForElement(testComponent, '#search-result-error-text-count')
    })
    it('shows error message in approval tab', async () => {
      const { component: testComponent } = await createTestComponent(
        <OfficeHome />,
        {
          store,
          apolloClient: client,
          path: REGISTRAR_HOME_TAB,
          initialEntries: [
            formatUrl(REGISTRAR_HOME_TAB, {
              tabId: WORKQUEUE_TABS.sentForApproval
            })
          ]
        }
      )

      await waitForElement(testComponent, '#search-result-error-text-count')
    })
    it('shows error message in print tab', async () => {
      const { component: testComponent } = await createTestComponent(
        <OfficeHome />,
        {
          store,
          apolloClient: client,
          path: REGISTRAR_HOME_TAB,
          initialEntries: [
            formatUrl(REGISTRAR_HOME_TAB, {
              tabId: WORKQUEUE_TABS.readyToPrint
            })
          ]
        }
      )

      await waitForElement(testComponent, '#search-result-error-text-count')
    })
    it('shows error message in externalValidation tab', async () => {
      const { component: testComponent } = await createTestComponent(
        <OfficeHome />,
        {
          store,
          apolloClient: client,
          path: REGISTRAR_HOME_TAB,
          initialEntries: [
            formatUrl(REGISTRAR_HOME_TAB, {
              tabId: WORKQUEUE_TABS.externalValidation
            })
          ]
        }
      )

      await waitForElement(testComponent, '#search-result-error-text-count')
    })
  })

  describe('new event button should be visible when the user has the correct scopes', () => {
    const build = async () =>
      await createTestComponent(<OfficeHome />, {
        store,
        apolloClient: client,
        path: REGISTRAR_HOME_TAB,
        initialEntries: [
          formatUrl(REGISTRAR_HOME_TAB, {
            tabId: WORKQUEUE_TABS.inProgress
          })
        ]
      })

    const requiredScopes = [
      SCOPES.RECORD_DECLARE_BIRTH,
      SCOPES.RECORD_DECLARE_BIRTH_MY_JURISDICTION,
      SCOPES.RECORD_DECLARE_DEATH,
      SCOPES.RECORD_DECLARE_DEATH_MY_JURISDICTION,
      SCOPES.RECORD_DECLARE_MARRIAGE,
      SCOPES.RECORD_DECLARE_MARRIAGE_MY_JURISDICTION
    ] as Scope[]

    const allOtherScopes = scopes.filter(
      (scope) => !requiredScopes.includes(scope)
    )
    const tests = [
      [[requiredScopes[0]], true],
      [[requiredScopes[1]], true],
      [[requiredScopes[2]], true],
      [[requiredScopes[3]], true],
      [[requiredScopes[4]], true],
      [[requiredScopes[5]], true],
      [allOtherScopes, false]
    ]
    tests.forEach(([scopes, visible]) => {
      it(`should render when user has correct scopes ${scopes}`, async () => {
        setScopes(scopes as Scope[], store)
        const testComponent = await build()

        expect(testComponent.component.exists('#new_event_declaration')).toBe(
          visible
        )
      })
    })
  })
})

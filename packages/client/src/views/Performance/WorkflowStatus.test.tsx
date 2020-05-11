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
import { createTestComponent, createTestStore } from '@client/tests/util'
import { WorkflowStatus } from '@client/views/Performance/WorkflowStatus'
import { AppStore } from '@client/store'
import { History } from 'history'
import { ReactWrapper } from 'enzyme'
import queryString from 'query-string'
import { waitForElement } from '@client/tests/wait-for-element'

describe('Workflow status tests', () => {
  let store: AppStore
  let history: History<any>
  let component: ReactWrapper<{}, {}>
  const timeStart = new Date(2019, 11, 6)
  const timeEnd = new Date(2019, 11, 13)
  const locationId = '6e1f3bce-7bcb-4bf6-8e35-0d9facdf158b'

  beforeAll(async () => {
    const testStore = await createTestStore()
    store = testStore.store
    history = testStore.history
  })

  beforeEach(async () => {
    const testComponent = await createTestComponent(
      <WorkflowStatus
        // @ts-ignore
        location={{
          search: queryString.stringify({
            locationId,
            timeStart: timeStart.toISOString(),
            timeEnd: timeEnd.toISOString()
          })
        }}
      />,
      store
    )

    component = testComponent.component
  })

  it('renders without crashing', async () => {
    const header = await waitForElement(component, '#workflow-status-header')
  })

  it('clicking on back takes back to operational dashboard', async () => {
    const backButton = await waitForElement(
      component,
      '#workflow-status-action-back'
    )

    backButton.hostNodes().simulate('click')

    expect(history.location.pathname).toContain('/performance/operations')
    expect(history.location.pathname).not.toContain('workflowStatus')
  })
})

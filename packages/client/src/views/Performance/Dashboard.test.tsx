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

import { AppStore } from '@client/store'
import { createTestComponent, createTestStore } from '@client/tests/util'
import { waitForElement } from '@client/tests/wait-for-element'
import { Activity } from '@opencrvs/components/lib/icons'
import { ReactWrapper } from 'enzyme'
import React from 'react'
import { vi } from 'vitest'
import { DashboardEmbedView } from './Dashboard'

describe('Leaderboards component', () => {
  let component: ReactWrapper<{}, {}>
  let store: AppStore

  beforeAll(async () => {
    Date.now = vi.fn(() => 1667806908949)
    ;({ store } = await createTestStore())
  })
  beforeEach(async () => {
    const { component: testComponent } = await createTestComponent(
      <DashboardEmbedView title="Dashboard" icon={<Activity />} />,
      {
        store
      }
    )
    component = testComponent
  })
  it('renders no content component without crashing', async () => {
    await waitForElement(component, '#dashboard_noContent')
  })
})

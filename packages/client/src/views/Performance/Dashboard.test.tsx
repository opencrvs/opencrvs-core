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

import {
  createRouterProps,
  createTestComponent,
  createTestStore
} from '@client/tests/util'
import { ReactWrapper } from 'enzyme'
import { AppStore } from '@client/store'
import { vi } from 'vitest'
import React from 'react'
import { waitForElement } from '@client/tests/wait-for-element'
import { DashboardEmbedView } from './Dashboard'
import { Activity } from '@opencrvs/components/lib/icons'

describe('Leaderboards component', () => {
  let component: ReactWrapper<{}, {}>
  let store: AppStore

  beforeAll(async () => {
    Date.now = vi.fn(() => 1667806908949)
    ;({ store } = await createTestStore())
  })
  beforeEach(async () => {
    const { history } = createRouterProps('/performance/dashboard', {
      isNavigatedInsideApp: false
    })

    component = await createTestComponent(
      <DashboardEmbedView title="Dashboard" icon={<Activity />} />,
      {
        history,
        store
      }
    )
  })
  it('renders no content component without crashing', async () => {
    await waitForElement(component, '#dashboard_noContent')
  })
})

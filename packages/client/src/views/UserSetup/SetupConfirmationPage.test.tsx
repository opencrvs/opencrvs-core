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
import {
  createTestComponent,
  REGISTRAR_DEFAULT_SCOPES,
  setScopes
} from '@client/tests/util'
import { createStore } from '@client/store'

import { SetupConfirmationPage } from '@client/views/UserSetup/SetupConfirmationPage'

describe('Setup confirmation page tests', () => {
  const { store } = createStore()
  beforeAll(async () => {
    setScopes(REGISTRAR_DEFAULT_SCOPES, store)
  })
  it('renders page successfully', async () => {
    const { component: testComponent } = await createTestComponent(
      // @ts-ignore
      <SetupConfirmationPage />,
      { store }
    )
    const app = testComponent
    expect(app.find('#user-setup-complete-page').hostNodes()).toHaveLength(1)
  })
})

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
import { createTestComponent, validToken } from '@register/tests/util'
import { createStore } from '@register/store'
import { checkAuth } from '@register/profile/profileActions'
import { SetupConfirmationPage } from '@register/views/UserSetup/SetupConfirmationPage'

const getItem = window.localStorage.getItem as jest.Mock

describe('Setup confirmation page tests', () => {
  const { store } = createStore()
  beforeAll(() => {
    getItem.mockReturnValue(validToken)
    store.dispatch(checkAuth({ '?token': validToken }))
  })
  it('renders page successfully', async () => {
    const testComponent = await createTestComponent(
      // @ts-ignore
      <SetupConfirmationPage />,
      store
    )
    const app = testComponent.component
    expect(app.find('#user-setup-complete-page').hostNodes()).toHaveLength(1)
  })
})

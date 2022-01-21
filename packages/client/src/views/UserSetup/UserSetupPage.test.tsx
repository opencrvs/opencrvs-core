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
import {
  createTestComponent,
  flushPromises,
  validToken,
  mockUserResponse,
  userDetails
} from '@client/tests/util'
import { queries } from '@client/profile/queries'
import { merge } from 'lodash'

import { createStore, AppStore } from '@client/store'
import {
  checkAuth,
  getStorageUserDetailsSuccess
} from '@client/profile/profileActions'
import { UserSetupPage } from '@client/views/UserSetup/UserSetupPage'
import { ProtectedAccount } from '@client/components/ProtectedAccount'

const nameObj = {
  data: {
    getUser: {
      name: [
        {
          use: 'en',
          firstNames: 'Sahriar',
          familyName: 'Nafis'
        }
      ],
      role: 'FIELD_AGENT',
      status: 'pending',
      type: 'CHA',
      practitionerId: '43ac3486-7df1-4bd9-9b5e-728054ccd6ba'
    }
  }
}

merge(mockUserResponse, nameObj)
;(queries.fetchUserDetails as jest.Mock).mockReturnValue(mockUserResponse)

describe('UserSetupPage tests', () => {
  let store: AppStore
  beforeEach(() => {
    store = createStore().store
  })
  it('renders page successfully without type', async () => {
    await store.dispatch(
      getStorageUserDetailsSuccess(JSON.stringify(userDetails))
    )
    const testComponent = await createTestComponent(
      // @ts-ignore
      <UserSetupPage />,
      store
    )

    const app = testComponent.component
    expect(app.find('#user-setup-landing-page').hostNodes()).toHaveLength(1)
    expect(app.find('#user-setup-name-holder').hostNodes().text()).toEqual(
      'Shakib Al Hasan'
    )
  })
  it('go to password page', async () => {
    const testComponent = await createTestComponent(
      // @ts-ignore
      <ProtectedAccount />,
      store
    )
    const app = testComponent.component

    app.find('#user-setup-start-button').hostNodes().simulate('click')
    await flushPromises()
    expect(app.find('#NewPassword')).toBeDefined()
  })
  it('go to password page without userDetails', async () => {
    await store.dispatch(checkAuth({ '?token': validToken }))
    store.dispatch(getStorageUserDetailsSuccess('null'))
    const testComponent = await createTestComponent(
      // @ts-ignore
      <UserSetupPage goToStep={() => {}} />,
      store
    )
    const app = testComponent.component

    app.find('#user-setup-start-button').hostNodes().simulate('click')
    await flushPromises()
    expect(app.find('#NewPassword')).toBeDefined()
  })
})

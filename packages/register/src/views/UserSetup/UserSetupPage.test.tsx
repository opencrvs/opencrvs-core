import * as React from 'react'
import {
  createTestComponent,
  flushPromises,
  validToken,
  mockUserResponse,
  userDetails
} from '@register/tests/util'
import { queries } from '@register/profile/queries'
import { merge } from 'lodash'

import { createStore, AppStore } from '@register/store'
import {
  checkAuth,
  getStorageUserDetailsSuccess
} from '@register/profile/profileActions'
import { UserSetupPage } from '@register/views/UserSetup/UserSetupPage'
import { ProtectedAccount } from '@register/components/ProtectedAccount'

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
  it('renders page successfully', async () => {
    store.dispatch(checkAuth({ '?token': validToken }))
    const testComponent = await createTestComponent(
      // @ts-ignore
      <UserSetupPage />,
      store
    )
    const app = testComponent.component
    expect(app.find('#user-setup-landing-page').hostNodes()).toHaveLength(1)
    expect(
      app
        .find('#user-setup-name-holder')
        .hostNodes()
        .text()
    ).toEqual('Sahriar Nafis')
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
    expect(
      app
        .find('#user-setup-name-holder')
        .hostNodes()
        .text()
    ).toEqual('Shakib Al Hasan')
  })
  it('go to password page', async () => {
    const testComponent = await createTestComponent(
      // @ts-ignore
      <ProtectedAccount />,
      store
    )
    const app = testComponent.component

    app
      .find('#user-setup-start-button')
      .hostNodes()
      .simulate('click')
    await flushPromises()
    expect(app.find('#NewPassword')).toBeDefined()
  })
  it('go to password page without userDetails', async () => {
    store.dispatch(checkAuth({ '?token': validToken }))
    store.dispatch(getStorageUserDetailsSuccess('null'))
    const testComponent = await createTestComponent(
      // @ts-ignore
      <UserSetupPage goToStep={() => {}} />,
      store
    )
    const app = testComponent.component

    app
      .find('#user-setup-start-button')
      .hostNodes()
      .simulate('click')
    await flushPromises()
    expect(app.find('#NewPassword')).toBeDefined()
  })
})

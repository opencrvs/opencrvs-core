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

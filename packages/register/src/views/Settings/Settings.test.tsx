import * as React from 'react'
import { createTestComponent } from 'src/tests/util'
import { createStore } from 'src/store'
import { SettingsPage } from './SettingsPage'
import { userDetails } from 'src/tests/util'
import { getStorageUserDetailsSuccess } from '@opencrvs/register/src/profile/profileActions'
import { DataSection } from '@opencrvs/components/lib/interface'

const { store } = createStore()

describe('Settomgs page tests', async () => {
  beforeEach(async () => {
    store.dispatch(getStorageUserDetailsSuccess(JSON.stringify(userDetails)))
  })

  it('it checks componet has loaded', () => {
    const testComponent = createTestComponent(
      // @ts-ignore
      <SettingsPage />,
      store
    )

    // @ts-ignore
    expect(testComponent.component.containsMatchingElement(DataSection)).toBe(
      true
    )

    testComponent.component.unmount()
  })
})

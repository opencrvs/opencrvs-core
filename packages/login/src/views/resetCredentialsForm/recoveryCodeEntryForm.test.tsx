import * as React from 'react'
import { RecoveryCodeEntry } from './recoveryCodeEntryForm'
import { createTestApp, createTestComponent, wait } from '@login/tests/util'
import { createStore } from '@login/store'
import * as routes from '@login/navigation/routes'

describe('', () => {
  it('', async () => {
    const { history, app } = await createTestApp()

    history.replace(routes.PHONE_NUMBER_VERIFICATION, {
      forgottenItem: 'password'
    })

    expect(
      app
        .update()
        .find('#phone-number-verification')
        .hostNodes()
    ).toHaveLength(1)
  })
})

import * as React from 'react'
import { createTestComponent } from '../../tests/util'
import { SecureAccount } from './SecureAccountView'
import { createStore } from 'src/store'

describe('Login app > Secure Account Page', () => {
  it('Renders the secure account page successfully', () => {
    const { store } = createStore()
    const component = createTestComponent(<SecureAccount />, store)
    const elem = component.component.find('#createPinBtn').hostNodes()
    expect(elem).toHaveLength(1)
  })
})

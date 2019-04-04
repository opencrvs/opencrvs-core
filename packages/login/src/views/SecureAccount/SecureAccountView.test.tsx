import * as React from 'react'
import { ReactWrapper } from 'enzyme'
import { createTestComponent } from '../../tests/util'
import { SecureAccount } from './SecureAccountView'

describe('Login app > Secure Account Page', () => {
  let component: ReactWrapper

  beforeEach(() => {
    component = createTestComponent(<SecureAccount />)
  })

  it('Renders the secure account page successfully', () => {
    const elem = component.find('#createPinBtn').hostNodes()
    expect(elem).toHaveLength(1)
  })
})

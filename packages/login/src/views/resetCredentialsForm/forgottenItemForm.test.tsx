import { createTestComponent, wait } from '@login/tests/util'
import { ReactWrapper } from 'enzyme'
import * as React from 'react'
import { ForgottenItem } from './forgottenItemForm'

describe('Test forgotten item form', () => {
  let component: ReactWrapper
  beforeEach(() => {
    component = createTestComponent(<ForgottenItem />)
  })

  it('shows error when no option is chosen and pressed continue', async () => {
    component.find('form').simulate('submit')
    await wait()
    expect(component.find('#error-text').hostNodes()).toHaveLength(1)
  })

  it('redirect to phone number confirmation form for valid form submision', async () => {
    component
      .find('#usernameOption')
      .hostNodes()
      .simulate('change', { target: { value: 'username' } })
    await wait()
    component.find('form').simulate('submit')
    await wait()

    expect(window.location.href).toContain('/phone-number-verification')
  })
})

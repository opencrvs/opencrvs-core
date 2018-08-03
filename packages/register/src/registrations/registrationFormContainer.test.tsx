import { RegistrationFormContainer } from './RegistrationFormContainer'
import * as React from 'react'
import { createTestComponent } from '../tests/util'
import { ReactWrapper } from 'enzyme'

interface ITestProps {
  test: string
}
describe('RegistrationFormContainer test', () => {
  let component: ReactWrapper
  let props: ITestProps
  beforeEach(() => {
    props = {
      test: ''
    }
    component = createTestComponent(<RegistrationFormContainer {...props} />)
  })
  it('Renders successfully', () => {
    expect(component.find('form#REGISTRATION_FORM')).toHaveLength(1)
  })
})

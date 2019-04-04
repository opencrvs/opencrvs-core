import * as React from 'react'
import { ReactWrapper } from 'enzyme'
import { createTestComponent } from '../tests/util'
import { SecurePageContainer } from './SecurePageContainer'

describe('Login app > Secure Account Page', () => {
  let component: ReactWrapper

  beforeEach(() => {
    component = createTestComponent(
      <SecurePageContainer>
        <span id="ChildElem" />
      </SecurePageContainer>
    )
  })

  it('Renders the secure account page successfully', () => {
    const elem = component.find('#ChildElem').hostNodes()
    expect(elem).toHaveLength(1)
  })
})

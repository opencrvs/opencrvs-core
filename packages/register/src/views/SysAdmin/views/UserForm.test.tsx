import * as React from 'react'
import { createTestComponent } from 'src/tests/util'
import { createStore } from 'src/store'
import { UserForm } from './UserForm'
import { ActionPageLight } from '@opencrvs/components/lib/interface'
import { ReactWrapper } from 'enzyme'

const { store } = createStore()

describe('Settings page tests', async () => {
  let component: ReactWrapper
  beforeEach(async () => {
    const testComponent = createTestComponent(
      // @ts-ignore
      <UserForm />,
      store
    )
    component = testComponent.component
  })

  it('it checks component has loaded', () => {
    // @ts-ignore
    expect(component.containsMatchingElement(ActionPageLight)).toBe(true)
    component.find('input#firstNameEn').simulate('change', {
      target: { id: 'firstNameEn', value: 'test' }
    })

    component.unmount()
  })
})

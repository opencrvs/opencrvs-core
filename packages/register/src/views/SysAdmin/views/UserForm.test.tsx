import * as React from 'react'
import { createTestComponent } from '@register/tests/util'
import { createStore } from '@register/store'
import { UserForm } from '@register/views/SysAdmin/views/UserForm'
import { ActionPageLight } from '@opencrvs/components/lib/interface'
import { ReactWrapper } from 'enzyme'
import { userSection } from '@register/views/SysAdmin/forms/fieldDefinitions/user-section'

const { store } = createStore()

describe('Create new user page tests', () => {
  let component: ReactWrapper
  beforeEach(() => {
    const testComponent = createTestComponent(
      // @ts-ignore
      <UserForm section={userSection} />,
      store
    )
    component = testComponent.component
  })

  it('it checks component has loaded', () => {
    // @ts-ignore
    expect(component.containsMatchingElement(ActionPageLight)).toBe(true)
    component.find('input#firstNamesEng').simulate('change', {
      target: { id: 'firstNamesEng', value: 'test' }
    })

    component.unmount()
  })
})

import * as React from 'react'
import { createTestComponent, userDetails } from '@register/tests/util'
import { createStore } from '@register/store'
import { SettingsPage } from '@register/views/Settings/SettingsPage'
import { getStorageUserDetailsSuccess } from '@opencrvs/register/src/profile/profileActions'
import { DataSection } from '@opencrvs/components/lib/interface'
import { ReactWrapper } from 'enzyme'

const { store } = createStore()

describe('Settings page tests', () => {
  let component: ReactWrapper
  beforeEach(async () => {
    store.dispatch(getStorageUserDetailsSuccess(JSON.stringify(userDetails)))
    const testComponent = createTestComponent(
      // @ts-ignore
      <SettingsPage />,
      store
    )
    component = testComponent.component
  })

  it('it checks component has loaded', () => {
    // @ts-ignore
    expect(component.containsMatchingElement(DataSection)).toBe(true)

    component.unmount()
  })
  it('it checks modal is open when button clicked', () => {
    component
      .find('#BtnChangeLanguage')
      .hostNodes()
      .simulate('click')

    expect(component.find('#ChangeLanguageModal').hostNodes()).toHaveLength(1)

    component.unmount()
  })
  it('it checks cancel button clicked', () => {
    component
      .find('#BtnChangeLanguage')
      .hostNodes()
      .simulate('click')

    const modal = component.find('#ChangeLanguageModal').hostNodes()

    modal
      .find('#modal_cancel')
      .hostNodes()
      .simulate('click')

    component.unmount()
  })
  it('it checks cancel button clicked', () => {
    component
      .find('#BtnChangeLanguage')
      .hostNodes()
      .simulate('click')

    const modal = component.find('#ChangeLanguageModal').hostNodes()

    modal
      .find('#apply_change')
      .hostNodes()
      .simulate('click')

    component.unmount()
  })
})

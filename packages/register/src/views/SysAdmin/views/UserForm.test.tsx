import * as React from 'react'
import { createTestComponent, mockOfflineData } from '@register/tests/util'
import { createStore } from '@register/store'
import { UserForm } from '@register/views/SysAdmin/views/UserForm'
import { ActionPageLight } from '@opencrvs/components/lib/interface'
import { ReactWrapper } from 'enzyme'
import { userSection } from '@register/views/SysAdmin/forms/fieldDefinitions/user-section'

import { deserializeFormSection } from '@register/forms/mappings/deserializer'
import { offlineDataReady } from '@register/offline/actions'

const { store } = createStore()

describe('Create new user page tests', () => {
  let component: ReactWrapper
  beforeEach(async () => {
    await store.dispatch(
      offlineDataReady({
        languages: mockOfflineData.languages,
        forms: mockOfflineData.forms,
        templates: mockOfflineData.templates,
        locations: mockOfflineData.locations,
        facilities: mockOfflineData.facilities,
        assets: mockOfflineData.assets
      })
    )
    const testComponent = await createTestComponent(
      // @ts-ignore
      <UserForm
        section={deserializeFormSection(userSection)}
        activeGroup={deserializeFormSection(userSection).groups[0]}
        nextGroupId="preview-user-view-group"
        nextSectionId="preview"
      />,
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
  })

  it('it checks office search modal appears', () => {
    component
      .find('#searchInputText')
      .hostNodes()
      .simulate('change', {
        target: { id: 'searchInputText', value: 'Barisal' }
      })
    component.update()

    component
      .find('#searchInputIcon')
      .hostNodes()
      .simulate('click')

    component.update()

    expect(component.find('#office-search-modal').hostNodes().length).toBe(1)
  })

  it('it changes location selection', () => {
    component
      .find('#searchInputText')
      .hostNodes()
      .simulate('change', {
        target: { id: 'searchInputText', value: 'Barisal' }
      })
    component.update()

    component
      .find('#searchInputIcon')
      .hostNodes()
      .simulate('click')

    component.update()

    component
      .find('#location-0')
      .hostNodes()
      .simulate('change', {
        target: { id: 'location-0', value: 'checked' }
      })
    component.update()

    component
      .find('#modal_select')
      .hostNodes()
      .simulate('click')

    component.update()

    expect(
      component
        .find('#registrationOffice-id')
        .hostNodes()
        .props().value
    ).toEqual('Barisal')
  })

  it('it closes office search modal while modal cancel clicked', () => {
    component
      .find('#searchInputText')
      .hostNodes()
      .simulate('change', {
        target: { id: 'searchInputText', value: 'Barisal' }
      })
    component.update()

    component
      .find('#searchInputIcon')
      .hostNodes()
      .simulate('click')

    component.update()

    component
      .find('#modal_cancel')
      .hostNodes()
      .simulate('click')

    component.update()

    expect(component.find('#office-search-modal').hostNodes().length).toBe(0)
  })

  it('it sets value to registerOffice  while modal select clicked', () => {
    component
      .find('#searchInputText')
      .hostNodes()
      .simulate('change', {
        target: { id: 'searchInputText', value: 'Barisal' }
      })
    component.update()

    component
      .find('#searchInputIcon')
      .hostNodes()
      .simulate('click')

    component.update()

    component
      .find('#modal_select')
      .hostNodes()
      .simulate('click')

    component.update()

    expect(component.find('#registrationOffice-id').hostNodes().length).toBe(1)
  })

  it('it opens modal  while edit registration office link clicked', () => {
    component
      .find('#searchInputText')
      .hostNodes()
      .simulate('change', {
        target: { id: 'searchInputText', value: 'Barisal' }
      })
    component.update()

    component
      .find('#searchInputIcon')
      .hostNodes()
      .simulate('click')

    component.update()

    component
      .find('#modal_select')
      .hostNodes()
      .simulate('click')

    component.update()

    component
      .find('#edit-button')
      .hostNodes()
      .simulate('click')

    component.update()

    expect(component.find('#office-search-modal').hostNodes().length).toBe(1)
  })
})

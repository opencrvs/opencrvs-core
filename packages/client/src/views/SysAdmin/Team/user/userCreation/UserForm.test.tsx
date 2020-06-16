/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import { deserializeFormSection } from '@client/forms/mappings/deserializer'
import { offlineDataReady } from '@client/offline/actions'
import { createStore } from '@client/store'
import { createTestComponent, mockOfflineData } from '@client/tests/util'
import { UserForm } from '@client/views/SysAdmin/Team/user/userCreation/UserForm'
import { ActionPageLight } from '@opencrvs/components/lib/interface'
import { ReactWrapper } from 'enzyme'
import * as React from 'react'

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
        offices: mockOfflineData.offices,
        assets: mockOfflineData.assets
      })
    )
    const testComponent = await createTestComponent(
      // @ts-ignore
      <UserForm
        section={deserializeFormSection(
          mockOfflineData.forms.userForm.sections[0]
        )}
        activeGroup={
          deserializeFormSection(mockOfflineData.forms.userForm.sections[0])
            .groups[0]
        }
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
        target: { id: 'searchInputText', value: 'Moktarpur' }
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
        .find('#registrationOffice')
        .hostNodes()
        .props().value
    ).toEqual('Moktarpur Union Parishad')
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

  it('it sets value to registerOffice while modal select clicked', () => {
    component
      .find('#searchInputText')
      .hostNodes()
      .simulate('change', {
        target: { id: 'searchInputText', value: 'Moktarpur' }
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

    expect(component.find('#registrationOffice').hostNodes().length).toBe(1)
  })

  it('it opens modal  while edit registration office link clicked', () => {
    component
      .find('#searchInputText')
      .hostNodes()
      .simulate('change', {
        target: { id: 'searchInputText', value: 'Moktarpur' }
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

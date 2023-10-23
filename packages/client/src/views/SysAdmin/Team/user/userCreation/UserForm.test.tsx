/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import { deserializeFormSection } from '@client/forms/deserializer/deserializer'
import { offlineDataReady } from '@client/offline/actions'
import { createStore } from '@client/store'
import {
  createTestComponent,
  mockOfflineData,
  mockOfflineDataDispatch
} from '@client/tests/util'
import { UserForm } from '@client/views/SysAdmin/Team/user/userCreation/UserForm'
import { ActionPageLight } from '@opencrvs/components/lib/ActionPageLight'
import { ReactWrapper } from 'enzyme'
import * as React from 'react'
import { waitForElement } from '@client/tests/wait-for-element'
import * as builtInValidators from '@client/utils/validate'

const { store, history } = createStore()

describe('Create new user page tests', () => {
  let component: ReactWrapper
  beforeEach(async () => {
    await store.dispatch(offlineDataReady(mockOfflineDataDispatch))
    const testComponent = await createTestComponent(
      // @ts-ignore
      <UserForm
        section={deserializeFormSection(
          mockOfflineData.userForms.sections[0],
          // Needs to be casted as any as there are non-validator functions in the import
          builtInValidators as Record<string, any>
        )}
        activeGroup={
          deserializeFormSection(
            mockOfflineData.userForms.sections[0],
            // Needs to be casted as any as there are non-validator functions in the import
            builtInValidators as Record<string, any>
          ).groups[0]
        }
        nextGroupId="preview-user-view-group"
        nextSectionId="preview"
      />,
      { store, history }
    )
    component = testComponent
  })

  it('it checks component has loaded', () => {
    // @ts-ignore
    expect(component.containsMatchingElement(ActionPageLight)).toBe(true)
  })

  it('renders location search input without crashing', async () => {
    const input = await waitForElement(component, '#registrationOffice')
    expect(input.length).toBeGreaterThan(0)
  })

  it('performs auto complete search among offline data', () => {
    const locationInput = component.find(`input#registrationOffice`).hostNodes()

    locationInput.simulate('change', {
      target: { id: `input#registrationOffice`, value: 'moktarpur' }
    })
    locationInput.simulate('focus')

    const autoCompleteSuggestion = component
      .find('#locationOption0d8474da-0361-4d32-979e-af91f012340a')
      .hostNodes()
    expect(autoCompleteSuggestion).toHaveLength(1)
  })

  it('clicking on autocomplete suggestion modifies draft', () => {
    expect(store.getState().userForm.userFormData).toEqual({})
    const locationInput = component.find(`input#registrationOffice`).hostNodes()

    locationInput.simulate('change', {
      target: { id: `input#registrationOffice`, value: 'moktarpur' }
    })
    locationInput.simulate('focus')

    const autoCompleteSuggestion = component
      .find('#locationOption0d8474da-0361-4d32-979e-af91f012340a')
      .hostNodes()
    expect(autoCompleteSuggestion).toHaveLength(1)

    autoCompleteSuggestion.simulate('click')
    expect(store.getState().userForm.userFormData).toEqual({
      registrationOffice: '0d8474da-0361-4d32-979e-af91f012340a'
    })
  })
})

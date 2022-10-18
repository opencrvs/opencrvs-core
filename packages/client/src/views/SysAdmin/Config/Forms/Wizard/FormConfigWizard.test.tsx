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
import React from 'react'
import { ReactWrapper } from 'enzyme'
import { createStore } from '@client/store'
import {
  createTestComponent,
  getItem,
  natlSysAdminToken
} from '@client/tests/util'
import { FormConfigWizard } from './FormConfigWizard'
import { checkAuth } from '@client/profile/profileActions'
import { FieldEnabled } from '@client/forms/configuration'

let component: ReactWrapper<{}, {}>
describe('FormConfigWizard', () => {
  beforeEach(async () => {
    const { store, history } = createStore()
    getItem.mockReturnValue(natlSysAdminToken)
    store.dispatch(checkAuth())
    component = await createTestComponent(<FormConfigWizard />, {
      store,
      history
    })
  })
  it('should load properly', () => {
    expect(component.exists('FormConfigWizard')).toBeTruthy()
  })
  describe('for default non customisable fields', () => {
    it('it should not show toggle buttons', () => {
      component
        .find(
          'FormConfigElementCard[id="birth.child.child-view-group.firstNamesEng"]'
        )
        .childAt(0)
        .simulate('click')
      component.update()

      expect(component.exists('Toggle')).toBeFalsy()
    })
  })
  describe('for default customisable fields', () => {
    it('should toggle the hidden property', () => {
      component
        .find(
          'FormConfigElementCard[id="birth.child.child-view-group.attendantAtBirth"]'
        )
        .childAt(0)
        .simulate('click')
      component.update()
      component
        .find('[id="birth.child.child-view-group.attendantAtBirth_hide"]')
        .hostNodes()
        .first()
        .simulate('change')
      component.update()

      expect(component.find('HideToggleAction').first().prop('enabled')).toBe(
        FieldEnabled.DISABLED
      )
    })
  })
  describe('for custom fields', () => {
    beforeEach(() => {
      component.find('#add-TEXT-btn').hostNodes().first().simulate('click')
      component.update()
    })

    it('should add a custom field and select that field', () => {
      expect(
        component.exists('[id="birth.child.child-view-group.customField1"]')
      ).toBeTruthy()
    })

    it('should move the field up and down', () => {
      component
        .find('[id="birth.child.child-view-group.customField1_up"]')
        .hostNodes()
        .simulate('click')
      component.update()

      expect(
        component.find('FormConfigElementCard').last().prop('id')
      ).not.toBe('birth.child.child-view-group.customField1')

      component
        .find('[id="birth.child.child-view-group.customField1_down"]')
        .hostNodes()
        .simulate('click')
      component.update()

      expect(component.find('FormConfigElementCard').last().prop('id')).toBe(
        'birth.child.child-view-group.customField1'
      )
    })

    it('should show conditional fieldids and regex input when click toggle button', async () => {
      component
        .find('#conditional-toggle-button')
        .hostNodes()
        .first()
        .simulate('change', { target: { checked: true } })
      component.update()
      expect(
        component.find('#conditional-toggle-button').hostNodes().first().props()
          .defaultChecked
      ).toBeTruthy()
      expect(component.find('#selectConditionalField').hostNodes().length).toBe(
        1
      )
      expect(
        component.find('#conditional-regex-input').find('input').hostNodes()
          .length
      ).toBe(1)
    })

    it('should disable the save button if conditional regex input is empty', async () => {
      component
        .find('#conditional-toggle-button')
        .hostNodes()
        .first()
        .simulate('change', { target: { checked: true } })
      component.update()
      expect(
        component.find('#custom-tool-save-button').hostNodes().prop('disabled')
      ).toEqual(true)
    })

    it('should remove the field', () => {
      component
        .find('[id="birth.child.child-view-group.customField1_remove"]')
        .hostNodes()
        .simulate('click')
      component.update()

      expect(
        component.find('FormConfigElementCard').last().prop('id')
      ).not.toBe('birth.child.child-view-group.customField1')
    })
  })
})

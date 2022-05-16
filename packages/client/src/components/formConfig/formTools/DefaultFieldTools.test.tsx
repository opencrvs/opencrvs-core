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
import { createStore, AppStore } from '@client/store'
import { createTestComponent } from '@client/tests/util'
import { History } from 'history'
import { DefaultFieldTools } from './DefaultFieldTools'
import { IDefaultConfigField } from '@client/forms/configuration/formConfig/utils'
import { FieldPosition } from '@client/forms/configuration'

let component: ReactWrapper<{}, {}>

const customisableField: IDefaultConfigField = {
  fieldId: 'birth.child.child-view-group.attendantAtBirth',
  enabled: '',
  identifiers: {
    sectionIndex: 1,
    groupIndex: 0,
    fieldIndex: 5
  },
  preceedingFieldId: 'birth.child.child-view-group.gender',
  foregoingFieldId: 'birth.child.child-view-group.birthType'
}

const nonCustomisableField: IDefaultConfigField = {
  fieldId: 'birth.child.child-view-group.childBirthDate',
  enabled: '',
  identifiers: {
    sectionIndex: 1,
    groupIndex: 0,
    fieldIndex: 0
  },
  preceedingFieldId: FieldPosition.TOP,
  foregoingFieldId: 'birth.child.child-view-group.firstNamesEng'
}

describe('DefaultFieldTools', () => {
  let store: AppStore
  let history: History
  describe('for non customisable field', () => {
    beforeEach(async () => {
      ;({ store, history } = createStore())
      component = await createTestComponent(
        <DefaultFieldTools configField={nonCustomisableField} />,
        {
          store,
          history
        }
      )
    })

    it('should not show toggle buttons', () => {
      expect(component.exists('Toggle')).toBeFalsy()
    })
  })

  describe('for customisable field', () => {
    beforeEach(async () => {
      ;({ store, history } = createStore())
      component = await createTestComponent(
        <DefaultFieldTools configField={customisableField} />,
        {
          store,
          history
        }
      )
    })

    it('should show toggle buttons', () => {
      expect(component.exists('Toggle')).toBeTruthy()
    })
  })
})

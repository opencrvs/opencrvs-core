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

import * as React from 'react'
import { createStore } from '@client/store'
import {
  createTestComponent,
  createRouterProps,
  natlAdminUserDetails
} from '@client/tests/util'
import { ReactWrapper } from 'enzyme'
import { FormConfigWizard } from './FormConfigWizard'
import { formatUrl } from '@client/navigation'
import { FORM_CONFIG_WIZARD } from '@client/navigation/routes'
import { getStorageUserDetailsSuccess } from '@client/profile/profileActions'

describe('Form Config Wizard page successfully rendered', () => {
  let component: ReactWrapper<{}, {}>

  beforeEach(async () => {
    const { store, history } = createStore()
    store.dispatch(
      getStorageUserDetailsSuccess(JSON.stringify(natlAdminUserDetails))
    )
    component = await createTestComponent(
      <FormConfigWizard
        {...createRouterProps(
          formatUrl(FORM_CONFIG_WIZARD, {
            event: 'birth',
            section: 'introduction'
          }),
          { isNavigatedInsideApp: false },
          {
            matchParams: {
              event: 'birth',
              section: 'introduction'
            }
          }
        )}
      />,
      { store, history }
    )
  })

  it('Form Config Wizard page loads properly for national system admin', async () => {
    expect(component.exists('FormConfigWizardComp')).toBeTruthy()
    expect(component.exists('PageNavigation')).toBeTruthy()
    expect(component.exists('FormConfigCanvas')).toBeTruthy()
    expect(component.exists('FormTools')).toBeTruthy()
  })
})

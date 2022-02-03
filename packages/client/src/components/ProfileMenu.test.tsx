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
import { ReactWrapper } from 'enzyme'
import { createStore } from '@client/store'
import { createTestComponent, userDetails } from '@client/tests/util'
import { ProfileMenu } from '@client/components/ProfileMenu'

import { getStorageUserDetailsSuccess } from '@opencrvs/client/src/profile/profileActions'

const { store } = createStore()

describe('when user opens profile menu without user details', () => {
  let component: ReactWrapper<{}, {}>
  beforeEach(async () => {
    const testComponent = await createTestComponent(<ProfileMenu />, store)
    component = testComponent.component
  })

  it('open menu', () => {
    component.find('#ProfileMenuToggleButton').hostNodes().simulate('click')

    expect(component.find('#ProfileMenuSubMenu').hostNodes()).toHaveLength(1)
  })
})

describe('when user opens profile menu with user details', () => {
  let component: ReactWrapper<{}, {}>
  beforeEach(async () => {
    const details = userDetails
    details.name = [
      {
        use: 'bn',
        firstNames: 'সাকিব',
        familyName: 'হাসান'
      }
    ]
    store.dispatch(getStorageUserDetailsSuccess(JSON.stringify(details)))
    const testComponent = await createTestComponent(<ProfileMenu />, store)
    component = testComponent.component
  })

  it('open menu', () => {
    component.find('#ProfileMenuToggleButton').hostNodes().simulate('click')

    expect(component.find('#ProfileMenuSubMenu').hostNodes()).toHaveLength(1)
  })

  it('handle clicks', () => {
    component.find('#ProfileMenuToggleButton').hostNodes().simulate('click')

    // Settings click
    component
      .find('#ProfileMenuSubMenu')
      .hostNodes()
      .childAt(1)
      .simulate('click')

    component
      .find('#ProfileMenuSubMenu')
      .hostNodes()
      .childAt(2)
      .simulate('click')

    expect(component.find('#ProfileMenuSubMenu').hostNodes()).toHaveLength(1)
  })
})

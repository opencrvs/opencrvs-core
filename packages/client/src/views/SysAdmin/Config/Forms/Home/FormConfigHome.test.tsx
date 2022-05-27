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
import { createTestComponent } from '@client/tests/util'
import { FormConfigHome } from './FormConfigHome'
import { DraftStatus } from '@client/utils/gateway'

let component: ReactWrapper<{}, {}>

describe('FormConfigHome', () => {
  beforeEach(async () => {
    const { store, history } = createStore()
    component = await createTestComponent(<FormConfigHome />, {
      store,
      history
    })
  })

  it('should load properly', () => {
    expect(component.exists('FormConfigHome')).toBeTruthy()
  })

  it('should switch tabs properly', () => {
    const selectedTab = () =>
      component.find('FormTabsComponent').prop('activeTabId')

    const selectTab = (tab: string) =>
      component.find(`#tab_${tab}`).hostNodes().simulate('click')

    expect(selectedTab()).toBe(DraftStatus.Draft)

    selectTab(DraftStatus.InPreview)
    expect(selectedTab()).toBe(DraftStatus.InPreview)

    selectTab(DraftStatus.Published)
    expect(selectedTab()).toBe(DraftStatus.Published)
  })
})

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
import routeData from 'react-router'
import { Event, BirthSection } from '@client/forms'
import { checkAuth } from '@client/profile/profileActions'

let component: ReactWrapper<{}, {}>

describe('FormConfigWizard', () => {
  beforeEach(async () => {
    jest
      .spyOn(routeData, 'useParams')
      .mockReturnValue({ event: Event.BIRTH, section: BirthSection.Child })

    const { store, history } = createStore()
    getItem.mockReturnValue(natlSysAdminToken)
    await store.dispatch(checkAuth({ '?token': natlSysAdminToken }))
    component = await createTestComponent(<FormConfigWizard />, {
      store,
      history
    })
  })

  it('should load properly', () => {
    expect(component.exists('FormConfigWizard')).toBeTruthy()
  })
})

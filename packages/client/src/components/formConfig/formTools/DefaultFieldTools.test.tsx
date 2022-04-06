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

import { createStore } from '@client/store'
import { ReactWrapper } from 'enzyme'
import { createTestComponent } from '@client/tests/util'
import { DefaultFieldTools } from './DefaultFieldTools'
import React from 'react'

describe('DefaultFieldTools', () => {
  let component: ReactWrapper<{}, {}>
  beforeEach(async () => {
    const { store, history } = createStore()
    component = await createTestComponent(<DefaultFieldTools />, {
      store,
      history
    })
  })
  it('should render correctly', () => {
    expect(component.exists()).toBeTruthy()
  })
})

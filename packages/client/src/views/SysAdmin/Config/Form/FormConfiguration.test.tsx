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
import { createTestComponent, createRouterProps } from '@client/tests/util'
import { ReactWrapper } from 'enzyme'
import { FormConfiguration } from '@client/views/SysAdmin/Config/Form/FormConfiguration'
import { FORM_CONFIG } from '@client/navigation/routes'

const { store, history } = createStore()
let testComponent: ReactWrapper
beforeEach(async () => {
  testComponent = await createTestComponent(<FormConfiguration />, {
    store,
    history
  })
})

describe('form config page test', () => {
  it('should load the page', () => {
    expect(testComponent.exists('FormConfigComponent')).toBeTruthy()
  })
})

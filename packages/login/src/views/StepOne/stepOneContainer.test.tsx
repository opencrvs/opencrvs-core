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
import * as moxios from 'moxios'
import { ReactWrapper } from 'enzyme'
import { StepOneContainer } from '@login/views/StepOne/StepOneContainer'
import { createTestComponent, createTestApp } from '@login/tests/util'
import { client } from '@login/utils/authApi'
import { applicationConfigLoadedAction } from '@login/login/actions'

describe('Login app step one', () => {
  beforeEach(() => {
    moxios.install(client)
  })
  afterEach(() => {
    moxios.uninstall(client)
  })
  describe('Step One Container', () => {
    let component: ReactWrapper

    beforeEach(() => {
      component = createTestComponent(<StepOneContainer />)
    })
    it('renders successfully', () => {
      expect(component.find('form#STEP_ONE')).toHaveLength(1)
    })
  })

  describe('Step One Form', () => {
    let component: ReactWrapper

    beforeEach(async () => {
      const testApp = await createTestApp()
      component = testApp.app
      testApp.store.dispatch(
        applicationConfigLoadedAction({
          config: {
            APPLICATION_NAME: 'Dummy App',
            COUNTRY: 'dum',
            COUNTRY_LOGO: {
              fileName: 'dummy-file-name',
              file: 'dummy-logo'
            },
            SENTRY: '',
            LOGROCKET: ''
          }
        })
      )
      component.update()
    })
    it('loads country logo properly', () => {
      expect(component.find('img').prop('src')).toBe('dummy-logo')
    })
  })
})

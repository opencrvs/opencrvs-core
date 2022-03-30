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
import { StepTwoContainer } from '@login/views/StepTwo/StepTwoContainer'
import { createTestComponent, wait, mockState } from '@login/tests/util'
import { client } from '@login/utils/authApi'
import { createStore } from '@login/store'
import { authenticate, completeAuthentication } from '@login/login/actions'

describe('Login app step two', () => {
  const { store, history } = createStore()
  beforeEach(() => {
    moxios.install(client)

    window.config.PHONE_NUMBER_PATTERN = /^0(1)[0-9]{1}[0-9]{8}$/
  })
  afterEach(() => {
    moxios.uninstall(client)
  })
  describe('Step Two Container test', () => {
    let component: ReactWrapper

    beforeEach(async () => {
      store.dispatch(
        authenticate({ username: 'kennedy.mweene', password: 'test' })
      )
      store.dispatch(
        completeAuthentication({
          nonce: 'drhdryhdyh',
          token: 'test',
          mobile: '+260933333333'
        })
      )
      component = createTestComponent(<StepTwoContainer />, { store, history })
      await wait()
      component.find('input#code').simulate('change', { target: { value: '' } })
    })
    it('Renders successfully', () => {
      expect(component.find('form#STEP_TWO')).toHaveLength(1)
      component.unmount()
    })
    it('Completes SMS code and sends data to correct endpoint', async () => {
      component
        .find('input#code')
        .simulate('change', { target: { value: '123456' } })
      component.find('form#STEP_TWO').simulate('submit')

      await wait()
      const request = moxios.requests.mostRecent()
      expect(request.url).toMatch(/verifyCode/)
      component.unmount()
    })
    it('Requests another SMS code to be sent', async () => {
      component.find('#login-mobile-resend').hostNodes().simulate('click')
      await wait()
      const request = moxios.requests.mostRecent()
      expect(request.url).toMatch(/resendSms/)
      component.unmount()
    })
  })
})

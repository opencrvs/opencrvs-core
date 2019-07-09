import * as React from 'react'
import * as moxios from 'moxios'
import { ReactWrapper } from 'enzyme'
import { StepTwoContainer } from '@login/views/StepTwo/StepTwoContainer'
import { createTestComponent, wait } from '@login/tests/util'
import { client } from '@login/utils/authApi'

describe('Login app step two', () => {
  beforeEach(() => {
    moxios.install(client)
  })
  afterEach(() => {
    moxios.uninstall(client)
  })
  describe('Step Two Container test', () => {
    let component: ReactWrapper

    beforeEach(() => {
      component = createTestComponent(<StepTwoContainer />)
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
      component
        .find('#login-mobile-resend')
        .hostNodes()
        .simulate('click')
      await wait()
      const request = moxios.requests.mostRecent()
      expect(request.url).toMatch(/resendSms/)
      component.unmount()
    })
  })
})

import * as React from 'react'
import * as moxios from 'moxios'
import { ReactWrapper } from 'enzyme'
import { getFieldToFocus, StepTwoContainer } from './StepTwoContainer'
import { createTestComponent, wait, mockState } from '../../tests/util'
import { client } from '../../utils/authApi'

interface ITestProps {
  test: string
}
describe('Login app step two', () => {
  beforeEach(() => {
    moxios.install(client)
  })
  afterEach(() => {
    moxios.uninstall(client)
  })
  describe('Step Two Container test', () => {
    let component: ReactWrapper
    let props: ITestProps
    beforeEach(() => {
      props = {
        test: ''
      }
      component = createTestComponent(<StepTwoContainer {...props} />)
      component
        .find('input#code1')
        .simulate('change', { target: { value: '' } })
      component
        .find('input#code2')
        .simulate('change', { target: { value: '' } })
      component
        .find('input#code3')
        .simulate('change', { target: { value: '' } })
      component
        .find('input#code4')
        .simulate('change', { target: { value: '' } })
      component
        .find('input#code5')
        .simulate('change', { target: { value: '' } })
      component
        .find('input#code6')
        .simulate('change', { target: { value: '' } })
    })
    it('Renders successfully', () => {
      expect(component.find('form#STEP_TWO')).toHaveLength(1)
    })
    it('Completes SMS code and sends data to correct endpoint', async () => {
      component
        .find('input#code1')
        .simulate('change', { target: { value: '1' } })
      component
        .find('input#code2')
        .simulate('change', { target: { value: '2' } })
      component
        .find('input#code3')
        .simulate('change', { target: { value: '3' } })
      component
        .find('input#code4')
        .simulate('change', { target: { value: '4' } })
      component
        .find('input#code5')
        .simulate('change', { target: { value: '5' } })
      component
        .find('input#code6')
        .simulate('change', { target: { value: '6' } })
      component.find('form#STEP_TWO').simulate('submit')
      await wait()
      const request = moxios.requests.mostRecent()
      expect(request.url).toMatch(/verifyCode/)
    })
    it('Requests another SMS code to be sent', async () => {
      component
        .find('#login-mobile-resend')
        .hostNodes()
        .simulate('click')
      await wait()
      const request = moxios.requests.mostRecent()
      expect(request.url).toMatch(/resendSms/)
    })
    it('Displays the reset form link when a field is entered', async () => {
      component
        .find('input#code1')
        .simulate('change', { target: { value: '1' } })
      await wait()
      component.update()
      expect(component.find('#login-clear-form').hostNodes()).toHaveLength(1)
    })
    it('should return the field to focus', () => {
      const nextField = 'code2'
      expect(getFieldToFocus(mockState)).toEqual(nextField)
    })
  })
})

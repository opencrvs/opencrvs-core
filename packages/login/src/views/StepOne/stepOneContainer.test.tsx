import * as React from 'react'
import * as moxios from 'moxios'
import { ReactWrapper } from 'enzyme'
import { StepOneContainer } from './StepOneContainer'
import { createTestComponent } from '../../tests/util'
import { client } from '../../utils/authApi'

import * as actions from '../../i18n/actions'
import { store } from '../../App'

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

    it('changes the language from english to bengali', async () => {
      const action = {
        type: actions.CHANGE_LANGUAGE,
        payload: { language: 'bn' }
      }
      store.dispatch(action)

      expect(component.find('p').text()).toEqual(
        'অনুগ্রহপূর্বক আপনার মোবাইল নম্বর  এবং পাসওয়ার্ড টাইপ করুন'
      )
    })
  })
})

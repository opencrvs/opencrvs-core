import { StepOneContainer } from './StepOneContainer'
import * as React from 'react'
import { createConnectedTestComponent } from '../../tests/util'
import * as moxios from 'moxios'
import { client } from '../../utils/authApi'
import { ReactWrapper } from 'enzyme'
import { createStore, AppStore } from '../../store'
import * as actions from '../../i18n/actions'

describe('Login app step one', () => {
  let store: AppStore
  beforeEach(() => {
    moxios.install(client)
  })
  afterEach(() => {
    moxios.uninstall(client)
  })
  describe('Step One Container', () => {
    let component: ReactWrapper

    beforeEach(() => {
      store = createStore()
      const props = {
        test: ''
      }
      component = createConnectedTestComponent(
        <StepOneContainer {...props} />,
        store
      )
    })
    it('renders successfully', () => {
      expect(component.find('form#STEP_ONE')).toHaveLength(1)
    })

    it('changes the language from english to bengali', async () => {
      const action = {
        type: actions.CHANGE_LANGUAGE,
        payload: { LANGUAGE: 'bn' }
      }
      store.dispatch(action)

      expect(component.find('p').text()).toEqual(
        'দয়া করে আপনার মোবাইল নম্বর এবং পাসওয়ার্ড লিখুন'
      )
    })
  })
})

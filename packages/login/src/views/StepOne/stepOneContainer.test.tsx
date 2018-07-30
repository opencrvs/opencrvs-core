import { StepOneContainer } from './StepOneContainer'
import * as React from 'react'
import { createConnectedTestComponent, wait } from '../../tests/util'
import * as moxios from 'moxios'
import { client } from '../../utils/authApi'
import { ReactWrapper } from 'enzyme'
import { createStore, AppStore } from '../../store'
import * as actions from '../../i18n/actions'

interface ITestProps {
  test: string
}
describe('Login app step one', () => {
  let store: AppStore
  beforeEach(() => {
    moxios.install(client)
  })
  afterEach(() => {
    moxios.uninstall(client)
  })
  describe('Step One Container test', () => {
    let component: ReactWrapper
    let props: ITestProps
    beforeEach(() => {
      store = createStore()
      props = {
        test: ''
      }
      component = createConnectedTestComponent(
        <StepOneContainer {...props} />,
        store
      )
    })
    it('Renders successfully', () => {
      expect(component.find('form#STEP_ONE')).toHaveLength(1)
    })
    it('changes the language from english to bengali', async () => {
      console.log('BEFORE', component.find('p').debug())
      const action = {
        type: actions.CHANGE_LANGUAGE,
        payload: { LANGUAGE: 'bn' }
      }
      store.dispatch(action)
      await wait()
      component.update()
      console.log(store.getState())
      console.log('AFTER', component.find('p').debug())
      /* expect(component.find('p')).toEqual(
        'দয়া করে আপনার মোবাইল নম্বর এবং পাসওয়ার্ড লিখুন'
      )*/
    })
  })
})

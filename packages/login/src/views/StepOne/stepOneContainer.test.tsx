import * as React from 'react'
import * as moxios from 'moxios'
import { ReactWrapper } from 'enzyme'
import { StepOneContainer } from './StepOneContainer'
import { createTestComponent } from '../../tests/util'
import { client } from '../../utils/authApi'

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
})

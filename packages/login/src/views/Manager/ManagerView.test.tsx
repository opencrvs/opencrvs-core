import * as React from 'react'
import { ReactWrapper } from 'enzyme'
import { ManagerViewContainer } from '@login/views/Manager/ManagerView'
import { createTestComponent, wait } from '@login/tests/util'

describe('Manager view', () => {
  describe('Step Two Container test', () => {
    let component: ReactWrapper

    beforeEach(() => {
      component = createTestComponent(<ManagerViewContainer />)
      window.location.assign = jest.fn()
    })
    it('Renders successfully', () => {
      expect(
        component.find('#register_app_action_button').hostNodes()
      ).toHaveLength(1)
    })
    it('Should redirect the user to the register app', async () => {
      component
        .find('#register_app_action_button')
        .hostNodes()
        .simulate('click')
      await wait()
      expect(window.location.assign).toBeCalledWith(
        `${window.config.REGISTER_APP_URL}registrar-home?token=`
      )
    })
    it('Should redirect the user to the performance app', async () => {
      component
        .find('#performance_app_action_button')
        .hostNodes()
        .simulate('click')
      await wait()
      expect(window.location.assign).toBeCalledWith(
        `${window.config.PERFORMANCE_APP_URL}?token=`
      )
    })
  })
})

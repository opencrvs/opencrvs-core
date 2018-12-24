import * as React from 'react'
import { LogoutConfirmation } from 'src/components/LogoutConfirmation'
import { ReactWrapper } from 'enzyme'
import { createStore } from 'src/store'
import { createTestComponent } from 'src/tests/util'

const { store } = createStore()
const mockHandleYes = jest.fn()
const mockHandleClose = jest.fn()

describe('when user opens the log out modal', () => {
  let logoutComponent: ReactWrapper<{}, {}>
  beforeEach(async () => {
    const testComponent = createTestComponent(
      <LogoutConfirmation
        show={true}
        handleYes={mockHandleYes}
        handleClose={mockHandleClose}
      />,
      store
    )
    logoutComponent = testComponent.component
  })

  it('renders logout confirmation dialog', () => {
    expect(logoutComponent.find('#logout_confirm').hostNodes()).toHaveLength(1)
  })

  it('calls yes button handler', () => {
    logoutComponent
      .find('#logout_confirm')
      .hostNodes()
      .simulate('click')

    expect(mockHandleYes).toHaveBeenCalled()
  })

  it('calls no button handler', () => {
    logoutComponent
      .find('#logout_close')
      .hostNodes()
      .simulate('click')

    expect(mockHandleClose).toHaveBeenCalled()
  })
})

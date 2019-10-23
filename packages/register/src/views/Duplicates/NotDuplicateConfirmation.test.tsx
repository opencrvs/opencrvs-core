import * as React from 'react'
import { NotDuplicateConfirmation } from '@register/views/Duplicates/NotDuplicateConfirmation'
import { ReactWrapper } from 'enzyme'
import { createStore } from '@register/store'
import { createTestComponent } from '@register/tests/util'

const { store } = createStore()
const mockHandleYes = jest.fn()
const mockHandleClose = jest.fn()

describe('when user opens the log out modal', () => {
  let logoutComponent: ReactWrapper<{}, {}>
  beforeEach(async () => {
    const testComponent = await createTestComponent(
      <NotDuplicateConfirmation
        show={true}
        handleYes={mockHandleYes}
        handleClose={mockHandleClose}
      />,
      store
    )
    logoutComponent = testComponent.component
  })

  it('renders not a duplicate confirmation dialog', () => {
    expect(
      logoutComponent.find('#not_duplicate_confirm').hostNodes()
    ).toHaveLength(1)
  })

  it('calls yes button handler', () => {
    logoutComponent
      .find('#not_duplicate_confirm')
      .hostNodes()
      .simulate('click')

    expect(mockHandleYes).toHaveBeenCalled()
  })

  it('calls no button handler', () => {
    logoutComponent
      .find('#not_duplicate_close')
      .hostNodes()
      .simulate('click')

    expect(mockHandleClose).toHaveBeenCalled()
  })
})

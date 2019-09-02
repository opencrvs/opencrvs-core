import * as React from 'react'
import { EditConfirmation } from '@register/views/RegisterForm/review/EditConfirmation'
import { ReactWrapper } from 'enzyme'
import { createStore } from '@register/store'
import { createTestComponent } from '@register/tests/util'

const { store } = createStore()
const mockHandleEdit = jest.fn()
const mockHandleClose = jest.fn()

describe('when user is in the review page', () => {
  let editComponent: ReactWrapper<{}, {}>
  beforeEach(async () => {
    const testComponent = await createTestComponent(
      <EditConfirmation
        show={true}
        handleEdit={mockHandleEdit}
        handleClose={mockHandleClose}
      />,
      store
    )
    editComponent = testComponent.component
  })

  it('renders edit confirmation dialog', () => {
    expect(editComponent.find('#edit_confirm').hostNodes()).toHaveLength(1)
  })

  it('mock edit button click', () => {
    editComponent
      .find('#edit_confirm')
      .hostNodes()
      .simulate('click')

    expect(mockHandleEdit).toHaveBeenCalled()
  })

  it('mock preview back button click', () => {
    editComponent
      .find('#preview_back')
      .hostNodes()
      .simulate('click')

    expect(mockHandleClose).toHaveBeenCalled()
  })
})

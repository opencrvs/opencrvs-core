import * as React from 'react'
import { ReactWrapper } from 'enzyme'
import { createStore } from 'src/store'
import { createTestComponent } from 'src/tests/util'
import { RejectRegistrationForm } from '@opencrvs/register/src/components/review/RejectRegistrationForm'

const { store } = createStore()
const mockOnBack = jest.fn()

describe('reject registration form', () => {
  let rejectFormComponent: ReactWrapper<{}, {}>
  beforeEach(async () => {
    const testComponent = createTestComponent(
      <RejectRegistrationForm onBack={mockOnBack} />,
      store
    )
    rejectFormComponent = testComponent.component
  })

  it('renders form', () => {
    expect(
      rejectFormComponent.find('#submit_reject_form').hostNodes()
    ).toHaveLength(1)
  })

  it('renders form with submit button disabled', () => {
    expect(
      rejectFormComponent
        .find('#submit_reject_form')
        .hostNodes()
        .prop('disabled')
    ).toEqual(true)
  })

  it('enables submit button when form is complete', () => {
    rejectFormComponent
      .find('#rejectionReasonOther')
      .hostNodes()
      .simulate('change', { checked: true })

    rejectFormComponent
      .find('#rejectionCommentForHealthWorker')
      .hostNodes()
      .simulate('change', {
        target: { name: 'rejectionCommentForHealthWorker', value: 'test' }
      })

    expect(
      rejectFormComponent
        .find('#submit_reject_form')
        .hostNodes()
        .prop('disabled')
    ).toEqual(false)
  })
})

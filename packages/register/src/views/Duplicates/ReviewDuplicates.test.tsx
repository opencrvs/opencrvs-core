import * as React from 'react'
import { createTestComponent } from '../../tests/util'
import { ReviewDuplicates, rejectMutation } from './ReviewDuplicates'
import { createStore } from 'src/store'
import { ReactWrapper } from 'enzyme'

describe('Review Duplicates component', () => {
  let component: ReactWrapper<{}, {}>
  beforeEach(() => {
    const { store, history } = createStore()
    const mock: any = jest.fn()

    const testComponent = createTestComponent(
      <ReviewDuplicates
        location={mock}
        history={history}
        match={{
          params: { applicationId: '' },
          isExact: true,
          path: '',
          url: ''
        }}
      />,
      store
    )
    component = testComponent.component
  })
  it('renders without crashing', () => {
    expect(component).toBeDefined()
  })
  it('detail boxes are loaded properly', () => {
    expect(component.find('#detail_box_1').hostNodes()).toHaveLength(1)
    expect(component.find('#detail_box_2').hostNodes()).toHaveLength(1)
    expect(component.find('#detail_box_3').hostNodes()).toHaveLength(1)
  })
  it('reject confirmation shows up if reject link is clicked', () => {
    component
      .find('#reject_link_1')
      .hostNodes()
      .simulate('click')

    component.update()
    expect(component.find('#reject_confirm').hostNodes()).toHaveLength(1)
  })
  it('back link on reject confirm modal hides the confirm modal', () => {
    component
      .find('#reject_link_1')
      .hostNodes()
      .simulate('click')

    component
      .find('#back_link')
      .hostNodes()
      .simulate('click')
    component.update()

    expect(component.find('#reject_confirm').hostNodes()).toHaveLength(0)
  })

  it('successfuly rejects the application', async () => {
    const { store, history } = createStore()
    const mock: any = jest.fn()

    const testComponent = createTestComponent(
      <ReviewDuplicates
        location={mock}
        history={history}
        match={{
          params: { applicationId: '' },
          isExact: true,
          path: '',
          url: ''
        }}
      />,
      store,
      [
        {
          request: {
            query: rejectMutation,
            variables: { id: '1', reason: 'Duplicate' }
          },
          result: { data: { markBirthAsVoided: '1' } }
        }
      ]
    )

    testComponent.component
      .find('#reject_link_1')
      .hostNodes()
      .simulate('click')
    testComponent.component.update()

    testComponent.component
      .find('#reject_confirm')
      .hostNodes()
      .simulate('click')

    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 0)
    })
    testComponent.component.update()

    expect(
      testComponent.component.find('#reject_confirm').hostNodes()
    ).toHaveLength(0)
  })
})

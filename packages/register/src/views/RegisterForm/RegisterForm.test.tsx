import * as React from 'react'
import { createTestComponent /*, wait*/ } from 'src/tests/util'
import { RegisterForm } from './RegisterForm'
import { ReactWrapper } from 'enzyme'
import { createDraft, storeDraft } from 'src/drafts'
import { createStore } from '../../store'
import { shallow } from 'enzyme'
import { default as ReactSelect } from 'react-select'
import { states } from '../../forms/address'

describe('when user is in the register form', () => {
  const { store, history } = createStore()
  const draft = createDraft()
  store.dispatch(storeDraft(draft))
  let component: ReactWrapper<{}, {}>
  const mock: any = jest.fn()
  describe('when user is in the mother section', () => {
    beforeEach(async () => {
      // Had to create store externally as RegisterForm requires access to route params and history
      const testComponent = createTestComponent(
        <RegisterForm
          location={mock}
          history={history}
          staticContext={mock}
          match={{
            params: { draftId: draft.id, tabId: 'mother' },
            isExact: true,
            path: '',
            url: ''
          }}
        />,
        store
      )
      component = testComponent.component
    })
    it('renders the page', () => {
      expect(
        component.find('#form_section_title_mother').hostNodes()
      ).toHaveLength(1)
    })
    it('shows districts when state is selected', async () => {
      /// react-select simulate change isnt working for me
      /*
      const select = component
        .find(Select)
        .find('[id="country"]')
        .hostNodes()
      select.simulate('change', { target: { value: 'state2' } })
      await wait()
      expect(select.props().value).toBe('state2')
      /*

      According to this thread, we must change the input but I cant do it:

      https://github.com/airbnb/enzyme/issues/400

      */
    })
  })
})

// shallow rendering works but we need mount in order to test the dynamic address fields

describe('react-select', () => {
  it('should call onChange with shallow', () => {
    const mock: any = jest.fn()
    const wrapper = shallow(<ReactSelect onChange={mock} options={states} />)
    const selectWrapper = wrapper.find('Select')
    selectWrapper.simulate('change')
    expect(mock).toHaveBeenCalled()
  })
})

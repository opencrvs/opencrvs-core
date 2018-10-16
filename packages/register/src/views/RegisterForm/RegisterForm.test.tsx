import * as React from 'react'
import { createTestComponent, selectOption } from 'src/tests/util'
import { RegisterForm } from './RegisterForm'
import { ReactWrapper } from 'enzyme'
import { createDraft, storeDraft, setInitialDrafts } from 'src/drafts'
import { IntlProvider } from 'react-intl'
import { createStore } from '../../store'

describe('when user is in the register form', () => {
  const { store, history } = createStore()
  const draft = createDraft()
  const initalDrafts = JSON.parse('[]')
  store.dispatch(setInitialDrafts(initalDrafts))
  store.dispatch(storeDraft(draft))
  let component: ReactWrapper<{}, {}>
  const intlProvider = new IntlProvider({ locale: 'en' }, {})
  const { intl } = intlProvider.getChildContext()
  const mock: any = jest.fn()
  describe('when user is in the mother section', () => {
    beforeEach(async () => {
      const testComponent = createTestComponent(
        <RegisterForm
          location={mock}
          intl={intl}
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
    it('changes the country select', async () => {
      const select = selectOption(
        component,
        '#country',
        'United States of America'
      )
      expect(component.find(select).text()).toEqual('United States of America')
    })
  })
})

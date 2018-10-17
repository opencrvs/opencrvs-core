import * as React from 'react'
import { createTestComponent } from 'src/tests/util'
import { DocumentUploadForm } from './DocumentUploadForm'
import { ReactWrapper } from 'enzyme'
import { createDraft, storeDraft } from 'src/drafts'
import { IntlProvider } from 'react-intl'
import { createStore } from '../../store'
import * as actions from 'src/i18n/actions'

describe('when user is in the document upload form', () => {
  const { store, history } = createStore()
  const draft = createDraft()
  store.dispatch(storeDraft(draft))
  let component: ReactWrapper<{}, {}>
  const intlProvider = new IntlProvider({ locale: 'en' }, {})
  const { intl } = intlProvider.getChildContext()
  const mock: any = jest.fn()

  beforeEach(() => {
    const testComponent = createTestComponent(
      <DocumentUploadForm
        location={mock}
        intl={intl}
        history={history}
        staticContext={mock}
        match={{
          params: { draftId: draft.id },
          isExact: true,
          path: '',
          url: ''
        }}
      />,
      store
    )
    component = testComponent.component
  })
  it('system should ask, for whom user wants to upload document', () => {
    expect(
      component
        .find('#uploadDocForWhom_label')
        .hostNodes()
        .text()
    ).toEqual('Whose suppoting document are you uploading?')
  })
  it('internationalization supports with the question, for whom user wants to upload document', async () => {
    const action = actions.changeLanguage({ language: 'bn' })
    store.dispatch(action)
    expect(
      component
        .find('#uploadDocForWhom_label')
        .hostNodes()
        .text()
    ).toEqual('আপনি কার সাসমর্থনকারী কাগজপত্র আপলোড করছেন?')
  })
  describe('when user selects option for whom they are uploading document', () => {
    beforeEach(() => {
      component
        .find('#uploadDocForWhom_Mother')
        .hostNodes()
        .simulate('change')
    })
    it('system should ask user about uploaded document type', () => {
      const action = actions.changeLanguage({ language: 'en' })
      store.dispatch(action)
      expect(
        component
          .find('#whatDocToUpload_label')
          .hostNodes()
          .text()
      ).toEqual('Which document type are you uploading?')
    })
    it('internationalization supports with the question, which type of document user is uploading', () => {
      const action = actions.changeLanguage({ language: 'bn' })
      store.dispatch(action)
      expect(
        component
          .find('#whatDocToUpload_label')
          .hostNodes()
          .text()
      ).toEqual('আপনি কোন প্রকার কাগজপত্র আপলোড করছেন?')
    })
    it('user should not see the upload button untill next question is answered', () => {
      expect(component.find('#upload_document').hostNodes()).toHaveLength(0)
    })
    describe('when user selects type of document they are uploading', () => {
      beforeEach(() => {
        component
          .find('#whatDocToUpload_NID')
          .hostNodes()
          .simulate('change')
      })
      it('user should be able to see upload button', () => {
        expect(component.find('#upload_document').hostNodes()).toHaveLength(1)
      })
    })
  })
})

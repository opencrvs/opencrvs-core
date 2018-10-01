import * as React from 'react'
import { createTestComponent } from 'src/tests/util'
import { PreviewSection } from './PreviewSection'
import { ReactWrapper } from 'enzyme'
import { createDraft } from 'src/drafts'
import * as actions from 'src/i18n/actions'
import { Store } from 'redux'

describe('when user is in the preview page', () => {
  let store: Store
  let previewSectionComponent: ReactWrapper<{}, {}>
  const draft = createDraft()
  draft.data = { mother: { maritalStatus: 'MARRIED' } }

  beforeEach(async () => {
    const testComponent = createTestComponent(
      <PreviewSection draft={draft} onSubmit={() => ({})} />
    )
    previewSectionComponent = testComponent.component
    store = testComponent.store
  })
  it('renders the select labels', () => {
    const label = previewSectionComponent
      .find('#listItem_value_mother_maritalStatus')
      .hostNodes()
      .text()
    expect(label).toBe('Married')
  })
  it('renders the select labels with internationalization', async () => {
    const action = actions.changeLanguage({ language: 'bn' })
    store.dispatch(action)

    const label = previewSectionComponent
      .find('#listItem_value_mother_maritalStatus')
      .hostNodes()
      .text()
    expect(label).toBe('বিবাহিত')
  })
})

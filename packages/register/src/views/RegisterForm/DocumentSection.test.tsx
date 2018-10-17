import * as React from 'react'
import { createTestComponent } from 'src/tests/util'
import { DocumentSection } from './DocumentSection'
import { ReactWrapper } from 'enzyme'
import { createDraft } from 'src/drafts'
import { createStore } from '../../store'

describe('when user is in the document section', () => {
  const { store } = createStore()
  let documentSectionComponent: ReactWrapper<{}, {}>
  const draft = createDraft()

  beforeEach(async () => {
    const testComponent = createTestComponent(
      <DocumentSection draft={draft} />,
      store
    )
    documentSectionComponent = testComponent.component
  })
  it('screen is loaded', () => {
    expect(
      documentSectionComponent.find('#next_section').hostNodes()
    ).toHaveLength(1)
  })
})

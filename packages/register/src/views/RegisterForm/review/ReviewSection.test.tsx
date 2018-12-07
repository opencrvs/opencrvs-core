import * as React from 'react'
import { ReviewSection } from './ReviewSection'
import { ReactWrapper } from 'enzyme'
import { createStore } from 'src/store'
import { createTestComponent } from 'src/tests/util'
import { createDraft } from 'src/drafts'
import { REVIEW_BIRTH_PARENT_FORM_TAB } from 'src/navigation/routes'

const { store } = createStore()
const mockHandler = jest.fn()
const draft = createDraft()
draft.data = {
  child: { firstNamesEng: 'John', familyNameEng: 'Doe' },
  father: { fathersDetailsExist: true, addressSameAsMother: false },
  documents: {
    image_uploader: [{ title: 'dummy', description: 'dummy', data: '' }]
  }
}

describe('when user is in the review page', () => {
  let reviewSectionComponent: ReactWrapper<{}, {}>
  beforeEach(async () => {
    const testComponent = createTestComponent(
      <ReviewSection
        tabRoute={REVIEW_BIRTH_PARENT_FORM_TAB}
        draft={draft}
        registerClickEvent={mockHandler}
        rejectApplicationClickEvent={mockHandler}
        submitClickEvent={mockHandler}
      />,
      store
    )
    reviewSectionComponent = testComponent.component
    reviewSectionComponent
      .find(`button#next_button_child`)
      .hostNodes()
      .simulate('click')
    reviewSectionComponent
      .find(`button#next_button_mother`)
      .hostNodes()
      .simulate('click')
    reviewSectionComponent
      .find(`button#next_button_father`)
      .hostNodes()
      .simulate('click')
  })

  it('Should collapse the section', () => {
    reviewSectionComponent
      .find(`#SectionDrawer_child ._expansionBtn`)
      .hostNodes()
      .simulate('click')

    const elemHeight = reviewSectionComponent
      .find(`#SectionDrawer_child ._sectionContainer`)
      .at(0)
      .getDOMNode().clientHeight
    expect(elemHeight).toBe(0)
  })

  it('Should click the Register button', async () => {
    reviewSectionComponent
      .find('#registerApplicationBtn')
      .hostNodes()
      .simulate('click')
    expect(mockHandler).toHaveBeenCalled()
  })

  it('Should click the Reject Application', async () => {
    reviewSectionComponent
      .find('#rejectApplicationBtn')
      .hostNodes()
      .simulate('click')
    expect(mockHandler).toHaveBeenCalled()
  })
})

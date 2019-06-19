import * as React from 'react'
import {
  ReviewSection,
  renderSelectDynamicLabel
} from '@register/views/RegisterForm/review/ReviewSection'
import { ReactWrapper } from 'enzyme'
import { createStore } from '@register/store'
import {
  createTestComponent,
  mockOfflineData,
  intl
} from '@register/tests/util'
import {
  createApplication,
  createReviewApplication
} from '@register/applications'
import { REVIEW_EVENT_PARENT_FORM_PAGE } from '@register/navigation/routes'
import { Event } from '@register/forms'
import { v4 as uuid } from 'uuid'
import { REJECTED } from '@register/utils/constants'

const { store } = createStore()
const mockHandler = jest.fn()
const draft = createApplication(Event.BIRTH)
const rejectedDraftBirth = createReviewApplication(
  uuid(),
  {},
  Event.BIRTH,
  REJECTED
)
const rejectedDraftDeath = createReviewApplication(
  uuid(),
  {},
  Event.DEATH,
  REJECTED
)

draft.data = {
  child: { firstNamesEng: 'John', familyNameEng: 'Doe' },
  father: { fathersDetailsExist: true, addressSameAsMother: false },
  documents: {
    imageUploader: [{ title: 'dummy', description: 'dummy', data: '' }]
  }
}

describe('when user is in the review page', () => {
  let reviewSectionComponent: ReactWrapper<{}, {}>
  beforeEach(async () => {
    const testComponent = createTestComponent(
      <ReviewSection
        pageRoute={REVIEW_EVENT_PARENT_FORM_PAGE}
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
describe('return the correct label on dynamic fields', () => {
  it('Should return the Bengali label', () => {
    expect(
      renderSelectDynamicLabel(
        '8cbc862a-b817-4c29-a490-4a8767ff023c',
        { resource: 'locations', dependency: 'countryPermanent' },
        {
          countryPermanent: 'BGD',
          statePermanent: '8cbc862a-b817-4c29-a490-4a8767ff023c'
        },
        intl,
        { ...mockOfflineData, offlineDataLoaded: true, loadingError: false },
        'bn'
      )
    ).toBe('চট্টগ্রাম')
  })
  it('Should return the English label', () => {
    expect(
      renderSelectDynamicLabel(
        '8cbc862a-b817-4c29-a490-4a8767ff023c',
        { resource: 'locations', dependency: 'countryPermanent' },
        {
          countryPermanent: 'BGD',
          statePermanent: '8cbc862a-b817-4c29-a490-4a8767ff023c'
        },
        intl,
        { ...mockOfflineData, offlineDataLoaded: true, loadingError: false },
        'en'
      )
    ).toBe('Chittagong')
  })
})

describe('when user is in the review page for rejected birth application', () => {
  let reviewSectionComponent: ReactWrapper<{}, {}>
  beforeEach(async () => {
    const testComponent = createTestComponent(
      <ReviewSection
        pageRoute={REVIEW_EVENT_PARENT_FORM_PAGE}
        draft={rejectedDraftBirth}
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

  it('Should not click the Reject Application', async () => {
    const rejectButton = reviewSectionComponent.find('#rejectApplicationBtn')
      .length
    expect(rejectButton).toEqual(0)
  })
})

describe('when user is in the review page for rejected death application', () => {
  let reviewSectionComponent: ReactWrapper<{}, {}>
  beforeEach(async () => {
    const testComponent = createTestComponent(
      <ReviewSection
        pageRoute={REVIEW_EVENT_PARENT_FORM_PAGE}
        draft={rejectedDraftDeath}
        registerClickEvent={mockHandler}
        rejectApplicationClickEvent={mockHandler}
        submitClickEvent={mockHandler}
      />,
      store
    )
    reviewSectionComponent = testComponent.component
    reviewSectionComponent
      .find(`button#next_button_deceased`)
      .hostNodes()
      .simulate('click')
    reviewSectionComponent
      .find(`button#next_button_informant`)
      .hostNodes()
      .simulate('click')
    reviewSectionComponent
      .find(`button#next_button_deathEvent`)
      .hostNodes()
      .simulate('click')
  })

  it('Should not click the Reject Application', async () => {
    const rejectButton = reviewSectionComponent.find('#rejectApplicationBtn')
      .length
    expect(rejectButton).toEqual(0)
  })
})

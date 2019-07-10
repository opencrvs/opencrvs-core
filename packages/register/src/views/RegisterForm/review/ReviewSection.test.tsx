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
  intl,
  flushPromises
} from '@register/tests/util'
import {
  createApplication,
  createReviewApplication,
  storeApplication,
  modifyApplication
} from '@register/applications'
import { REVIEW_EVENT_PARENT_FORM_PAGE } from '@register/navigation/routes'
import { Event } from '@register/forms'
import { v4 as uuid } from 'uuid'
import { REJECTED } from '@register/utils/constants'

const { store, history } = createStore()
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
    imageUploader: { title: 'dummy', description: 'dummy', data: '' }
  },
  registration: {
    commentsOrNotes: ''
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
        onChangeReviewForm={mockHandler}
      />,
      store
    )
    reviewSectionComponent = testComponent.component
  })

  describe('when user clicks on change link', () => {
    beforeEach(() => {
      reviewSectionComponent
        .find('#btn_change_child_familyNameEng')
        .hostNodes()
        .simulate('click')
      reviewSectionComponent.update()
    })

    it('edit dialog should show up', () => {
      expect(
        reviewSectionComponent.find('#edit_confirm').hostNodes()
      ).toHaveLength(1)
    })

    it('clicking on edit takes user back to form', async () => {
      reviewSectionComponent
        .find('#edit_confirm')
        .hostNodes()
        .simulate('click')
      reviewSectionComponent.update()
      await flushPromises()
      expect(history.location.pathname).toContain('reviews')
    })
  })

  it('renders header component', () => {
    expect(
      reviewSectionComponent.find('#review_header').hostNodes()
    ).toHaveLength(1)
    expect(
      reviewSectionComponent
        .find('#review_header_title')
        .hostNodes()
        .text()
    ).toBe('Government of the peoples republic of Bangladesh')
    expect(
      reviewSectionComponent
        .find('#review_header_subject')
        .hostNodes()
        .text()
    ).toBe('Birth Application for John Doe')
  })
  it('clicking required field link takes user to the to field on form', async () => {
    reviewSectionComponent
      .find('#required_link_child_familyName')
      .hostNodes()
      .simulate('click')
    await flushPromises()
    reviewSectionComponent.update()
    expect(history.location.pathname).toContain('child')
    expect(history.location.hash).toBe('#familyName')
  })

  it('typing additional comments input triggers onchange review form', async () => {
    store.dispatch(storeApplication(draft))
    reviewSectionComponent
      .find('#additional_comments')
      .hostNodes()
      .simulate('change', {
        target: {
          id: 'additional_comments',
          value: 'some comments'
        }
      })
    expect(mockHandler).toBeCalled()
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
  })

  it('Should not click the Reject Application', async () => {
    const rejectButton = reviewSectionComponent.find('#rejectApplicationBtn')
      .length
    expect(rejectButton).toEqual(0)
  })
})

import {
  createApplication,
  createReviewApplication,
  storeApplication
} from '@register/applications'
import { Event as ApplicationEvent } from '@register/forms'
import { REVIEW_EVENT_PARENT_FORM_PAGE } from '@register/navigation/routes'
import * as profileSelectors from '@register/profile/profileSelectors'
import { createStore } from '@register/store'
import {
  createTestComponent,
  flushPromises,
  mockOfflineData
} from '@register/tests/util'
import { REJECTED } from '@register/utils/constants'
import {
  renderSelectDynamicLabel,
  ReviewSection
} from '@register/views/RegisterForm/review/ReviewSection'
import { ReactWrapper } from 'enzyme'
import * as React from 'react'
import { v4 as uuid } from 'uuid'
import { waitForElement } from '@register/tests/wait-for-element'
import { isMobileDevice } from '@register/utils/commonUtils'
import { createIntl } from 'react-intl'

const { store, history } = createStore()
const mockHandler = jest.fn()

const draft = createApplication(ApplicationEvent.BIRTH)

const declaredBirthApplication = createReviewApplication(
  uuid(),
  {},
  ApplicationEvent.BIRTH
)
const rejectedDraftBirth = createReviewApplication(
  uuid(),
  {},
  ApplicationEvent.BIRTH,
  REJECTED
)
const rejectedDraftDeath = createReviewApplication(
  uuid(),
  {},
  ApplicationEvent.DEATH,
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

Object.defineProperty(window.navigator, 'userAgent', {
  value: 'Desktop'
})
Object.defineProperty(window, 'outerWidth', {
  value: 1034
})

beforeEach(() => {
  ;(isMobileDevice as jest.Mock).mockRestore()
})

const intl = createIntl({ locale: 'en' })

describe('when user is in the review page', () => {
  let reviewSectionComponent: ReactWrapper<{}, {}>
  beforeEach(async () => {
    const testComponent = await createTestComponent(
      <ReviewSection
        pageRoute={REVIEW_EVENT_PARENT_FORM_PAGE}
        draft={draft}
        rejectApplicationClickEvent={mockHandler}
        submitClickEvent={mockHandler}
        onChangeReviewForm={mockHandler}
      />,
      store
    )
    reviewSectionComponent = testComponent.component
    await waitForElement(reviewSectionComponent, '#review_header')
  })

  it('Goes to child document while scroll to child section', async () => {
    window.dispatchEvent(new Event('scroll'))
    await waitForElement(reviewSectionComponent, '#document_section_child')
  })

  describe('when user clicks on change link', () => {
    beforeEach(() => {
      reviewSectionComponent
        .find('#btn_change_child_familyNameEng')
        .hostNodes()
        .simulate('click')
      reviewSectionComponent.update()
    })

    it('edit dialog should not show up', () => {
      expect(
        reviewSectionComponent.find('#edit_confirm').hostNodes()
      ).toHaveLength(0)
    })

    it('clicking on edit takes user back to form', async () => {
      reviewSectionComponent
        .find('#btn_change_child_familyNameEng')
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
        mockOfflineData,
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
        mockOfflineData,
        'en'
      )
    ).toBe('Chittagong')
  })
})

describe('when user is in the review page for rejected birth application', () => {
  let reviewSectionComponent: ReactWrapper<{}, {}>
  beforeEach(async () => {
    jest.spyOn(profileSelectors, 'getScope').mockReturnValue(['register'])
    const testComponent = await createTestComponent(
      <ReviewSection
        pageRoute={REVIEW_EVENT_PARENT_FORM_PAGE}
        draft={rejectedDraftBirth}
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
    const testComponent = await createTestComponent(
      <ReviewSection
        pageRoute={REVIEW_EVENT_PARENT_FORM_PAGE}
        draft={rejectedDraftDeath}
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

describe('when user is in the review page to validate birth application', () => {
  let reviewSectionComponent: ReactWrapper<{}, {}>
  beforeEach(async () => {
    jest.spyOn(profileSelectors, 'getScope').mockReturnValue(['validate'])
    const testComponent = await createTestComponent(
      <ReviewSection
        pageRoute={REVIEW_EVENT_PARENT_FORM_PAGE}
        draft={declaredBirthApplication}
        rejectApplicationClickEvent={mockHandler}
        submitClickEvent={mockHandler}
      />,
      store
    )
    reviewSectionComponent = testComponent.component
  })

  it('Should click the Validate Application Button', async () => {
    const validateButton = reviewSectionComponent
      .find('#validateApplicationBtn')
      .hostNodes().length
    expect(validateButton).toEqual(1)
  })

  it('Should click the Reject Application Button', async () => {
    const rejectButton = reviewSectionComponent
      .find('#rejectApplicationBtn')
      .hostNodes().length
    expect(rejectButton).toEqual(1)
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
})

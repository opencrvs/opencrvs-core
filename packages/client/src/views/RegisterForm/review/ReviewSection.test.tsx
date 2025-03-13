/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import {
  createDeclaration,
  createReviewDeclaration,
  storeDeclaration
} from '@client/declarations'
import {
  // BirthSection,
  ViewType,
  // DeathSection,
  LOCATION_SEARCH_INPUT,
  DATE,
  DOCUMENT_UPLOADER_WITH_OPTION,
  IForm
  // MarriageSection
} from '@client/forms'
import { Event as DeclarationEvent, RegStatus } from '@client/utils/gateway'
import { REVIEW_EVENT_PARENT_FORM_PAGE } from '@client/navigation/routes'
import * as profileSelectors from '@client/profile/profileSelectors'
import { createStore } from '@client/store'
import {
  createTestComponent,
  flushPromises,
  getRegisterFormFromStore,
  mockOfflineData,
  mockOfflineDataDispatch,
  resizeWindow,
  userDetails
} from '@client/tests/util'
import {
  renderSelectDynamicLabel,
  ReviewSection
} from '@client/views/RegisterForm/review/ReviewSection'
import { ReactWrapper } from 'enzyme'
import * as React from 'react'
import { v4 as uuid } from 'uuid'
import { waitForElement } from '@client/tests/wait-for-element'
import { isMobileDevice } from '@client/utils/commonUtils'
import { createIntl } from 'react-intl'
import { formMessages } from '@client/i18n/messages'
import { vi, Mock, SpyInstance } from 'vitest'
import { offlineDataReady } from '@client/offline/actions'

const { store, history } = createStore()
const mockHandler = vi.fn()

const draft = createDeclaration(DeclarationEvent.Birth)
draft.data = {
  child: { firstNamesEng: 'John', familyNameEng: 'Doe' },
  father: {
    detailsExist: true
  },
  mother: {
    detailsExist: true
  },
  documents: {
    imageUploader: { title: 'dummy', description: 'dummy', data: '' }
  },
  registration: {
    commentsOrNotes: ''
  }
}

const declaredBirthDeclaration = createReviewDeclaration(
  uuid(),
  draft.data,
  DeclarationEvent.Birth
)
const rejectedDraftBirth = createReviewDeclaration(
  uuid(),
  draft.data,
  DeclarationEvent.Birth,
  RegStatus.Rejected
)
const rejectedDraftDeath = createReviewDeclaration(
  uuid(),
  draft.data,
  DeclarationEvent.Death,
  RegStatus.Rejected
)
const rejectedDraftMarriage = createReviewDeclaration(
  uuid(),
  draft.data,
  DeclarationEvent.Marriage,
  RegStatus.Rejected
)

describe('when in device of large viewport', () => {
  let userAgentMock: SpyInstance
  let form: Awaited<ReturnType<typeof getRegisterFormFromStore>>

  beforeEach(async () => {
    store.dispatch(offlineDataReady(mockOfflineDataDispatch))
    await flushPromises()
    form = await getRegisterFormFromStore(store, DeclarationEvent.Birth)
    userAgentMock = vi.spyOn(window.navigator, 'userAgent', 'get')
    Object.assign(window, { outerWidth: 1034 })

    userAgentMock.mockReturnValue('Desktop')
    ;(isMobileDevice as Mock).mockRestore()
  })

  const intl = createIntl({ locale: 'en' })

  describe('when user is in the review page', () => {
    let reviewSectionComponent: ReactWrapper<{}, {}>
    beforeEach(async () => {
      const testComponent = await createTestComponent(
        <ReviewSection
          pageRoute={REVIEW_EVENT_PARENT_FORM_PAGE}
          form={form}
          draft={draft}
          rejectDeclarationClickEvent={mockHandler}
          submitClickEvent={mockHandler}
          onChangeReviewForm={mockHandler}
          userDetails={userDetails}
        />,
        { store, history }
      )
      reviewSectionComponent = testComponent
      await waitForElement(reviewSectionComponent, '#review_header')
    })

    it('Goes to child document while scroll to child section', async () => {
      window.dispatchEvent(new Event('scroll'))
      await waitForElement(reviewSectionComponent, '#child-accordion')
    })

    it('shows zero document error if no document is uploaded', async () => {
      window.dispatchEvent(new Event('scroll'))
      await waitForElement(reviewSectionComponent, '#zero_document')
    })

    describe('when user clicks on change link', () => {
      beforeEach(() => {
        reviewSectionComponent
          .find('#btn_change_child_familyNameEng')
          .hostNodes()
          .first()
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
          .first()
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
        reviewSectionComponent.find('#review_header_title').hostNodes().text()
      ).toBe('Government of the peoples republic of Bangladesh')
      expect(
        reviewSectionComponent.find('#review_header_subject').hostNodes().text()
      ).toBe('Birth Declaration for Doe John')
    })

    it('typing additional comments input triggers onchange review form', async () => {
      store.dispatch(storeDeclaration(draft))
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
          { resource: 'locations', dependency: 'countryPrimary' },
          {
            countryPrimary: 'BGD',
            statePrimary: '8cbc862a-b817-4c29-a490-4a8767ff023c'
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
          { resource: 'locations', dependency: 'countryPrimary' },
          {
            countryPrimary: 'BGD',
            statePrimary: '8cbc862a-b817-4c29-a490-4a8767ff023c'
          },
          intl,
          mockOfflineData,
          'en'
        )
      ).toBe('Chittagong')
    })
  })

  describe('when user is in the review page for rejected birth declaration', () => {
    let reviewSectionComponent: ReactWrapper<{}, {}>
    beforeEach(async () => {
      vi.spyOn(profileSelectors, 'getScope').mockReturnValue(['register'])
      const testComponent = await createTestComponent(
        <ReviewSection
          pageRoute={REVIEW_EVENT_PARENT_FORM_PAGE}
          form={form}
          draft={rejectedDraftBirth}
          rejectDeclarationClickEvent={mockHandler}
          submitClickEvent={mockHandler}
          userDetails={userDetails}
        />,
        { store, history }
      )
      reviewSectionComponent = testComponent
    })

    it('Should not click the Reject Declaration', async () => {
      const rejectButton = reviewSectionComponent.find(
        '#rejectDeclarationBtn'
      ).length
      expect(rejectButton).toEqual(0)
    })
  })

  describe('when user is in the review page for rejected death declaration', () => {
    let reviewSectionComponent: ReactWrapper<{}, {}>
    beforeEach(async () => {
      const testComponent = await createTestComponent(
        <ReviewSection
          form={form}
          pageRoute={REVIEW_EVENT_PARENT_FORM_PAGE}
          draft={rejectedDraftDeath}
          rejectDeclarationClickEvent={mockHandler}
          submitClickEvent={mockHandler}
          userDetails={userDetails}
        />,
        { store, history }
      )
      reviewSectionComponent = testComponent
    })

    it('Should not click the Reject Declaration', async () => {
      const rejectButton = reviewSectionComponent.find(
        '#rejectDeclarationBtn'
      ).length
      expect(rejectButton).toEqual(0)
    })
  })

  describe('when user is in the review page for rejected marriage declaration', () => {
    let reviewSectionComponent: ReactWrapper<{}, {}>
    beforeEach(async () => {
      const testComponent = await createTestComponent(
        <ReviewSection
          form={form}
          pageRoute={REVIEW_EVENT_PARENT_FORM_PAGE}
          draft={rejectedDraftMarriage}
          rejectDeclarationClickEvent={mockHandler}
          submitClickEvent={mockHandler}
          userDetails={userDetails}
        />,
        { store, history }
      )
      reviewSectionComponent = testComponent
    })

    it('Should not click the Reject Declaration', async () => {
      const rejectButton = reviewSectionComponent.find(
        '#rejectDeclarationBtn'
      ).length
      expect(rejectButton).toEqual(0)
    })
  })

  describe('when user is in the review page to validate birth declaration', () => {
    let reviewSectionComponent: ReactWrapper<{}, {}>
    beforeEach(async () => {
      vi.spyOn(profileSelectors, 'getScope').mockReturnValue(['validator'])
      const testComponent = await createTestComponent(
        <ReviewSection
          form={form}
          pageRoute={REVIEW_EVENT_PARENT_FORM_PAGE}
          draft={declaredBirthDeclaration}
          rejectDeclarationClickEvent={mockHandler}
          submitClickEvent={mockHandler}
          userDetails={userDetails}
        />,
        { store, history }
      )
      reviewSectionComponent = testComponent
    })

    it('Should click the validator Declaration Button', async () => {
      const validatorButton = reviewSectionComponent.contains(
        '#validatorDeclarationBtn'
      )
      expect(validatorButton).toBeFalsy()
    })

    it('Should click the Reject Declaration Button', async () => {
      const rejectButton = reviewSectionComponent.contains(
        '#rejectDeclarationBtn'
      )
      expect(rejectButton).toBeFalsy()
    })

    describe('when user clicks on change link', () => {
      beforeEach(() => {
        reviewSectionComponent
          .find('#btn_change_child_familyNameEng')
          .hostNodes()
          .first()
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

  describe('when form has location input field', () => {
    let reviewSectionComponent: ReactWrapper<{}, {}>

    beforeAll(() => {
      vi.resetAllMocks()
    })

    beforeEach(async () => {
      vi.spyOn(profileSelectors, 'getScope').mockReturnValue(['register'])
      const form = {
        sections: [
          {
            id: 'registration',
            viewType: 'hidden',
            name: {
              defaultMessage: 'Registration',
              description: 'Form section name for Registration',
              id: 'form.section.declaration.name'
            },
            groups: []
          },
          {
            id: 'child',
            viewType: 'form' as ViewType,
            title: formMessages.childTitle,
            name: formMessages.childTitle,
            groups: [
              {
                id: 'child-view-group',
                fields: [
                  {
                    name: 'birthLocation',
                    type: LOCATION_SEARCH_INPUT,
                    searchableResource: ['facilities'],
                    searchableType: ['HEALTH_FACILITY'],
                    locationList: [],
                    required: true,
                    validator: [],
                    label: formMessages.birthLocation
                  }
                ]
              }
            ]
          },
          {
            id: 'documents',
            name: formMessages.documentsName,
            title: formMessages.documentsTitle,
            viewType: 'form' as ViewType,
            groups: [
              {
                id: 'documents-view-group',
                fields: [
                  {
                    name: 'uploadDocForMother',
                    extraValue: 'MOTHER',
                    type: DOCUMENT_UPLOADER_WITH_OPTION,
                    label: formMessages.uploadDocForMother,
                    required: true,
                    validator: [],
                    options: [
                      {
                        label: formMessages.docTypeBirthCert,
                        value: 'BIRTH_CERTIFICATE'
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            id: 'preview',
            viewType: 'preview',
            name: {
              defaultMessage: 'Preview',
              description: 'Form section name for Preview',
              id: 'register.form.section.preview.name'
            },
            title: {
              defaultMessage: 'Preview',
              description: 'Form section title for Preview',
              id: 'register.form.section.preview.title'
            },
            groups: [
              {
                id: 'preview-view-group',
                fields: []
              }
            ]
          }
        ]
      } satisfies IForm

      const data = {
        child: {
          birthLocation: '0d8474da-0361-4d32-979e-af91f012340a'
        },
        documents: {}
      }

      const simpleDraft = createReviewDeclaration(
        uuid(),
        data,
        DeclarationEvent.Birth
      )

      const testComponent = await createTestComponent(
        <ReviewSection
          form={form}
          pageRoute={REVIEW_EVENT_PARENT_FORM_PAGE}
          draft={simpleDraft}
          rejectDeclarationClickEvent={mockHandler}
          submitClickEvent={mockHandler}
          userDetails={userDetails}
        />,
        { store, history }
      )
      reviewSectionComponent = testComponent
    })

    it('renders selected location label', () => {
      expect(reviewSectionComponent.find('#Hospital')).toBeTruthy()
    })
  })
})

describe('when in device of small viewport', () => {
  let reviewSectionComponent: ReactWrapper<{}, {}>
  let userAgentMock: SpyInstance
  const { store } = createStore()

  beforeAll(() => {
    resizeWindow(600, 960)
    vi.resetAllMocks()
  })

  beforeEach(async () => {
    userAgentMock = vi.spyOn(window.navigator, 'userAgent', 'get')
    userAgentMock.mockReturnValue('Android')
    vi.spyOn(profileSelectors, 'getScope').mockReturnValue(['register'])
    const form = {
      sections: [
        {
          id: 'registration',
          viewType: 'hidden',
          name: {
            defaultMessage: 'Registration',
            description: 'Form section name for Registration',
            id: 'form.section.declaration.name'
          },
          groups: []
        },
        {
          id: 'mother',
          name: formMessages.motherTitle,
          title: formMessages.motherTitle,
          viewType: 'form' as ViewType,
          groups: [
            {
              id: 'mother-view-group',
              fields: [
                {
                  name: 'motherBirthDate',
                  type: DATE,
                  label: formMessages.dateOfBirth,
                  required: true,
                  validator: [],
                  initialValue: ''
                }
              ]
            }
          ]
        },
        {
          id: 'documents',
          name: formMessages.documentsName,
          title: formMessages.documentsTitle,
          viewType: 'form' as ViewType,
          groups: [
            {
              id: 'documents-view-group',
              fields: [
                {
                  name: 'uploadDocForMother',
                  extraValue: 'MOTHER',
                  type: DOCUMENT_UPLOADER_WITH_OPTION,
                  label: formMessages.uploadDocForMother,
                  required: true,
                  validator: [],
                  options: [
                    {
                      label: formMessages.docTypeBirthCert,
                      value: 'BIRTH_CERTIFICATE'
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          id: 'preview',
          viewType: 'preview',
          name: {
            defaultMessage: 'Preview',
            description: 'Form section name for Preview',
            id: 'register.form.section.preview.name'
          },
          title: {
            defaultMessage: 'Preview',
            description: 'Form section title for Preview',
            id: 'register.form.section.preview.title'
          },
          groups: [
            {
              id: 'preview-view-group',
              fields: []
            }
          ]
        }
      ]
    } satisfies IForm
    ;(isMobileDevice as Mock).mockRestore()

    const data = {
      documents: {
        uploadDocForMother: [
          {
            optionValues: ['MOTHER', 'NATIONAL_ID'],
            type: 'image/png',
            data: 'data:image/png;base64,abcd'
          }
        ],
        uploadDocForChildDOB: [
          {
            optionValues: ['CHILD', 'NOTIFICATION_OF_BIRTH'],
            type: 'image/png',
            data: 'data:image/png;base64,abcd'
          }
        ]
      }
    }

    const simpleDraft = createReviewDeclaration(
      uuid(),
      data,
      DeclarationEvent.Birth
    )

    const testComponent = await createTestComponent(
      <ReviewSection
        form={form}
        pageRoute={REVIEW_EVENT_PARENT_FORM_PAGE}
        draft={simpleDraft}
        rejectDeclarationClickEvent={mockHandler}
        submitClickEvent={mockHandler}
        onChangeReviewForm={mockHandler}
        userDetails={userDetails}
      />,
      { store, history }
    )

    reviewSectionComponent = testComponent
  })

  it('renders preview list of documents', () => {
    expect(
      reviewSectionComponent
        .find('#preview-list-all_attachment_list')
        .hostNodes()
    ).toHaveLength(1)
  })

  describe('clicking on preview list item...', () => {
    beforeEach(() => {
      reviewSectionComponent
        .find('#document_NOTIFICATION_OF_BIRTH_link')
        .hostNodes()
        .simulate('click')

      reviewSectionComponent.update()
    })

    it('opens document preview page', () => {
      expect(
        reviewSectionComponent.find('#preview_image_field').hostNodes()
      ).toHaveLength(1)
    })

    it('clicking on back button closes image preview', () => {
      reviewSectionComponent
        .find('#preview_close')
        .hostNodes()
        .simulate('click')

      expect(
        reviewSectionComponent.find('#preview_image_field').hostNodes()
      ).toHaveLength(0)
    })
  })
})

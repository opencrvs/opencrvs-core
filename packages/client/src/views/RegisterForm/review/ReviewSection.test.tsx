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
  DATE,
  DOCUMENT_UPLOADER_WITH_OPTION,
  IForm,
  // DeathSection,
  LOCATION_SEARCH_INPUT,
  TEXT,
  // MarriageSection
  // BirthSection,
  ViewType
} from '@client/forms'
import { formMessages } from '@client/i18n/messages'
import { formatUrl } from '@client/navigation'
import { REVIEW_EVENT_PARENT_FORM_PAGE } from '@client/navigation/routes'
import { offlineDataReady } from '@client/offline/actions'
import { createStore } from '@client/store'
import {
  createTestComponent,
  flushPromises,
  getRegisterFormFromStore,
  mockOfflineData,
  mockOfflineDataDispatch,
  resizeWindow,
  setScopes,
  TestComponentWithRouteMock,
  userDetails
} from '@client/tests/util'
import { waitForElement } from '@client/tests/wait-for-element'
import { isMobileDevice } from '@client/utils/commonUtils'
import { SCOPES } from '@opencrvs/commons/client'
import {
  EventType as DeclarationEvent,
  EventType,
  RegStatus
} from '@client/utils/gateway'
import {
  renderSelectDynamicLabel,
  ReviewSection
} from '@client/views/RegisterForm/review/ReviewSection'
import { ReactWrapper } from 'enzyme'
import * as React from 'react'
import { createIntl } from 'react-intl'
import { v4 as uuid } from 'uuid'
import { Mock, SpyInstance, vi } from 'vitest'

const { store } = createStore()
const mockHandler = vi.fn()

const draft = createDeclaration(EventType.Birth)
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
  EventType.Birth
)
const rejectedDraftBirth = createReviewDeclaration(
  uuid(),
  draft.data,
  EventType.Birth,
  RegStatus.Rejected
)
const rejectedDraftDeath = createReviewDeclaration(
  uuid(),
  draft.data,
  EventType.Death,
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
    form = await getRegisterFormFromStore(store, EventType.Birth)
    userAgentMock = vi.spyOn(window.navigator, 'userAgent', 'get')
    Object.assign(window, { outerWidth: 1034 })

    userAgentMock.mockReturnValue('Desktop')
    ;(isMobileDevice as Mock).mockRestore()
  })

  const intl = createIntl({ locale: 'en' })

  describe('when user is in the review page', () => {
    let reviewSectionComponent: TestComponentWithRouteMock['component']
    let reviewSectionRouter: TestComponentWithRouteMock['router']
    beforeEach(async () => {
      const { component: testComponent, router } = await createTestComponent(
        <ReviewSection
          pageRoute={REVIEW_EVENT_PARENT_FORM_PAGE}
          form={form}
          draft={draft}
          rejectDeclarationClickEvent={mockHandler}
          submitClickEvent={mockHandler}
          onChangeReviewForm={mockHandler}
          userDetails={userDetails}
        />,
        {
          store,
          initialEntries: [formatUrl(REVIEW_EVENT_PARENT_FORM_PAGE, {})]
        }
      )
      reviewSectionComponent = testComponent
      reviewSectionRouter = router
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
        expect(reviewSectionRouter.state.location.pathname).toContain('reviews')
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
      ).toBe('Birth Declaration for John Doe')
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
      setScopes([SCOPES.RECORD_REGISTER], store)

      const { component: testComponent } = await createTestComponent(
        <ReviewSection
          pageRoute={REVIEW_EVENT_PARENT_FORM_PAGE}
          form={form}
          draft={rejectedDraftBirth}
          rejectDeclarationClickEvent={mockHandler}
          submitClickEvent={mockHandler}
          userDetails={userDetails}
        />,
        { store }
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
      const { component: testComponent } = await createTestComponent(
        <ReviewSection
          form={form}
          pageRoute={REVIEW_EVENT_PARENT_FORM_PAGE}
          draft={rejectedDraftDeath}
          rejectDeclarationClickEvent={mockHandler}
          submitClickEvent={mockHandler}
          userDetails={userDetails}
        />,
        { store }
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
      const { component: testComponent } = await createTestComponent(
        <ReviewSection
          form={form}
          pageRoute={REVIEW_EVENT_PARENT_FORM_PAGE}
          draft={rejectedDraftMarriage}
          rejectDeclarationClickEvent={mockHandler}
          submitClickEvent={mockHandler}
          userDetails={userDetails}
        />,
        { store }
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
    let reviewSectionComponent: TestComponentWithRouteMock['component']
    let reviewSectionRouter: TestComponentWithRouteMock['router']

    beforeEach(async () => {
      setScopes(
        [SCOPES.RECORD_SUBMIT_FOR_APPROVAL, SCOPES.RECORD_SUBMIT_FOR_UPDATES],
        store
      )

      const { component: testComponent, router } = await createTestComponent(
        <ReviewSection
          form={form}
          pageRoute={REVIEW_EVENT_PARENT_FORM_PAGE}
          draft={declaredBirthDeclaration}
          rejectDeclarationClickEvent={mockHandler}
          submitClickEvent={mockHandler}
          userDetails={userDetails}
        />,
        { store }
      )
      reviewSectionComponent = testComponent
      reviewSectionRouter = router
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
        expect(reviewSectionRouter.state.location.pathname).toContain('reviews')
      })
    })
  })

  describe('when form has location input field', () => {
    let reviewSectionComponent: ReactWrapper<{}, {}>

    beforeAll(() => {
      vi.resetAllMocks()
    })

    beforeEach(async () => {
      setScopes([SCOPES.RECORD_REGISTER], store)
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

      const simpleDraft = createReviewDeclaration(uuid(), data, EventType.Birth)

      const { component: testComponent } = await createTestComponent(
        <ReviewSection
          form={form}
          pageRoute={REVIEW_EVENT_PARENT_FORM_PAGE}
          draft={simpleDraft}
          rejectDeclarationClickEvent={mockHandler}
          submitClickEvent={mockHandler}
          userDetails={userDetails}
        />,
        { store }
      )
      reviewSectionComponent = testComponent
    })

    it('renders selected location label', () => {
      expect(reviewSectionComponent.find('#Hospital')).toBeTruthy()
    })
  })

  describe('when form has a postfix with no value', () => {
    let reviewSectionComponent: ReactWrapper<{}, {}>

    beforeAll(() => {
      vi.resetAllMocks()
    })

    beforeEach(async () => {
      setScopes([SCOPES.RECORD_REGISTER], store)
      const form = {
        sections: [
          {
            id: 'registration',
            viewType: 'hidden',
            name: {
              defaultMessage: 'Registration'
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
                    name: 'weight',
                    type: 'NUMBER',
                    required: false,
                    validator: [],
                    postfix: 'kg',
                    label: {
                      defaultMessage: 'Weight',
                      id: 'weight'
                    }
                  },
                  {
                    name: 'height',
                    type: 'NUMBER',
                    required: false,
                    validator: [],
                    postfix: 'inches',
                    label: {
                      defaultMessage: 'Height',
                      id: 'height'
                    }
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
                fields: []
              }
            ]
          },
          {
            id: 'preview',
            viewType: 'preview',
            name: {
              defaultMessage: 'Preview'
            },
            title: {
              defaultMessage: 'Preview'
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
          weight: 67
        },
        documents: {}
      }

      const simpleDraft = createReviewDeclaration(uuid(), data, EventType.Birth)

      const { component: testComponent } = await createTestComponent(
        <ReviewSection
          form={form}
          pageRoute={REVIEW_EVENT_PARENT_FORM_PAGE}
          draft={simpleDraft}
          rejectDeclarationClickEvent={mockHandler}
          submitClickEvent={mockHandler}
          userDetails={userDetails}
        />,
        { store }
      )
      reviewSectionComponent = testComponent
    })

    it('should not render postfix', () => {
      const text = reviewSectionComponent.text()

      expect(text).toContain('kg')
      expect(text).not.toContain('inches')
    })
  })

  describe('when form has empty field in a group', () => {
    let reviewSectionComponent: ReactWrapper<{}, {}>

    beforeAll(() => {
      vi.resetAllMocks()
    })

    beforeEach(async () => {
      setScopes([SCOPES.RECORD_REGISTER], store)
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
                    name: 'addressLine1Placeofbirth',
                    type: TEXT,
                    required: false,
                    validator: [],
                    previewGroup: 'address',
                    label: {
                      defaultMessage: 'TestAddress 1',
                      id: 'test1'
                    }
                  },
                  {
                    name: 'addressLine2Placeofbirth',
                    type: TEXT,
                    required: false,
                    validator: [],
                    previewGroup: 'address',
                    label: {
                      defaultMessage: 'TestAddress 2',
                      id: 'test2'
                    }
                  },
                  {
                    name: 'addressLine3Placeofbirth',
                    type: TEXT,
                    required: false,
                    validator: [],
                    previewGroup: 'address',
                    label: {
                      defaultMessage: 'TestAddress 3',
                      id: 'test3'
                    }
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
          addressLine1Placeofbirth: 'District 9',
          addressLine2Placeofbirth: '',
          addressLine3Placeofbirth: 'Suburb 7'
        },
        documents: {}
      }

      const simpleDraft = createReviewDeclaration(uuid(), data, EventType.Birth)

      const { component: testComponent } = await createTestComponent(
        <ReviewSection
          form={form}
          pageRoute={REVIEW_EVENT_PARENT_FORM_PAGE}
          draft={simpleDraft}
          rejectDeclarationClickEvent={mockHandler}
          submitClickEvent={mockHandler}
          userDetails={userDetails}
        />,
        { store }
      )
      reviewSectionComponent = testComponent
    })

    it('renders only fields with values', () => {
      const addressList = reviewSectionComponent.find({
        'data-test-id': 'row-value-TestAddress'
      })

      const innerHtml = addressList
        .children()
        .map((n) => n.html())
        .join('')

      const addressLines = innerHtml.split('<br>')

      expect(addressLines.length).toBe(2)
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
    setScopes([SCOPES.RECORD_REGISTER], store)
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

    const { component: testComponent } = await createTestComponent(
      <ReviewSection
        form={form}
        pageRoute={REVIEW_EVENT_PARENT_FORM_PAGE}
        draft={simpleDraft}
        rejectDeclarationClickEvent={mockHandler}
        submitClickEvent={mockHandler}
        onChangeReviewForm={mockHandler}
        userDetails={userDetails}
      />,
      { store }
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

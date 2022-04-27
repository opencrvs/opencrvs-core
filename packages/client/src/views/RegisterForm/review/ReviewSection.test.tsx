/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import {
  createDeclaration,
  createReviewDeclaration,
  storeDeclaration
} from '@client/declarations'
import {
  Event as DeclarationEvent,
  BirthSection,
  ViewType,
  RADIO_GROUP_WITH_NESTED_FIELDS,
  TEL,
  DeathSection,
  TEXT,
  LOCATION_SEARCH_INPUT,
  DATE,
  DOCUMENT_UPLOADER_WITH_OPTION
} from '@client/forms'
import { REVIEW_EVENT_PARENT_FORM_PAGE } from '@client/navigation/routes'
import * as profileSelectors from '@client/profile/profileSelectors'
import * as declarationSelectors from '@client/forms/register/declaration-selectors'
import { createStore } from '@client/store'
import {
  createTestComponent,
  flushPromises,
  mockOfflineData,
  resizeWindow
} from '@client/tests/util'
import { REJECTED } from '@client/utils/constants'
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
import { phoneNumberFormat } from '@client/utils/validate'
import { formMessages } from '@client/i18n/messages'
import { LocationType } from '@client/offline/reducer'

const { store, history } = createStore()
const mockHandler = jest.fn()

const draft = createDeclaration(DeclarationEvent.BIRTH)

const declaredBirthDeclaration = createReviewDeclaration(
  uuid(),
  {},
  DeclarationEvent.BIRTH
)
const rejectedDraftBirth = createReviewDeclaration(
  uuid(),
  {},
  DeclarationEvent.BIRTH,
  REJECTED
)
const rejectedDraftDeath = createReviewDeclaration(
  uuid(),
  {},
  DeclarationEvent.DEATH,
  REJECTED
)

draft.data = {
  child: { firstNamesEng: 'John', familyNameEng: 'Doe' },
  father: {
    detailsExist: true
  },
  documents: {
    imageUploader: { title: 'dummy', description: 'dummy', data: '' }
  },
  registration: {
    commentsOrNotes: ''
  }
}

describe('when in device of large viewport', () => {
  let userAgentMock: jest.SpyInstance

  beforeEach(() => {
    userAgentMock = jest.spyOn(window.navigator, 'userAgent', 'get')
    Object.assign(window, { outerWidth: 1034 })

    userAgentMock.mockReturnValue('Desktop')
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
          rejectDeclarationClickEvent={mockHandler}
          submitClickEvent={mockHandler}
          onChangeReviewForm={mockHandler}
        />,
        { store, history }
      )
      reviewSectionComponent = testComponent
      await waitForElement(reviewSectionComponent, '#review_header')
    })

    it('Goes to child document while scroll to child section', async () => {
      window.dispatchEvent(new Event('scroll'))
      await waitForElement(reviewSectionComponent, '#document_section_child')
    })

    it('shows zero document error if no document is uploaded', async () => {
      window.dispatchEvent(new Event('scroll'))
      await waitForElement(reviewSectionComponent, '#zero_document_child')
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
      jest.spyOn(profileSelectors, 'getScope').mockReturnValue(['register'])
      const testComponent = await createTestComponent(
        <ReviewSection
          pageRoute={REVIEW_EVENT_PARENT_FORM_PAGE}
          draft={rejectedDraftBirth}
          rejectDeclarationClickEvent={mockHandler}
          submitClickEvent={mockHandler}
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
          pageRoute={REVIEW_EVENT_PARENT_FORM_PAGE}
          draft={rejectedDraftDeath}
          rejectDeclarationClickEvent={mockHandler}
          submitClickEvent={mockHandler}
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
      jest.spyOn(profileSelectors, 'getScope').mockReturnValue(['validate'])
      const testComponent = await createTestComponent(
        <ReviewSection
          pageRoute={REVIEW_EVENT_PARENT_FORM_PAGE}
          draft={declaredBirthDeclaration}
          rejectDeclarationClickEvent={mockHandler}
          submitClickEvent={mockHandler}
        />,
        { store, history }
      )
      reviewSectionComponent = testComponent
    })

    it('Should click the Validate Declaration Button', async () => {
      const validateButton = reviewSectionComponent
        .find('#validateDeclarationBtn')
        .hostNodes().length
      expect(validateButton).toEqual(1)
    })

    it('Should click the Reject Declaration Button', async () => {
      const rejectButton = reviewSectionComponent
        .find('#rejectDeclarationBtn')
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

  describe('when form has a field that has nested fields in definitions', () => {
    let reviewSectionComponent: ReactWrapper<{}, {}>

    beforeAll(() => {
      jest.resetAllMocks()
    })

    beforeEach(async () => {
      jest.spyOn(profileSelectors, 'getScope').mockReturnValue(['register'])
      jest.spyOn(declarationSelectors, 'getRegisterForm').mockReturnValue({
        birth: {
          sections: [
            {
              id: BirthSection.Registration,
              hasDocumentSection: true,
              viewType: 'form' as ViewType,
              title: {
                defaultMessage: 'Informant',
                description: 'Form section name for Informant',
                id: 'form.section.informant.name'
              },
              name: {
                defaultMessage: 'Informant',
                description: 'Form section name for Informant',
                id: 'form.section.informant.name'
              },
              groups: [
                {
                  id: 'contact-group',
                  fields: [
                    {
                      name: 'informant',
                      type: RADIO_GROUP_WITH_NESTED_FIELDS,
                      label: {
                        defaultMessage: 'Informant',
                        description: 'Form section name for Informant',
                        id: 'form.section.informant.name'
                      },
                      required: true,
                      initialValue: '',
                      validate: [],
                      options: [
                        {
                          value: 'FATHER',
                          label: {
                            defaultMessage: 'Father',
                            description: 'Label for option Father',
                            id: 'form.field.label.informantRelation.father'
                          }
                        },
                        {
                          value: 'MOTHER',
                          label: {
                            defaultMessage: 'Mother',
                            description: 'Label for option Mother',
                            id: 'form.field.label.informantRelation.mother'
                          }
                        }
                      ],
                      nestedFields: {
                        FATHER: [
                          {
                            name: 'informantPhoneFather',
                            type: TEL,
                            label: {
                              defaultMessage: 'Phone number',
                              description: 'Input label for phone input',
                              id: 'form.field.label.phoneNumber'
                            },
                            required: false,
                            initialValue: '',
                            validate: [phoneNumberFormat]
                          }
                        ],
                        MOTHER: [
                          {
                            name: 'informantPhoneMother',
                            type: TEL,
                            label: {
                              defaultMessage: 'Phone number',
                              description: 'Input label for phone input',
                              id: 'form.field.label.phoneNumber'
                            },
                            required: false,
                            initialValue: '',
                            validate: [phoneNumberFormat]
                          }
                        ]
                      }
                    }
                  ]
                }
              ]
            }
          ]
        },
        death: {
          sections: [
            {
              id: DeathSection.Deceased,
              viewType: 'form' as ViewType,
              name: {
                defaultMessage: 'What are the deceased details?',
                description: 'Form section title for Deceased',
                id: 'form.section.deceased.title'
              },
              title: {
                defaultMessage: 'What are the deceased details?',
                description: 'Form section title for Deceased',
                id: 'form.section.deceased.title'
              },
              groups: [
                {
                  id: 'deceased',
                  fields: [
                    {
                      name: 'firstNames',
                      type: TEXT,
                      label: {
                        defaultMessage: 'First name(s)',
                        description: 'Label for form field: Given names',
                        id: 'form.field.label.childFirstNamesEng'
                      },
                      required: true,
                      initialValue: '',
                      validate: [],
                      conditionals: []
                    }
                  ]
                }
              ]
            }
          ]
        }
      })

      const data = {
        registration: {
          informant: {
            value: 'MOTHER',
            nestedFields: {
              informantPhoneMother: '011123456789'
            }
          }
        }
      }

      const simpleDraft = createReviewDeclaration(
        uuid(),
        data,
        DeclarationEvent.BIRTH
      )

      const testComponent = await createTestComponent(
        <ReviewSection
          pageRoute={REVIEW_EVENT_PARENT_FORM_PAGE}
          draft={simpleDraft}
          rejectDeclarationClickEvent={mockHandler}
          submitClickEvent={mockHandler}
        />,
        { store, history }
      )
      reviewSectionComponent = testComponent
    })

    it('renders values in review section', () => {
      expect(
        reviewSectionComponent.find('#Informant').hostNodes()
      ).toHaveLength(1)

      expect(
        reviewSectionComponent.find('#Informant').hostNodes().childAt(0).text()
      ).toContain('Mother')
    })

    it('renders validation error if wrong value given', () => {
      expect(
        reviewSectionComponent
          .find('#required_label_registration_informant')
          .hostNodes()
      ).toHaveLength(1)
    })
  })

  describe('when form has location input field', () => {
    let reviewSectionComponent: ReactWrapper<{}, {}>

    beforeAll(() => {
      jest.resetAllMocks()
    })

    beforeEach(async () => {
      jest.spyOn(profileSelectors, 'getScope').mockReturnValue(['register'])
      jest.spyOn(declarationSelectors, 'getRegisterForm').mockReturnValue({
        birth: {
          sections: [
            {
              id: BirthSection.Child,
              viewType: 'form' as ViewType,
              title: formMessages.childTitle,
              name: formMessages.childTitle,
              hasDocumentSection: true,
              groups: [
                {
                  id: 'child-view-group',
                  fields: [
                    {
                      name: 'birthLocation',
                      type: LOCATION_SEARCH_INPUT,
                      searchableResource: 'facilities',
                      searchableType: LocationType.HEALTH_FACILITY,
                      locationList: [],
                      required: true,
                      validate: [],
                      label: formMessages.birthLocation
                    }
                  ]
                }
              ]
            }
          ]
        },
        death: {
          sections: [
            {
              id: DeathSection.Deceased,
              name: formMessages.deceasedTitle,
              title: formMessages.deceasedTitle,
              viewType: 'form' as ViewType,
              groups: []
            }
          ]
        }
      })

      const data = {
        child: {
          birthLocation: '0d8474da-0361-4d32-979e-af91f012340a'
        }
      }

      const simpleDraft = createReviewDeclaration(
        uuid(),
        data,
        DeclarationEvent.BIRTH
      )

      const testComponent = await createTestComponent(
        <ReviewSection
          pageRoute={REVIEW_EVENT_PARENT_FORM_PAGE}
          draft={simpleDraft}
          rejectDeclarationClickEvent={mockHandler}
          submitClickEvent={mockHandler}
        />,
        { store, history }
      )
      reviewSectionComponent = testComponent
    })

    it('renders selected location label', () => {
      expect(
        reviewSectionComponent
          .find('#Section_child')
          .hostNodes()
          .childAt(2)
          .text()
      ).toContain('Hospital / ClinicChange')
    })
  })
})

describe('when in device of small viewport', () => {
  let reviewSectionComponent: ReactWrapper<{}, {}>
  let userAgentMock: jest.SpyInstance
  const { store } = createStore()

  beforeAll(() => {
    resizeWindow(600, 960)
    jest.resetAllMocks()
  })

  beforeEach(async () => {
    userAgentMock = jest.spyOn(window.navigator, 'userAgent', 'get')
    userAgentMock.mockReturnValue('Android')
    jest.spyOn(profileSelectors, 'getScope').mockReturnValue(['register'])
    jest.spyOn(declarationSelectors, 'getRegisterForm').mockReturnValue({
      birth: {
        sections: [
          {
            id: BirthSection.Mother,
            name: formMessages.motherTitle,
            hasDocumentSection: true,
            title: formMessages.motherTitle,
            viewType: 'form' as ViewType,
            groups: [
              {
                id: 'mother-view-group',
                fields: [
                  {
                    name: 'motherBirthDate',
                    type: DATE,
                    label: formMessages.motherDateOfBirth,
                    required: true,
                    validate: [],
                    initialValue: ''
                  }
                ]
              }
            ]
          },
          {
            id: BirthSection.Documents,
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
                    validate: [],
                    options: [
                      {
                        label: formMessages.docTypeBR,
                        value: 'Birth Registration'
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },
      death: {
        sections: [
          {
            id: DeathSection.Deceased,
            name: formMessages.deceasedTitle,
            title: formMessages.deceasedTitle,
            viewType: 'form' as ViewType,
            groups: []
          }
        ]
      }
    })
    ;(isMobileDevice as jest.Mock).mockRestore()

    const data = {
      documents: {
        uploadDocForMother: [
          {
            optionValues: ['MOTHER', 'Birth Registration'],
            type: 'image/png',
            data: 'data:image/png;base64,abcd'
          }
        ]
      }
    }

    const simpleDraft = createReviewDeclaration(
      uuid(),
      data,
      DeclarationEvent.BIRTH
    )

    const testComponent = await createTestComponent(
      <ReviewSection
        pageRoute={REVIEW_EVENT_PARENT_FORM_PAGE}
        draft={simpleDraft}
        rejectDeclarationClickEvent={mockHandler}
        submitClickEvent={mockHandler}
        onChangeReviewForm={mockHandler}
      />,
      { store, history }
    )

    reviewSectionComponent = testComponent
  })

  it('renders without preview list of documents', () => {
    expect(
      reviewSectionComponent.find('#preview-list-mother').hostNodes()
    ).toHaveLength(1)
  })

  describe('clicking on preview list item...', () => {
    beforeEach(() => {
      reviewSectionComponent
        .find('#preview-list-mother')
        .hostNodes()
        .find('#document_BirthRegistration_link')
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
        .find('#preview_image_field')
        .hostNodes()
        .find('#preview_back')
        .hostNodes()
        .simulate('click')

      expect(
        reviewSectionComponent.find('#preview_image_field').hostNodes()
      ).toHaveLength(0)
    })

    it('clicking on delete button modifies declaration by removing uploaded file', () => {
      reviewSectionComponent
        .find('#preview_image_field')
        .hostNodes()
        .find('#preview_delete')
        .hostNodes()
        .simulate('click')

      expect(mockHandler).toBeCalled()
      expect(
        reviewSectionComponent.find('#preview_image_field').hostNodes()
      ).toHaveLength(0)
    })
  })
})

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
  createReviewDeclaration,
  DOWNLOAD_STATUS,
  getStorageDeclarationsSuccess,
  IDeclaration,
  storeDeclaration
} from '@opencrvs/client/src/declarations'
import { IForm, IFormSectionData } from '@opencrvs/client/src/forms'
import { Event } from '@client/utils/gateway'
import { REVIEW_EVENT_PARENT_FORM_PAGE } from '@opencrvs/client/src/navigation/routes'
import { checkAuth } from '@opencrvs/client/src/profile/profileActions'
import { RegisterForm } from '@opencrvs/client/src/views/RegisterForm/RegisterForm'
import * as React from 'react'
import { queries } from '@client/profile/queries'
import { AppStore } from '@client/store'
import {
  createTestComponent,
  mockUserResponseWithName,
  getReviewFormFromStore,
  createTestStore,
  mockDeathDeclarationData
} from '@client/tests/util'
import { v4 as uuid } from 'uuid'
import { ReviewForm } from '@client/views/RegisterForm/ReviewForm'
import { History } from 'history'
import { WORKQUEUE_TABS } from '@client/components/interface/Navigation'
import { birthDraftData } from '@client/tests/mock-drafts'
import { vi, Mock } from 'vitest'

const declareScope =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJpYXQiOjE1MzMxOTUyMjgsImV4cCI6MTU0MzE5NTIyNywiYXVkIjpbImdhdGV3YXkiXSwic3ViIjoiMSJ9.G4KzkaIsW8fTkkF-O8DI0qESKeBI332UFlTXRis3vJ6daisu06W5cZsgYhmxhx_n0Q27cBYt2OSOnjgR72KGA5IAAfMbAJifCul8ib57R4VJN8I90RWqtvA0qGjV-sPndnQdmXzCJx-RTumzvr_vKPgNDmHzLFNYpQxcmQHA-N8li-QHMTzBHU4s9y8_5JOCkudeoTMOd_1021EDAQbrhonji5V1EOSY2woV5nMHhmq166I1L0K_29ngmCqQZYi1t6QBonsIowlXJvKmjOH5vXHdCCJIFnmwHmII4BK-ivcXeiVOEM_ibfxMWkAeTRHDshOiErBFeEvqd6VWzKvbKAH0UY-Rvnbh4FbprmO4u4_6Yd2y2HnbweSo-v76dVNcvUS0GFLFdVBt0xTay-mIeDy8CKyzNDOWhmNUvtVi9mhbXYfzzEkwvi9cWwT1M8ZrsWsvsqqQbkRCyBmey_ysvVb5akuabenpPsTAjiR8-XU2mdceTKqJTwbMU5gz-8fgulbTB_9TNJXqQlH7tyYXMWHUY3uiVHWg2xgjRiGaXGTiDgZd01smYsxhVnPAddQOhqZYCrAgVcT1GBFVvhO7CC-rhtNlLl21YThNNZNpJHsCgg31WA9gMQ_2qAJmw2135fAyylO8q7ozRUvx46EezZiPzhCkPMeELzLhQMEIqjo'

const registerScopeToken =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWdpc3RlciIsImNlcnRpZnkiLCJkZW1vIl0sImlhdCI6MTU0MjY4ODc3MCwiZXhwIjoxNTQzMjkzNTcwLCJhdWQiOlsib3BlbmNydnM6YXV0aC11c2VyIiwib3BlbmNydnM6dXNlci1tZ250LXVzZXIiLCJvcGVuY3J2czpoZWFydGgtdXNlciIsIm9wZW5jcnZzOmdhdGV3YXktdXNlciIsIm9wZW5jcnZzOm5vdGlmaWNhdGlvbi11c2VyIiwib3BlbmNydnM6d29ya2Zsb3ctdXNlciJdLCJpc3MiOiJvcGVuY3J2czphdXRoLXNlcnZpY2UiLCJzdWIiOiI1YmVhYWY2MDg0ZmRjNDc5MTA3ZjI5OGMifQ.ElQd99Lu7WFX3L_0RecU_Q7-WZClztdNpepo7deNHqzro-Cog4WLN7RW3ZS5PuQtMaiOq1tCb-Fm3h7t4l4KDJgvC11OyT7jD6R2s2OleoRVm3Mcw5LPYuUVHt64lR_moex0x_bCqS72iZmjrjS-fNlnWK5zHfYAjF2PWKceMTGk6wnI9N49f6VwwkinJcwJi6ylsjVkylNbutQZO0qTc7HRP-cBfAzNcKD37FqTRNpVSvHdzQSNcs7oiv3kInDN5aNa2536XSd3H-RiKR9hm9eID9bSIJgFIGzkWRd5jnoYxT70G0t03_mTVnDnqPXDtyI-lmerx24Ost0rQLUNIg'
const getItem = window.localStorage.getItem as Mock

const mockDeclarationData = {
  child: {
    firstNames: 'গায়ত্রী',
    familyName: 'স্পিভক',
    firstNamesEng: 'Mike',
    familyNameEng: 'Test',
    childBirthDate: '1977-09-20',
    gender: 'male',
    weightAtBirth: '3.5',
    attendantAtBirth: 'MIDWIFE',
    birthType: 'SINGLE',
    multipleBirth: 1,
    placeOfBirth: 'HEALTH_FACILITY',
    birthLocation: '627fc0cc-e0e2-4c09-804d-38a9fa1807ee'
  },
  mother: {
    firstNames: 'স্পিভক',
    familyName: 'গায়ত্রী',
    firstNamesEng: 'Liz',
    familyNameEng: 'Test',
    iD: '6546511876932',
    iDType: 'NATIONAL_ID',
    motherBirthDate: '1949-05-31',
    dateOfMarriage: '1972-09-19',
    maritalStatus: 'MARRIED',
    educationalAttainment: 'SECOND_STAGE_TERTIARY_ISCED_6',
    nationality: 'BGD'
  },
  father: {
    detailsExist: true,
    firstNames: 'গায়ত্রী',
    familyName: 'স্পিভক',
    firstNamesEng: 'Jeff',
    familyNameEng: 'Test',
    iD: '123456789',
    iDType: 'PASSPORT',
    fatherBirthDate: '1950-05-19',
    dateOfMarriage: '1972-09-19',
    maritalStatus: 'MARRIED',
    educationalAttainment: 'SECOND_STAGE_TERTIARY_ISCED_6',
    nationality: 'BGD',
    primaryAddressSameAsOtherPrimary: true
  },
  documents: {
    uploadDocForMother: [
      {
        optionValues: ['MOTHER', 'BIRTH_CERTIFICATE'],
        type: 'image/jpeg',
        title: 'MOTHER',
        description: 'BIRTH_CERTIFICATE',
        data: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQECWAJYAAD'
      }
    ]
  },
  registration: {
    whoseContactDetails: {
      value: 'MOTHER',
      nestedFields: { registrationPhone: '01557394986' }
    },
    informantType: {
      value: 'MOTHER',
      nestedFields: { otherInformantType: '' }
    },
    registrationNumber: '201908122365BDSS0SE1',
    regStatus: {
      type: 'REGISTERED',
      officeName: 'MokhtarPur',
      officeAlias: 'মখতারপুর',
      officeAddressLevel3: 'Gazipur',
      officeAddressLevel4: 'Dhaka'
    },
    contactPoint: {
      nestedFields: {
        registrationPhone: '+8801711111111'
      }
    },
    certificates: [{}]
  }
}
const birthDeclaration: IDeclaration = {
  id: '31a78be1-5ab3-42c7-8f64-7678cb294508',
  data: {
    ...mockDeclarationData,
    corrector: {
      relationship: {
        value: 'MOTHER',
        nestedFields: {
          otherRelationship: ''
        }
      },
      hasShowedVerifiedDocument: false
    },
    review: {},
    supportingDocuments: {
      uploadDocForLegalProof: '',
      supportDocumentRequiredForCorrection: true
    },
    reason: {
      type: {
        value: 'CLERICAL_ERROR',
        nestedFields: {
          reasonForChange: ''
        }
      },
      additionalComment: 'Comment'
    }
  },
  originalData: mockDeclarationData,
  review: true,
  event: Event.Birth,
  registrationStatus: 'REGISTERED',
  downloadStatus: DOWNLOAD_STATUS.DOWNLOADED,
  modifiedOn: 1644407705186,
  visitedGroupIds: [
    {
      sectionId: 'mother',
      groupId: 'mother-view-group'
    },
    {
      sectionId: 'father',
      groupId: 'father-view-group'
    }
  ],
  timeLoggedMS: 990618
}

const deathDeclaration: IDeclaration = {
  id: '85bccf72-6117-4cab-827d-47728becb0c1',
  data: {
    ...mockDeathDeclarationData,
    informant: {
      firstNamesEng: 'John',
      familyNameEng: 'Millar'
    },
    spouse: {
      hasDetails: {
        value: 'Yes',
        nestedFields: {
          spouseFirstNamesEng: 'spouse',
          spouseFamilyNameEng: 'name'
        }
      }
    },
    documents: {
      uploadDocForDeceased: [],
      uploadDocForInformant: [],
      uploadDocForDeceasedDeath: []
    },
    _fhirIDMap: {
      composition: '85bccf72-6117-4cab-827d-47728becb0c1'
    },
    corrector: {
      relationship: {
        value: 'INFORMANT',
        nestedFields: {
          otherRelationship: ''
        }
      },
      hasShowedVerifiedDocument: false
    },
    review: {},
    supportingDocuments: {
      uploadDocForLegalProof: '',
      supportDocumentRequiredForCorrection: true
    },
    reason: {
      type: {
        value: 'MATERIAL_ERROR',
        nestedFields: {
          reasonForChange: ''
        }
      },
      additionalComment: ''
    }
  },
  originalData: mockDeathDeclarationData,
  review: true,
  event: Event.Death,
  registrationStatus: 'REGISTERED',
  downloadStatus: DOWNLOAD_STATUS.DOWNLOADED,
  modifiedOn: 1644490181166,
  visitedGroupIds: [
    {
      sectionId: 'informant',
      groupId: 'informant-view-group'
    },
    {
      sectionId: 'registration',
      groupId: 'point-of-contact'
    },
    {
      sectionId: 'deceased',
      groupId: 'deceased-view-group'
    },
    {
      sectionId: 'spouse',
      groupId: 'spouse-view-group'
    },
    {
      sectionId: 'deathEvent',
      groupId: 'deathEvent-deathLocation'
    }
  ],
  timeLoggedMS: 4446
}

const mockFetchUserDetails = vi.fn()
mockFetchUserDetails.mockReturnValue(mockUserResponseWithName)
queries.fetchUserDetails = mockFetchUserDetails
describe('ReviewForm tests', () => {
  const scope = ['register']
  const mock: any = vi.fn()
  let form: IForm
  let store: AppStore
  let history: History

  beforeEach(async () => {
    const testStore = await createTestStore()
    store = testStore.store
    history = testStore.history

    form = await getReviewFormFromStore(store, Event.Birth)
    getItem.mockReturnValue(registerScopeToken)
    store.dispatch(checkAuth())
  })

  it('Shared contact phone number should be set properly', async () => {
    store.dispatch(storeDeclaration(birthDeclaration))
    const testComponent = await createTestComponent(
      <ReviewForm
        location={mock}
        history={history}
        staticContext={mock}
        scope={scope}
        event={birthDeclaration.event}
        registerForm={form}
        pageRoute={REVIEW_EVENT_PARENT_FORM_PAGE}
        match={{
          params: {
            declarationId: birthDeclaration.id,
            pageId: 'review',
            event: birthDeclaration.event.toLowerCase()
          },
          isExact: true,
          path: '',
          url: ''
        }}
        declarationId={birthDeclaration.id}
      />,
      { store, history }
    )

    testComponent.update()
    const data = testComponent
      .find(RegisterForm)
      .prop('declaration') as IDeclaration
    expect(
      (
        (data.data.registration.contactPoint as IFormSectionData)
          .nestedFields as IFormSectionData
      ).registrationPhone
    ).toBe('+8801711111111')
  })
  it('when registration has attachment', async () => {
    store.dispatch(storeDeclaration(birthDeclaration))
    const testComponent = await createTestComponent(
      <ReviewForm
        location={mock}
        history={history}
        staticContext={mock}
        scope={scope}
        event={birthDeclaration.event}
        registerForm={form}
        pageRoute={REVIEW_EVENT_PARENT_FORM_PAGE}
        match={{
          params: {
            declarationId: birthDeclaration.id,
            pageId: 'review',
            event: birthDeclaration.event.toLowerCase()
          },
          isExact: true,
          path: '',
          url: ''
        }}
        declarationId={birthDeclaration.id}
      />,
      { store, history }
    )

    testComponent.update()

    const data = testComponent
      .find(RegisterForm)
      .prop('declaration') as IDeclaration

    expect(data.data.documents.uploadDocForMother).toEqual([
      {
        optionValues: ['MOTHER', 'BIRTH_CERTIFICATE'],
        type: 'image/jpeg',
        title: 'MOTHER',
        description: 'BIRTH_CERTIFICATE',
        data: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQECWAJYAAD'
      }
    ])
  })
  it('check registration', async () => {
    store.dispatch(storeDeclaration(birthDeclaration))
    const testComponent = await createTestComponent(
      <ReviewForm
        location={mock}
        history={history}
        staticContext={mock}
        scope={scope}
        event={birthDeclaration.event}
        registerForm={form}
        pageRoute={REVIEW_EVENT_PARENT_FORM_PAGE}
        match={{
          params: {
            declarationId: birthDeclaration.id,
            pageId: 'review',
            event: birthDeclaration.event.toLowerCase()
          },
          isExact: true,
          path: '',
          url: ''
        }}
        declarationId={birthDeclaration.id}
      />,
      { store, history }
    )

    testComponent.update()

    const data = testComponent
      .find(RegisterForm)
      .prop('declaration') as IDeclaration
    expect(data.data.registration).toEqual({
      whoseContactDetails: {
        value: 'MOTHER',
        nestedFields: { registrationPhone: '01557394986' }
      },
      informantType: {
        value: 'MOTHER',
        nestedFields: { otherInformantType: '' }
      },
      registrationNumber: '201908122365BDSS0SE1',
      regStatus: {
        type: 'REGISTERED',
        officeName: 'MokhtarPur',
        officeAlias: 'মখতারপুর',
        officeAddressLevel3: 'Gazipur',
        officeAddressLevel4: 'Dhaka'
      },
      contactPoint: {
        nestedFields: {
          registrationPhone: '+8801711111111'
        }
      },
      certificates: [{}]
    })
  })
  it('redirect to home when exit button is clicked', async () => {
    const declaration = createReviewDeclaration(
      uuid(),
      birthDraftData,
      Event.Birth,
      'IN_PROGRESS'
    )
    store.dispatch(
      getStorageDeclarationsSuccess(
        JSON.stringify({
          userID: 'currentUser', // mock
          drafts: [declaration],
          declarations: []
        })
      )
    )
    store.dispatch(storeDeclaration(declaration))

    const testComponent = await createTestComponent(
      <ReviewForm
        location={mock}
        history={history}
        staticContext={mock}
        scope={scope}
        event={declaration.event}
        registerForm={form}
        pageRoute={REVIEW_EVENT_PARENT_FORM_PAGE}
        match={{
          params: {
            declarationId: declaration.id,
            pageId: 'review',
            event: declaration.event.toLowerCase()
          },
          isExact: true,
          path: '',
          url: ''
        }}
        declarationId={declaration.id}
      />,
      { store, history }
    )
    testComponent.find('#exit-btn').hostNodes().simulate('click')
    testComponent.update()
    expect(window.location.href).toContain('/progress')
  })

  it('redirect to review tab when exit button is clicked', async () => {
    const declaration = createReviewDeclaration(
      uuid(),
      birthDraftData,
      Event.Birth,
      'DECLARED'
    )
    store.dispatch(
      getStorageDeclarationsSuccess(
        JSON.stringify({
          userID: 'currentUser', // mock
          drafts: [declaration],
          declarations: []
        })
      )
    )
    store.dispatch(storeDeclaration(declaration))

    const testComponent = await createTestComponent(
      <ReviewForm
        location={mock}
        history={history}
        staticContext={mock}
        scope={scope}
        event={declaration.event}
        registerForm={form}
        pageRoute={REVIEW_EVENT_PARENT_FORM_PAGE}
        match={{
          params: {
            declarationId: declaration.id,
            pageId: 'review',
            event: declaration.event.toLowerCase()
          },
          isExact: true,
          path: '',
          url: ''
        }}
        declarationId={declaration.id}
      />,
      { store, history }
    )
    testComponent.find('#exit-btn').hostNodes().simulate('click')
    testComponent.update()
    expect(window.location.href).toContain(WORKQUEUE_TABS.readyForReview)
  })

  it('redirect to review tab when exit button is clicked', async () => {
    const declaration = createReviewDeclaration(
      uuid(),
      birthDraftData,
      Event.Birth,
      'VALIDATED'
    )
    store.dispatch(
      getStorageDeclarationsSuccess(
        JSON.stringify({
          userID: 'currentUser', // mock
          drafts: [declaration],
          declarations: []
        })
      )
    )
    store.dispatch(storeDeclaration(declaration))

    const testComponent = await createTestComponent(
      <ReviewForm
        location={mock}
        history={history}
        staticContext={mock}
        scope={scope}
        event={declaration.event}
        registerForm={form}
        pageRoute={REVIEW_EVENT_PARENT_FORM_PAGE}
        match={{
          params: {
            declarationId: declaration.id,
            pageId: 'review',
            event: declaration.event.toLowerCase()
          },
          isExact: true,
          path: '',
          url: ''
        }}
        declarationId={declaration.id}
      />,
      { store, history }
    )
    testComponent.find('#exit-btn').hostNodes().simulate('click')
    testComponent.update()
    expect(window.location.href).toContain(WORKQUEUE_TABS.readyForReview)
  })

  it('redirect to update tab when exit button is clicked', async () => {
    const declaration = createReviewDeclaration(
      uuid(),
      birthDraftData,
      Event.Birth,
      'REJECTED'
    )
    store.dispatch(
      getStorageDeclarationsSuccess(
        JSON.stringify({
          userID: 'currentUser', // mock
          drafts: [declaration],
          declarations: []
        })
      )
    )
    store.dispatch(storeDeclaration(declaration))

    const testComponent = await createTestComponent(
      <ReviewForm
        location={mock}
        history={history}
        staticContext={mock}
        scope={scope}
        event={declaration.event}
        registerForm={form}
        pageRoute={REVIEW_EVENT_PARENT_FORM_PAGE}
        match={{
          params: {
            declarationId: declaration.id,
            pageId: 'review',
            event: declaration.event.toLowerCase()
          },
          isExact: true,
          path: '',
          url: ''
        }}
        declarationId={declaration.id}
      />,
      { store, history }
    )
    testComponent.find('#exit-btn').hostNodes().simulate('click')
    testComponent.update()
    expect(window.location.href).toContain(WORKQUEUE_TABS.requiresUpdate)
  })

  it('redirect to progress tab when exit button is clicked', async () => {
    const declaration = createReviewDeclaration(
      uuid(),
      birthDraftData,
      Event.Birth
    )
    store.dispatch(
      getStorageDeclarationsSuccess(
        JSON.stringify({
          userID: 'currentUser', // mock
          drafts: [declaration],
          declarations: []
        })
      )
    )
    store.dispatch(storeDeclaration(declaration))

    const testComponent = await createTestComponent(
      <ReviewForm
        location={mock}
        history={history}
        staticContext={mock}
        scope={scope}
        event={declaration.event}
        registerForm={form}
        pageRoute={REVIEW_EVENT_PARENT_FORM_PAGE}
        match={{
          params: {
            declarationId: declaration.id,
            pageId: 'review',
            event: declaration.event.toLowerCase()
          },
          isExact: true,
          path: '',
          url: ''
        }}
        declarationId={declaration.id}
      />,
      { store, history }
    )
    testComponent.find('#exit-btn').hostNodes().simulate('click')
    testComponent.update()
    expect(window.location.href).toContain('/progress')
  })

  it('it checked if review form is already in store and avoid loading from backend', async () => {
    const declaration = createReviewDeclaration(
      uuid(),
      birthDraftData,
      Event.Birth
    )
    store.dispatch(
      getStorageDeclarationsSuccess(
        JSON.stringify({
          userID: 'currentUser', // mock
          drafts: [declaration],
          declarations: []
        })
      )
    )
    store.dispatch(storeDeclaration(declaration))
    const testComponent = await createTestComponent(
      <ReviewForm
        location={mock}
        history={history}
        staticContext={mock}
        scope={scope}
        event={declaration.event}
        registerForm={form}
        pageRoute={REVIEW_EVENT_PARENT_FORM_PAGE}
        match={{
          params: {
            declarationId: declaration.id,
            pageId: 'review',
            event: declaration.event.toLowerCase()
          },
          isExact: true,
          path: '',
          url: ''
        }}
        declarationId={declaration.id}
      />,
      { store, history }
    )

    testComponent.update()
    const data = testComponent
      .find(RegisterForm)
      .prop('declaration') as IDeclaration

    expect(data.data).toEqual(birthDraftData)
  })

  describe('Death review flow', () => {
    it('it returns death registration', async () => {
      store.dispatch(storeDeclaration(deathDeclaration))
      const testComponent = await createTestComponent(
        <ReviewForm
          location={mock}
          history={history}
          scope={scope}
          staticContext={mock}
          event={deathDeclaration.event}
          registerForm={getReviewFormFromStore(store, Event.Death)}
          pageRoute={REVIEW_EVENT_PARENT_FORM_PAGE}
          match={{
            params: {
              declarationId: deathDeclaration.id,
              pageId: 'review',
              event: deathDeclaration.event.toLowerCase()
            },
            isExact: true,
            path: '',
            url: ''
          }}
          declarationId={deathDeclaration.id}
        />,
        { store, history }
      )

      testComponent.update()
      const data = testComponent
        .find(RegisterForm)
        .prop('declaration') as IDeclaration

      expect(data.data.deceased).toEqual(
        expect.objectContaining({
          iDType: 'NATIONAL_ID',
          iD: '1230000000000',
          firstNames: 'মকবুল',
          familyName: 'ইসলাম',
          firstNamesEng: 'Mokbul',
          familyNameEng: 'Islam',
          nationality: 'BGD',
          gender: 'male',
          maritalStatus: 'MARRIED',
          birthDate: '1987-02-16'
        })
      )
    })
    it('populates proper death event section', async () => {
      store.dispatch(storeDeclaration(deathDeclaration))
      const form = await getReviewFormFromStore(store, Event.Death)
      const testComponent = await createTestComponent(
        <ReviewForm
          location={mock}
          history={history}
          scope={scope}
          staticContext={mock}
          event={deathDeclaration.event}
          registerForm={form}
          pageRoute={REVIEW_EVENT_PARENT_FORM_PAGE}
          match={{
            params: {
              declarationId: deathDeclaration.id,
              pageId: 'review',
              event: deathDeclaration.event.toLowerCase()
            },
            isExact: true,
            path: '',
            url: ''
          }}
          declarationId={deathDeclaration.id}
        />,
        { store, history }
      )

      testComponent.update()
      const data = testComponent
        .find(RegisterForm)
        .prop('declaration') as IDeclaration

      expect(data.data.deathEvent).toEqual(
        expect.objectContaining({
          deathDate: '1987-02-16',
          manner: 'ACCIDENT',
          placeOfDeath: 'OTHER',
          deathLocation: ''
        })
      )
    })
  })
  describe('ReviewForm tests for register scope', () => {
    beforeEach(async () => {
      getItem.mockReturnValue(declareScope)
      store.dispatch(checkAuth())
    })

    it('shows error message for user with declare scope', async () => {
      store.dispatch(storeDeclaration(birthDeclaration))
      const testComponent = await createTestComponent(
        <ReviewForm
          location={mock}
          history={history}
          staticContext={mock}
          scope={scope}
          event={birthDeclaration.event}
          registerForm={form}
          pageRoute={REVIEW_EVENT_PARENT_FORM_PAGE}
          match={{
            params: {
              draftId: birthDeclaration.id,
              pageId: 'review',
              event: birthDeclaration.event.toLowerCase()
            },
            isExact: true,
            path: '',
            url: ''
          }}
          declarationId={birthDeclaration.id}
        />,
        { store, history }
      )
      testComponent.update()

      expect(
        testComponent
          .find('#review-unauthorized-error-text')
          .children()
          .hostNodes()
          .text()
      ).toBe('We are unable to display this page to you')
    })
  })
})

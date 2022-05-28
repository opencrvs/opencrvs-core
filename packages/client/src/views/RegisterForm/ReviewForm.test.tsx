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
  createReviewDeclaration,
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
  createTestStore
} from '@client/tests/util'
import { GET_BIRTH_REGISTRATION_FOR_REVIEW } from '@client/views/DataProvider/birth/queries'
import { GET_DEATH_REGISTRATION_FOR_REVIEW } from '@client/views/DataProvider/death/queries'
import { v4 as uuid } from 'uuid'
import { ReviewForm } from '@client/views/RegisterForm/ReviewForm'
import { History } from 'history'
import { waitForElement } from '@client/tests/wait-for-element'
import { WORKQUEUE_TABS } from '@client/components/interface/Navigation'
import { birthDraftData } from '@client/tests/mock-drafts'
import {
  birthDeclarationForReview,
  deathDeclarationForReview
} from '@client/tests/mock-graphql-responses'

const declareScope =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJpYXQiOjE1MzMxOTUyMjgsImV4cCI6MTU0MzE5NTIyNywiYXVkIjpbImdhdGV3YXkiXSwic3ViIjoiMSJ9.G4KzkaIsW8fTkkF-O8DI0qESKeBI332UFlTXRis3vJ6daisu06W5cZsgYhmxhx_n0Q27cBYt2OSOnjgR72KGA5IAAfMbAJifCul8ib57R4VJN8I90RWqtvA0qGjV-sPndnQdmXzCJx-RTumzvr_vKPgNDmHzLFNYpQxcmQHA-N8li-QHMTzBHU4s9y8_5JOCkudeoTMOd_1021EDAQbrhonji5V1EOSY2woV5nMHhmq166I1L0K_29ngmCqQZYi1t6QBonsIowlXJvKmjOH5vXHdCCJIFnmwHmII4BK-ivcXeiVOEM_ibfxMWkAeTRHDshOiErBFeEvqd6VWzKvbKAH0UY-Rvnbh4FbprmO4u4_6Yd2y2HnbweSo-v76dVNcvUS0GFLFdVBt0xTay-mIeDy8CKyzNDOWhmNUvtVi9mhbXYfzzEkwvi9cWwT1M8ZrsWsvsqqQbkRCyBmey_ysvVb5akuabenpPsTAjiR8-XU2mdceTKqJTwbMU5gz-8fgulbTB_9TNJXqQlH7tyYXMWHUY3uiVHWg2xgjRiGaXGTiDgZd01smYsxhVnPAddQOhqZYCrAgVcT1GBFVvhO7CC-rhtNlLl21YThNNZNpJHsCgg31WA9gMQ_2qAJmw2135fAyylO8q7ozRUvx46EezZiPzhCkPMeELzLhQMEIqjo'

const registerScopeToken =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWdpc3RlciIsImNlcnRpZnkiLCJkZW1vIl0sImlhdCI6MTU0MjY4ODc3MCwiZXhwIjoxNTQzMjkzNTcwLCJhdWQiOlsib3BlbmNydnM6YXV0aC11c2VyIiwib3BlbmNydnM6dXNlci1tZ250LXVzZXIiLCJvcGVuY3J2czpoZWFydGgtdXNlciIsIm9wZW5jcnZzOmdhdGV3YXktdXNlciIsIm9wZW5jcnZzOm5vdGlmaWNhdGlvbi11c2VyIiwib3BlbmNydnM6d29ya2Zsb3ctdXNlciJdLCJpc3MiOiJvcGVuY3J2czphdXRoLXNlcnZpY2UiLCJzdWIiOiI1YmVhYWY2MDg0ZmRjNDc5MTA3ZjI5OGMifQ.ElQd99Lu7WFX3L_0RecU_Q7-WZClztdNpepo7deNHqzro-Cog4WLN7RW3ZS5PuQtMaiOq1tCb-Fm3h7t4l4KDJgvC11OyT7jD6R2s2OleoRVm3Mcw5LPYuUVHt64lR_moex0x_bCqS72iZmjrjS-fNlnWK5zHfYAjF2PWKceMTGk6wnI9N49f6VwwkinJcwJi6ylsjVkylNbutQZO0qTc7HRP-cBfAzNcKD37FqTRNpVSvHdzQSNcs7oiv3kInDN5aNa2536XSd3H-RiKR9hm9eID9bSIJgFIGzkWRd5jnoYxT70G0t03_mTVnDnqPXDtyI-lmerx24Ost0rQLUNIg'
const getItem = window.localStorage.getItem as jest.Mock

const mockFetchUserDetails = jest.fn()
mockFetchUserDetails.mockReturnValue(mockUserResponseWithName)
queries.fetchUserDetails = mockFetchUserDetails
describe('ReviewForm tests', () => {
  const scope = ['register']
  const mock: any = jest.fn()
  let form: IForm
  let store: AppStore
  let history: History

  beforeEach(async () => {
    const testStore = await createTestStore()
    store = testStore.store
    history = testStore.history

    form = await getReviewFormFromStore(store, Event.Birth)
    getItem.mockReturnValue(registerScopeToken)
    await store.dispatch(checkAuth())
  })

  it('it returns error while fetching', async () => {
    const declaration = createReviewDeclaration(uuid(), {}, Event.Birth)
    const graphqlMock = [
      {
        request: {
          query: GET_BIRTH_REGISTRATION_FOR_REVIEW
        },
        error: new Error('boom')
      }
    ]

    const testComponent = await createTestComponent(
      <ReviewForm
        location={mock}
        history={history}
        staticContext={mock}
        registerForm={form}
        scope={scope}
        event={declaration.event}
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
      { store, history, graphqlMocks: graphqlMock }
    )
    // wait for mocked data to load mockedProvider
    await new Promise((resolve) => {
      setTimeout(resolve, 0)
    })

    testComponent.update()

    expect(
      testComponent.find('#review-error-text').children().hostNodes().text()
    ).toBe('An error occurred while fetching birth registration')
  })
  it('it returns birth registration', async () => {
    const declaration = createReviewDeclaration(uuid(), {}, Event.Birth)
    const graphqlMock = [
      {
        request: {
          query: GET_BIRTH_REGISTRATION_FOR_REVIEW,
          variables: { id: declaration.id }
        },
        result: {
          data: {
            fetchBirthRegistration: birthDeclarationForReview
          }
        }
      }
    ]
    const testComponent = await createTestComponent(
      <ReviewForm
        location={mock}
        history={history}
        scope={scope}
        staticContext={mock}
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
      { store, history, graphqlMocks: graphqlMock }
    )
    // wait for mocked data to load mockedProvider
    await new Promise((resolve) => {
      setTimeout(resolve, 0)
    })

    testComponent.update()
    const data = testComponent
      .find(RegisterForm)
      .prop('declaration') as IDeclaration
    expect(data.data.child).toEqual({
      _fhirID: 'ba9ae6be-3b1a-4234-a813-600d43407334',
      addressLine2UrbanOption: 'Birth street',
      addressLine3UrbanOption: 'Birth residential area',
      addressLine5: '',
      attendantAtBirth: 'PHYSICIAN',
      birthLocation: '98bd3c74-a684-47bb-be30-68fda5cfd7ca',
      birthType: 'SINGLE',
      childBirthDate: '2022-02-02',
      cityUrbanOption: 'Birth Town',
      country: 'FAR',
      familyNameEng: 'Styles',
      firstNamesEng: 'Harry',
      gender: 'male',
      internationalAddressLine1: undefined,
      internationalAddressLine2: undefined,
      internationalAddressLine3: undefined,
      internationalCity: 'Birth Town',
      internationalDistrict: '852b103f-2fe0-4871-a323-51e51c6d9198',
      internationalPostcode: 'SW1',
      internationalState: 'bac22b09-1260-4a59-a5b9-c56c43ae889c',
      numberUrbanOption: 'Flat 10',
      placeOfBirth: 'PRIVATE_HOME',
      postalCode: 'SW1',
      ruralOrUrban: 'URBAN',
      weightAtBirth: 5
    })
  })
  it('Shared contact phone number should be set properly', async () => {
    const declaration = createReviewDeclaration(uuid(), {}, Event.Birth)
    const graphqlMock = [
      {
        request: {
          query: GET_BIRTH_REGISTRATION_FOR_REVIEW,
          variables: { id: declaration.id }
        },
        result: {
          data: {
            fetchBirthRegistration: birthDeclarationForReview
          }
        }
      }
    ]
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
      { store, history, graphqlMocks: graphqlMock }
    )
    // wait for mocked data to load mockedProvider
    await new Promise((resolve) => {
      setTimeout(resolve, 0)
    })
    testComponent.update()

    const data = testComponent
      .find(RegisterForm)
      .prop('declaration') as IDeclaration
    expect(
      (
        (data.data.registration.contactPoint as IFormSectionData)
          .nestedFields as IFormSectionData
      ).registrationPhone
    ).toBe('+260787878787')
  })
  it('when registration has attachment', async () => {
    const declaration = createReviewDeclaration(uuid(), {}, Event.Birth)
    const graphqlMock = [
      {
        request: {
          query: GET_BIRTH_REGISTRATION_FOR_REVIEW,
          variables: { id: declaration.id }
        },
        result: {
          data: {
            fetchBirthRegistration: birthDeclarationForReview
          }
        }
      }
    ]
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
      { store, history, graphqlMocks: graphqlMock }
    )
    // wait for mocked data to load mockedProvider
    await new Promise((resolve) => {
      setTimeout(resolve, 0)
    })

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
    const declaration = createReviewDeclaration(uuid(), {}, Event.Birth)
    const graphqlMock = [
      {
        request: {
          query: GET_BIRTH_REGISTRATION_FOR_REVIEW,
          variables: { id: declaration.id }
        },
        result: {
          data: {
            fetchBirthRegistration: birthDeclarationForReview
          }
        }
      }
    ]
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
      { store, history, graphqlMocks: graphqlMock }
    )
    // wait for mocked data to load mockedProvider
    await new Promise((resolve) => {
      setTimeout(resolve, 0)
    })

    testComponent.update()

    const data = testComponent
      .find(RegisterForm)
      .prop('declaration') as IDeclaration
    expect(data.data.registration).toEqual({
      _fhirID: 'a7b81b67-abce-4c60-9e41-469a0b9c85b3',
      commentsOrNotes: '',
      contactPoint: {
        nestedFields: {
          registrationPhone: '+260787878787'
        },
        value: 'MOTHER'
      },
      informantType: {
        nestedFields: {
          otherInformantType: null
        },
        value: 'MOTHER'
      },
      trackingId: 'B8OKPC3',
      type: 'birth'
    })
  })
  it('redirect to home when exit button is clicked', async () => {
    const declaration = createReviewDeclaration(
      uuid(),
      {},
      Event.Birth,
      'IN_PROGRESS'
    )
    declaration.data = birthDraftData
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
    const exitButton = await waitForElement(testComponent, '#save_draft')
    exitButton.hostNodes().simulate('click')
    testComponent.update()
    expect(window.location.href).toContain('/progress')
  })

  it('redirect to review tab when exit button is clicked', async () => {
    const declaration = createReviewDeclaration(
      uuid(),
      {},
      Event.Birth,
      'DECLARED'
    )
    declaration.data = birthDraftData
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
    const exitButton = await waitForElement(testComponent, '#save_draft')
    exitButton.hostNodes().simulate('click')
    testComponent.update()
    expect(window.location.href).toContain(WORKQUEUE_TABS.readyForReview)
  })

  it('redirect to review tab when exit button is clicked', async () => {
    const declaration = createReviewDeclaration(
      uuid(),
      {},
      Event.Birth,
      'VALIDATED'
    )
    declaration.data = birthDraftData
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
    const exitButton = await waitForElement(testComponent, '#save_draft')
    exitButton.hostNodes().simulate('click')
    testComponent.update()
    expect(window.location.href).toContain(WORKQUEUE_TABS.readyForReview)
  })

  it('redirect to update tab when exit button is clicked', async () => {
    const declaration = createReviewDeclaration(
      uuid(),
      {},
      Event.Birth,
      'REJECTED'
    )
    declaration.data = birthDraftData
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
    const exitButton = await waitForElement(testComponent, '#save_draft')
    exitButton.hostNodes().simulate('click')
    testComponent.update()
    expect(window.location.href).toContain(WORKQUEUE_TABS.requiresUpdate)
  })

  it('redirect to progress tab when exit button is clicked', async () => {
    const declaration = createReviewDeclaration(uuid(), {}, Event.Birth)
    declaration.data = birthDraftData
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
    const exitButton = await waitForElement(testComponent, '#save_draft')
    exitButton.hostNodes().simulate('click')
    testComponent.update()
    expect(window.location.href).toContain('/progress')
  })

  it('should redirect to progress tab when close declaration button is clicked', async () => {
    const declaration = createReviewDeclaration(uuid(), {}, Event.Birth)
    store.dispatch(storeDeclaration(declaration))
    const testComponent = await createTestComponent(
      <ReviewForm
        location={mock}
        history={history}
        scope={scope}
        staticContext={mock}
        event={declaration.event}
        registerForm={form}
        pageRoute={REVIEW_EVENT_PARENT_FORM_PAGE}
        match={{
          params: {
            declarationId: declaration.id,
            pageId: 'child',
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
    // wait for mocked data to load mockedProvider
    await new Promise((resolve) => {
      setTimeout(resolve, 0)
    })

    testComponent.update()

    const menuButton = await waitForElement(
      testComponent,
      '#eventToggleMenuToggleButton'
    )
    menuButton.hostNodes().simulate('click')
    testComponent.update()

    const closeDeclarationButton = await waitForElement(
      testComponent,
      '#eventToggleMenuItem0'
    )
    closeDeclarationButton.hostNodes().simulate('click')
    testComponent.update()

    expect(window.location.href).toContain('/progress')
  })

  it('it checked if review form is already in store and avoid loading from backend', async () => {
    const declaration = createReviewDeclaration(uuid(), {}, Event.Birth)
    declaration.data = birthDraftData
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
    // wait for mocked data to load mockedProvider
    await new Promise((resolve) => {
      setTimeout(resolve, 0)
    })

    testComponent.update()
    const data = testComponent
      .find(RegisterForm)
      .prop('declaration') as IDeclaration

    expect(data.data).toEqual(birthDraftData)
  })
  describe('Death review flow', () => {
    it('it returns death registration', async () => {
      const declaration = createReviewDeclaration(uuid(), {}, Event.Death)
      const graphqlMock = [
        {
          request: {
            query: GET_DEATH_REGISTRATION_FOR_REVIEW,
            variables: { id: declaration.id }
          },
          result: {
            data: {
              fetchDeathRegistration: deathDeclarationForReview
            }
          }
        }
      ]
      const testComponent = await createTestComponent(
        <ReviewForm
          location={mock}
          history={history}
          scope={scope}
          staticContext={mock}
          event={declaration.event}
          registerForm={getReviewFormFromStore(store, Event.Death)}
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
        { store, history, graphqlMocks: graphqlMock }
      )
      // wait for mocked data to load mockedProvider
      await new Promise((resolve) => {
        setTimeout(resolve, 0)
      })

      testComponent.update()
      const data = testComponent
        .find(RegisterForm)
        .prop('declaration') as IDeclaration

      expect(data.data.deceased).toEqual({
        _fhirID: '1',
        addressLine2UrbanOptionPrimary: 'Deceased street',
        addressLine3UrbanOptionPrimary: 'Deceased area',
        addressLine5Primary: '',
        birthDate: '1990-02-02',
        cityUrbanOptionPrimary: "Deceased's town",
        countryPrimary: 'FAR',
        districtPrimary: '852b103f-2fe0-4871-a323-51e51c6d9198',
        familyNameEng: 'Kane',
        firstNamesEng: 'Harry',
        gender: 'male',
        iD: '987987987',
        internationalAddressLine1Primary: '',
        internationalAddressLine2Primary: '',
        internationalAddressLine3Primary: '',
        internationalCityPrimary: "Deceased's town",
        internationalDistrictPrimary: '852b103f-2fe0-4871-a323-51e51c6d9198',
        internationalPostcodePrimary: 'SW1',
        internationalStatePrimary: 'bac22b09-1260-4a59-a5b9-c56c43ae889c',
        maritalStatus: 'MARRIED',
        nationality: 'FAR',
        numberUrbanOptionPrimary: 'Flat 10',
        postcodePrimary: 'SW1',
        ruralOrUrbanPrimary: 'URBAN',
        statePrimary: 'bac22b09-1260-4a59-a5b9-c56c43ae889c'
      })
    })
    it('populates proper death event section', async () => {
      const declaration = createReviewDeclaration(uuid(), {}, Event.Death)
      const graphqlMock = [
        {
          request: {
            query: GET_DEATH_REGISTRATION_FOR_REVIEW,
            variables: { id: declaration.id }
          },
          result: {
            data: {
              fetchDeathRegistration: deathDeclarationForReview
            }
          }
        }
      ]
      const form = await getReviewFormFromStore(store, Event.Death)
      const testComponent = await createTestComponent(
        <ReviewForm
          location={mock}
          history={history}
          scope={scope}
          staticContext={mock}
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
        { store, history, graphqlMocks: graphqlMock }
      )
      // wait for mocked data to load mockedProvider
      await new Promise((resolve) => {
        setTimeout(resolve, 0)
      })

      testComponent.update()
      const data = testComponent
        .find(RegisterForm)
        .prop('declaration') as IDeclaration

      expect(data.data.deathEvent).toEqual({
        causeOfDeathEstablished: 'true',
        addressLine2UrbanOption: '',
        addressLine3UrbanOption: '',
        addressLine5: '',
        causeOfDeathMethod: 'VERBAL_AUTOPSY',
        deathDate: '2022-02-10',
        deathDescription: 'Verbal autopsy description',
        deathLocation: 'ec396045-3437-4224-8e03-f299e17158e5',
        internationalAddressLine1: undefined,
        internationalAddressLine2: undefined,
        internationalAddressLine3: undefined,
        manner: 'NATURAL_CAUSES',
        numberUrbanOption: '',
        placeOfDeath: 'DECEASED_USUAL_RESIDENCE',
        ruralOrUrban: ''
      })
    })
  })
  describe('ReviewForm tests for register scope', () => {
    beforeEach(async () => {
      getItem.mockReturnValue(declareScope)
      await store.dispatch(checkAuth())
    })

    it('shows error message for user with declare scope', async () => {
      const declaration = createReviewDeclaration(uuid(), {}, Event.Birth)
      const graphqlMock = [
        {
          request: {
            query: GET_BIRTH_REGISTRATION_FOR_REVIEW,
            variables: { id: declaration.id }
          },
          result: {
            data: {
              fetchBirthRegistration: birthDeclarationForReview
            }
          }
        }
      ]
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
              draftId: declaration.id,
              pageId: 'review',
              event: declaration.event.toLowerCase()
            },
            isExact: true,
            path: '',
            url: ''
          }}
          declarationId={declaration.id}
        />,
        { store, history, graphqlMocks: graphqlMock }
      )
      await new Promise((resolve) => {
        setTimeout(resolve, 0)
      })

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

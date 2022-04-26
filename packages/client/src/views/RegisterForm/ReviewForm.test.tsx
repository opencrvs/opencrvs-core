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
import { Event, IForm, IFormSectionData } from '@opencrvs/client/src/forms'

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
  mockOfflineData,
  createTestStore,
  graphQLPersonAddressMock,
  graphQLEventLocationAddressMock,
  primaryAddressData,
  primaryInternationalAddressLines,
  secondaryAddressData,
  secondaryInternationalAddressLines
} from '@client/tests/util'
import { GET_BIRTH_REGISTRATION_FOR_REVIEW } from '@client/views/DataProvider/birth/queries'
import { GET_DEATH_REGISTRATION_FOR_REVIEW } from '@client/views/DataProvider/death/queries'
import { v4 as uuid } from 'uuid'
import { ReviewForm } from '@client/views/RegisterForm/ReviewForm'
import { offlineDataReady } from '@client/offline/actions'
import { History } from 'history'
import { waitForElement } from '@client/tests/wait-for-element'

import { formConfig } from '@client/tests/mock-offline-data'

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

    await store.dispatch(
      offlineDataReady({
        languages: mockOfflineData.languages,
        forms: mockOfflineData.forms,
        templates: mockOfflineData.templates,
        locations: mockOfflineData.locations,
        facilities: mockOfflineData.facilities,
        pilotLocations: mockOfflineData.pilotLocations,
        offices: mockOfflineData.offices,
        assets: mockOfflineData.assets,
        config: mockOfflineData.config,
        formConfig
      })
    )

    form = await getReviewFormFromStore(store, Event.BIRTH)
    getItem.mockReturnValue(registerScopeToken)
    await store.dispatch(checkAuth({ '?token': registerScopeToken }))
  })

  it('it returns error while fetching', async () => {
    const declaration = createReviewDeclaration(uuid(), {}, Event.BIRTH)
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
    const declaration = createReviewDeclaration(uuid(), {}, Event.BIRTH)
    const graphqlMock = [
      {
        request: {
          query: GET_BIRTH_REGISTRATION_FOR_REVIEW,
          variables: { id: declaration.id }
        },
        result: {
          data: {
            fetchBirthRegistration: {
              id: '9a55d213-ad9f-4dcd-9418-340f3a7f6269',
              _fhirIDMap: {
                composition: '9a55d213-ad9f-4dcd-9418-340f3a7f6269',
                encounter: 'dba420af-3d3a-46e3-817d-2fa5c37b7439',
                observation: {
                  birthType: '16643bcf-457a-4a5b-a7d2-328d57182476',
                  weightAtBirth: '13a75fdf-54d3-476e-ab0e-68fca7286686',
                  attendantAtBirth: 'add45cfa-8390-4792-a857-a1df587e45a6',
                  informantType: 'd43f9c01-bd4f-4df6-b38f-91f7a978a232'
                }
              },
              child: {
                id: '16025284-bae2-4b37-ae80-e16745b7a6b9',
                name: [
                  {
                    use: 'bn',
                    firstNames: '',
                    familyName: 'আকাশ'
                  },
                  {
                    use: 'en',
                    firstNames: '',
                    familyName: 'Akash'
                  }
                ],
                multipleBirth: 1,
                birthDate: '2001-01-01',
                gender: 'male'
              },
              informant: null,
              primaryCaregiver: null,
              mother: {
                name: [
                  {
                    use: 'bn',
                    firstNames: '',
                    familyName: 'ময়না'
                  },
                  {
                    use: 'en',
                    firstNames: '',
                    familyName: 'Moyna'
                  }
                ],
                birthDate: '2001-01-01',
                maritalStatus: 'MARRIED',
                occupation: 'Mother Occupation',
                dateOfMarriage: '2001-01-01',
                educationalAttainment: 'PRIMARY_ISCED_1',
                nationality: ['BGD'],
                identifier: [{ id: '1233', type: 'PASSPORT', otherType: '' }],
                address: graphQLPersonAddressMock,
                telecom: [
                  {
                    system: 'phone',
                    value: '01711111111'
                  },
                  {
                    system: 'email',
                    value: 'moyna@ocrvs.com'
                  }
                ],
                id: '20e9a8d0-907b-4fbd-a318-ec46662bf608'
              },
              father: null,
              registration: {
                id: 'c8dbe751-5916-4e2a-ba95-1733ccf699b6',
                informantType: 'MOTHER',
                contact: 'MOTHER',
                contactRelationship: 'Contact Relation',
                contactPhoneNumber: '01733333333',
                attachments: null,
                status: null,
                trackingId: 'B123456',
                registrationNumber: null,
                type: 'BIRTH'
              },
              attendantAtBirth: 'NURSE',
              weightAtBirth: 2,
              birthType: 'SINGLE',
              eventLocation: {
                address: {
                  country: 'FAR',
                  state: 'state4',
                  city: '',
                  district: 'district2',
                  postalCode: '',
                  line: ['Rd #10', '', 'Akua', 'union1', '', 'upazila10'],
                  postCode: '1020'
                },
                type: 'PRIVATE_HOME',
                partOf: 'Location/upazila10'
              }
            }
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
      _fhirID: '16025284-bae2-4b37-ae80-e16745b7a6b9',
      attendantAtBirth: 'NURSE',
      childBirthDate: '2001-01-01',
      familyName: 'আকাশ',
      familyNameEng: 'Akash',
      gender: 'male',
      placeOfBirth: 'PRIVATE_HOME',
      country: 'FAR',
      addressLine5: '',
      numberUrbanOption: 'Rd #10',
      addressLine2UrbanOption: '',
      addressLine3UrbanOption: 'Akua',
      internationalAddressLine1: undefined,
      internationalAddressLine2: undefined,
      internationalAddressLine3: undefined,
      internationalDistrict: 'district2',
      internationalState: 'state4',
      ruralOrUrban: 'upazila10',
      multipleBirth: 1,
      birthType: 'SINGLE',
      weightAtBirth: 2
    })
  })
  it('Shared contact phone number should be set properly', async () => {
    const declaration = createReviewDeclaration(uuid(), {}, Event.BIRTH)
    const graphqlMock = [
      {
        request: {
          query: GET_BIRTH_REGISTRATION_FOR_REVIEW,
          variables: { id: declaration.id }
        },
        result: {
          data: {
            fetchBirthRegistration: {
              id: '9a55d213-ad9f-4dcd-9418-340f3a7f6269',
              _fhirIDMap: {
                composition: '9a55d213-ad9f-4dcd-9418-340f3a7f6269',
                encounter: 'dba420af-3d3a-46e3-817d-2fa5c37b7439',
                observation: {
                  birthType: '16643bcf-457a-4a5b-a7d2-328d57182476',
                  weightAtBirth: '13a75fdf-54d3-476e-ab0e-68fca7286686',
                  attendantAtBirth: 'add45cfa-8390-4792-a857-a1df587e45a6',
                  informantType: 'd43f9c01-bd4f-4df6-b38f-91f7a978a232'
                }
              },
              child: null,
              mother: null,
              informant: null,
              primaryCaregiver: null,
              father: {
                name: [
                  {
                    use: 'bn',
                    firstNames: '',
                    familyName: 'আজমল'
                  },
                  {
                    use: 'en',
                    firstNames: '',
                    familyName: 'Azmol'
                  }
                ],
                birthDate: '2001-01-01',
                maritalStatus: 'MARRIED',
                occupation: 'Father Occupation',
                dateOfMarriage: '2001-01-01',
                educationalAttainment: 'PRIMARY_ISCED_1',
                nationality: ['BGD'],
                identifier: [{ id: '1233', type: 'PASSPORT', otherType: '' }],
                address: graphQLPersonAddressMock,
                telecom: [
                  {
                    system: 'phone',
                    value: '01711111111'
                  }
                ],
                id: '526362a1-aa8e-4848-af35-41524f9e7e85'
              },
              registration: {
                id: 'c8dbe751-5916-4e2a-ba95-1733ccf699b6',
                informantType: 'MOTHER',
                contact: 'FATHER',
                contactRelationship: 'Contact Relation',
                contactPhoneNumber: '01733333333',
                attachments: null,
                status: null,
                trackingId: 'B123456',
                registrationNumber: null,
                type: 'BIRTH'
              },
              attendantAtBirth: 'NURSE',
              weightAtBirth: 2,
              birthType: 'SINGLE',
              eventLocation: graphQLEventLocationAddressMock,
              presentAtBirthRegistration: 'MOTHER_ONLY'
            }
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
    ).toBe('01733333333')
  })
  it('when registration has attachment', async () => {
    const declaration = createReviewDeclaration(uuid(), {}, Event.BIRTH)
    const graphqlMock = [
      {
        request: {
          query: GET_BIRTH_REGISTRATION_FOR_REVIEW,
          variables: { id: declaration.id }
        },
        result: {
          data: {
            fetchBirthRegistration: {
              id: '9a55d213-ad9f-4dcd-9418-340f3a7f6269',
              _fhirIDMap: {
                composition: '9a55d213-ad9f-4dcd-9418-340f3a7f6269',
                encounter: 'dba420af-3d3a-46e3-817d-2fa5c37b7439',
                observation: {
                  birthType: '16643bcf-457a-4a5b-a7d2-328d57182476',
                  weightAtBirth: '13a75fdf-54d3-476e-ab0e-68fca7286686',
                  attendantAtBirth: 'add45cfa-8390-4792-a857-a1df587e45a6',
                  informantType: 'd43f9c01-bd4f-4df6-b38f-91f7a978a232'
                }
              },
              child: null,
              mother: null,
              father: null,
              informant: null,
              primaryCaregiver: null,
              registration: {
                id: 'c8dbe751-5916-4e2a-ba95-1733ccf699b6',
                informantType: 'MOTHER',
                contact: 'MOTHER',
                contactRelationship: 'Contact Relation',
                contactPhoneNumber: '01733333333',
                attachments: [
                  {
                    contentType: 'image/jpeg',
                    subject: 'MOTHER',
                    type: 'BIRTH_REGISTRATION',
                    data: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQECWAJYAAD'
                  }
                ],
                status: null,
                trackingId: 'B123456',
                registrationNumber: null,
                type: 'BIRTH'
              },
              attendantAtBirth: 'NURSE',
              weightAtBirth: 2,
              birthType: 'SINGLE',
              eventLocation: graphQLEventLocationAddressMock,
              presentAtBirthRegistration: 'MOTHER_ONLY'
            }
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
        optionValues: ['MOTHER', 'Birth Registration'],
        type: 'image/jpeg',
        title: 'MOTHER',
        description: 'Birth Registration',
        data: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQECWAJYAAD'
      }
    ])
  })
  it('check registration', async () => {
    const declaration = createReviewDeclaration(uuid(), {}, Event.BIRTH)
    const graphqlMock = [
      {
        request: {
          query: GET_BIRTH_REGISTRATION_FOR_REVIEW,
          variables: { id: declaration.id }
        },
        result: {
          data: {
            fetchBirthRegistration: {
              id: '9a55d213-ad9f-4dcd-9418-340f3a7f6269',
              _fhirIDMap: {
                composition: '9a55d213-ad9f-4dcd-9418-340f3a7f6269',
                encounter: 'dba420af-3d3a-46e3-817d-2fa5c37b7439',
                observation: {
                  birthType: '16643bcf-457a-4a5b-a7d2-328d57182476',
                  weightAtBirth: '13a75fdf-54d3-476e-ab0e-68fca7286686',
                  attendantAtBirth: 'add45cfa-8390-4792-a857-a1df587e45a6',
                  informantType: 'd43f9c01-bd4f-4df6-b38f-91f7a978a232'
                }
              },
              child: null,
              informant: null,
              primaryCaregiver: null,
              mother: {
                name: [
                  {
                    use: 'bn',
                    firstNames: '',
                    familyName: 'ময়না'
                  },
                  {
                    use: 'en',
                    firstNames: '',
                    familyName: 'Moyna'
                  }
                ],
                birthDate: '2001-01-01',
                maritalStatus: 'MARRIED',
                occupation: 'Mother Occupation',
                dateOfMarriage: '2001-01-01',
                educationalAttainment: 'PRIMARY_ISCED_1',
                nationality: ['BGD'],
                identifier: [{ id: '1233', type: 'PASSPORT', otherType: '' }],
                multipleBirth: 1,
                address: graphQLPersonAddressMock,
                telecom: [
                  {
                    system: 'phone',
                    value: '01711111111'
                  }
                ],
                id: '20e9a8d0-907b-4fbd-a318-ec46662bf608'
              },
              father: null,
              registration: {
                id: 'c8dbe751-5916-4e2a-ba95-1733ccf699b6',
                informantType: 'MOTHER',
                contact: 'MOTHER',
                contactRelationship: 'Contact Relation',
                contactPhoneNumber: '01733333333',
                attachments: null,
                status: [
                  {
                    comments: [
                      {
                        comment: 'This is a note'
                      }
                    ],
                    type: 'DECLARED',
                    timestamp: null
                  }
                ],
                trackingId: 'B123456',
                registrationNumber: null,
                type: 'BIRTH'
              },
              attendantAtBirth: 'NURSE',
              weightAtBirth: 2,
              birthType: 'SINGLE',
              eventLocation: graphQLEventLocationAddressMock,
              presentAtBirthRegistration: 'MOTHER_ONLY'
            }
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
      informant: {
        nestedFields: {}
      },
      informantType: 'MOTHER',
      commentsOrNotes: 'This is a note',
      contactPoint: {
        value: 'MOTHER',
        nestedFields: {
          contactRelationshipOther: 'Contact Relation',
          registrationPhone: '01733333333'
        }
      },
      _fhirID: 'c8dbe751-5916-4e2a-ba95-1733ccf699b6',
      trackingId: 'B123456',
      type: 'birth'
    })
  })
  it('redirect to home when exit button is clicked', async () => {
    const declaration = createReviewDeclaration(
      uuid(),
      {},
      Event.BIRTH,
      'IN_PROGRESS'
    )
    declaration.data = {
      child: {
        attendantAtBirth: 'NURSE',
        childBirthDate: '2001-01-01',
        familyName: 'আকাশ',
        familyNameEng: 'Akash',
        firstNames: '',
        firstNamesEng: '',
        gender: 'male',
        birthType: 'SINGLE',
        weightAtBirth: '2'
      },
      registration: {
        informantType: 'MOTHER',
        registrationPhone: '01741234567',
        whoseContactDetails: 'MOTHER',
        type: 'BIRTH'
      }
    }
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
      Event.BIRTH,
      'DECLARED'
    )
    declaration.data = {
      child: {
        attendantAtBirth: 'NURSE',
        childBirthDate: '2001-01-01',
        familyName: 'আকাশ',
        familyNameEng: 'Akash',
        firstNames: '',
        firstNamesEng: '',
        gender: 'male',
        birthType: 'SINGLE',
        weightAtBirth: '2'
      },
      registration: {
        informantType: 'MOTHER',
        registrationPhone: '01741234567',
        whoseContactDetails: 'MOTHER',
        type: 'BIRTH'
      }
    }
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
    expect(window.location.href).toContain('/review')
  })

  it('redirect to review tab when exit button is clicked', async () => {
    const declaration = createReviewDeclaration(
      uuid(),
      {},
      Event.BIRTH,
      'VALIDATED'
    )
    declaration.data = {
      child: {
        attendantAtBirth: 'NURSE',
        childBirthDate: '2001-01-01',
        familyName: 'আকাশ',
        familyNameEng: 'Akash',
        firstNames: '',
        firstNamesEng: '',
        gender: 'male',
        birthType: 'SINGLE',
        weightAtBirth: '2'
      },
      registration: {
        informantType: 'MOTHER',
        registrationPhone: '01741234567',
        whoseContactDetails: 'MOTHER',
        type: 'BIRTH'
      }
    }
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
    expect(window.location.href).toContain('/review')
  })

  it('redirect to update tab when exit button is clicked', async () => {
    const declaration = createReviewDeclaration(
      uuid(),
      {},
      Event.BIRTH,
      'REJECTED'
    )
    declaration.data = {
      child: {
        attendantAtBirth: 'NURSE',
        childBirthDate: '2001-01-01',
        familyName: 'আকাশ',
        familyNameEng: 'Akash',
        firstNames: '',
        firstNamesEng: '',
        gender: 'male',
        birthType: 'SINGLE',
        weightAtBirth: '2'
      },
      registration: {
        informantType: 'MOTHER',
        registrationPhone: '01741234567',
        whoseContactDetails: 'MOTHER',
        type: 'BIRTH'
      }
    }
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
    expect(window.location.href).toContain('/updates')
  })

  it('redirect to progress tab when exit button is clicked', async () => {
    const declaration = createReviewDeclaration(uuid(), {}, Event.BIRTH)
    declaration.data = {
      child: {
        attendantAtBirth: 'NURSE',
        childBirthDate: '2001-01-01',
        familyName: 'আকাশ',
        familyNameEng: 'Akash',
        firstNames: '',
        firstNamesEng: '',
        gender: 'male',
        birthType: 'SINGLE',
        weightAtBirth: '2'
      },
      registration: {
        informantType: 'MOTHER',
        registrationPhone: '01741234567',
        whoseContactDetails: 'MOTHER',
        type: 'BIRTH'
      }
    }
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
    const declaration = createReviewDeclaration(uuid(), {}, Event.BIRTH)
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
    const declaration = createReviewDeclaration(uuid(), {}, Event.BIRTH)
    declaration.data = {
      child: {
        attendantAtBirth: 'NURSE',
        childBirthDate: '2001-01-01',
        familyName: 'আকাশ',
        familyNameEng: 'Akash',
        firstNames: '',
        firstNamesEng: '',
        gender: 'male',
        birthType: 'SINGLE',
        weightAtBirth: '2'
      },
      registration: {
        informantType: 'MOTHER',
        registrationPhone: '01741234567',
        whoseContactDetails: 'MOTHER',
        type: 'BIRTH'
      }
    }
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

    expect(data.data).toEqual({
      child: {
        attendantAtBirth: 'NURSE',
        childBirthDate: '2001-01-01',
        familyName: 'আকাশ',
        familyNameEng: 'Akash',
        firstNames: '',
        firstNamesEng: '',
        gender: 'male',
        birthType: 'SINGLE',
        weightAtBirth: '2'
      },
      registration: {
        informantType: 'MOTHER',
        registrationPhone: '01741234567',
        whoseContactDetails: 'MOTHER',
        type: 'BIRTH'
      }
    })
  })
  describe('Death review flow', () => {
    it('it returns death registration', async () => {
      const declaration = createReviewDeclaration(uuid(), {}, Event.DEATH)
      const graphqlMock = [
        {
          request: {
            query: GET_DEATH_REGISTRATION_FOR_REVIEW,
            variables: { id: declaration.id }
          },
          result: {
            data: {
              fetchDeathRegistration: {
                _fhirIDMap: {
                  composition: '3f94a554-69d8-4a71-80b5-ac4ba07e10bb',
                  encounter: 'aa3ca6f2-255c-4dd9-a33b-24304392a92d',
                  eventLocation: 'd3225149-d28a-4cc6-be41-4ba89d165ad3',
                  observation: {
                    mannerOfDeath: '3f26d040-6cb9-4c11-9829-3253d4c39f35'
                  }
                },
                id: '3f94a554-69d8-4a71-80b5-ac4ba07e10bb',
                deceased: {
                  id: 'e34c0bb4-bdc8-4333-976d-4d7a4a3b6d9a',
                  name: [
                    {
                      use: 'en',
                      firstNames: 'aegrst',
                      familyName: 'seths',
                      __typename: 'HumanName'
                    }
                  ],
                  birthDate: '1990-03-20',
                  age: null,
                  gender: 'female',
                  maritalStatus: 'MARRIED',
                  nationality: ['FAR'],
                  identifier: [
                    {
                      id: '321951357',
                      type: 'NATIONAL_ID',
                      otherType: null,
                      __typename: 'IdentityType'
                    },
                    {
                      id: 'sgtsr',
                      type: 'SOCIAL_SECURITY_NO',
                      otherType: null,
                      __typename: 'IdentityType'
                    },
                    {
                      id: '2022DBVWELM',
                      type: 'DEATH_REGISTRATION_NUMBER',
                      otherType: null,
                      __typename: 'IdentityType'
                    }
                  ],
                  deceased: { deathDate: '2022-04-04', __typename: 'Deceased' },
                  address: [
                    {
                      type: 'PRIMARY_ADDRESS',
                      line: ['', '', '', '', '', '', 'URBAN'],
                      district: '852b103f-2fe0-4871-a323-51e51c6d9198',
                      state: 'bac22b09-1260-4a59-a5b9-c56c43ae889c',
                      city: null,
                      postalCode: null,
                      country: 'FAR',
                      __typename: 'Address'
                    },
                    {
                      type: 'SECONDARY_ADDRESS',
                      line: ['', '', '', '', '', '', 'URBAN'],
                      district: '852b103f-2fe0-4871-a323-51e51c6d9198',
                      state: 'bac22b09-1260-4a59-a5b9-c56c43ae889c',
                      city: null,
                      postalCode: null,
                      country: 'FAR',
                      __typename: 'Address'
                    }
                  ],
                  __typename: 'Person'
                },
                informant: {
                  id: 'd596de54-9aaa-42a6-8783-27a6ae084a84',
                  relationship: 'DAUGHTER',
                  otherRelationship: null,
                  individual: {
                    id: 'c2d07312-8568-458f-b46a-42d39667f6e3',
                    identifier: [
                      {
                        id: '321987654',
                        type: 'NATIONAL_ID',
                        otherType: null,
                        __typename: 'IdentityType'
                      }
                    ],
                    name: [
                      {
                        use: 'en',
                        firstNames: 'srtndrtgy',
                        familyName: 'srtnr',
                        __typename: 'HumanName'
                      }
                    ],
                    nationality: ['FAR'],
                    occupation: null,
                    birthDate: null,
                    telecom: null,
                    address: [
                      {
                        type: 'PRIMARY_ADDRESS',
                        line: ['', '', '', '', '', '', 'URBAN'],
                        district: '852b103f-2fe0-4871-a323-51e51c6d9198',
                        state: 'bac22b09-1260-4a59-a5b9-c56c43ae889c',
                        city: null,
                        postalCode: null,
                        country: 'FAR',
                        __typename: 'Address'
                      },
                      {
                        type: 'SECONDARY_ADDRESS',
                        line: ['', '', '', '', '', '', 'URBAN'],
                        district: '852b103f-2fe0-4871-a323-51e51c6d9198',
                        state: 'bac22b09-1260-4a59-a5b9-c56c43ae889c',
                        city: null,
                        postalCode: null,
                        country: 'FAR',
                        __typename: 'Address'
                      }
                    ],
                    __typename: 'Person'
                  },
                  __typename: 'RelatedPerson'
                },
                father: {
                  id: '89aaafc6-5737-4e49-8d37-8cecb2d546ae',
                  name: [
                    {
                      use: 'en',
                      firstNames: '',
                      familyName: 'dndtndt',
                      __typename: 'HumanName'
                    }
                  ],
                  __typename: 'Person'
                },
                mother: {
                  id: 'efe9c750-1d84-4aa5-9a2f-a69e0d42c4f5',
                  name: [
                    {
                      use: 'en',
                      firstNames: '',
                      familyName: 'drdtngydtyn',
                      __typename: 'HumanName'
                    }
                  ],
                  __typename: 'Person'
                },
                spouse: null,
                medicalPractitioner: null,
                registration: {
                  id: 'e921e161-b91b-4019-ad60-99687a4404dd',
                  contact: 'SON',
                  contactRelationship: null,
                  contactPhoneNumber: '+260787878787',
                  attachments: null,
                  status: [
                    {
                      type: 'REGISTERED',
                      timestamp: '2022-04-21T14:10:34.192Z',
                      __typename: 'RegWorkflow'
                    },
                    {
                      type: 'REGISTERED',
                      timestamp: '2022-04-21T14:10:34.192Z',
                      __typename: 'RegWorkflow'
                    },
                    {
                      type: 'REGISTERED',
                      timestamp: '2022-04-21T14:10:34.192Z',
                      __typename: 'RegWorkflow'
                    },
                    {
                      type: 'WAITING_VALIDATION',
                      timestamp: '2022-04-21T14:10:34.192Z',
                      __typename: 'RegWorkflow'
                    },
                    {
                      type: 'DECLARED',
                      timestamp: '2022-04-21T14:07:45.427Z',
                      __typename: 'RegWorkflow'
                    },
                    {
                      type: 'DECLARED',
                      timestamp: '2022-04-21T14:07:45.427Z',
                      __typename: 'RegWorkflow'
                    }
                  ],
                  type: 'DEATH',
                  trackingId: 'DBVWELM',
                  registrationNumber: '2022DBVWELM',
                  __typename: 'Registration'
                },
                eventLocation: {
                  id: 'd3225149-d28a-4cc6-be41-4ba89d165ad3',
                  type: 'PRIVATE_HOME',
                  address: {
                    type: null,
                    line: ['', '', '', '', '', '', 'dryn', 'drtny', 'rynd'],
                    district: 'srnthd',
                    state: 'stehdsr',
                    city: 'drny',
                    postalCode: '',
                    country: 'SLV',
                    __typename: 'Address'
                  },
                  __typename: 'Location'
                },
                questionnaire: null,
                mannerOfDeath: 'NATURAL_CAUSES',
                causeOfDeath: null,
                maleDependentsOfDeceased: null,
                femaleDependentsOfDeceased: null,
                history: [
                  {
                    date: '2022-04-21T14:15:09.055+00:00',
                    action: 'DOWNLOADED',
                    reinstated: false,
                    statusReason: null,
                    location: {
                      id: '852b103f-2fe0-4871-a323-51e51c6d9198',
                      name: 'Ibombo',
                      __typename: 'Location'
                    },
                    office: {
                      id: '204f706f-e097-4394-9d12-bd50f057f923',
                      name: 'Ibombo District Office',
                      __typename: 'Location'
                    },
                    user: {
                      id: '6241918dd6dc544f60d8f73a',
                      type: 'CHAIRMAN',
                      role: 'LOCAL_REGISTRAR',
                      name: [
                        {
                          firstNames: 'Kennedy',
                          familyName: 'Mweene',
                          use: 'en',
                          __typename: 'HumanName'
                        }
                      ],
                      avatar: null,
                      __typename: 'User'
                    },
                    comments: [],
                    input: [],
                    output: [],
                    certificates: null,
                    __typename: 'History'
                  },
                  {
                    date: '2022-04-21T14:10:50.699+00:00',
                    action: 'DOWNLOADED',
                    reinstated: false,
                    statusReason: null,
                    location: {
                      id: '852b103f-2fe0-4871-a323-51e51c6d9198',
                      name: 'Ibombo',
                      __typename: 'Location'
                    },
                    office: {
                      id: '204f706f-e097-4394-9d12-bd50f057f923',
                      name: 'Ibombo District Office',
                      __typename: 'Location'
                    },
                    user: {
                      id: '6241918dd6dc544f60d8f73a',
                      type: 'CHAIRMAN',
                      role: 'LOCAL_REGISTRAR',
                      name: [
                        {
                          firstNames: 'Kennedy',
                          familyName: 'Mweene',
                          use: 'en',
                          __typename: 'HumanName'
                        }
                      ],
                      avatar: null,
                      __typename: 'User'
                    },
                    comments: [],
                    input: [],
                    output: [],
                    certificates: null,
                    __typename: 'History'
                  },
                  {
                    date: '2022-04-21T14:10:34.714+00:00',
                    action: 'REGISTERED',
                    reinstated: false,
                    statusReason: null,
                    location: {
                      id: '852b103f-2fe0-4871-a323-51e51c6d9198',
                      name: 'Ibombo',
                      __typename: 'Location'
                    },
                    office: {
                      id: '204f706f-e097-4394-9d12-bd50f057f923',
                      name: 'Ibombo District Office',
                      __typename: 'Location'
                    },
                    user: {
                      id: '6241918dd6dc544f60d8f73a',
                      type: 'CHAIRMAN',
                      role: 'LOCAL_REGISTRAR',
                      name: [
                        {
                          firstNames: 'Kennedy',
                          familyName: 'Mweene',
                          use: 'en',
                          __typename: 'HumanName'
                        }
                      ],
                      avatar: null,
                      __typename: 'User'
                    },
                    comments: [],
                    input: [],
                    output: [],
                    certificates: null,
                    __typename: 'History'
                  },
                  {
                    date: '2022-04-21T14:10:34.605+00:00',
                    action: 'WAITING_VALIDATION',
                    reinstated: false,
                    statusReason: null,
                    location: {
                      id: '852b103f-2fe0-4871-a323-51e51c6d9198',
                      name: 'Ibombo',
                      __typename: 'Location'
                    },
                    office: {
                      id: '204f706f-e097-4394-9d12-bd50f057f923',
                      name: 'Ibombo District Office',
                      __typename: 'Location'
                    },
                    user: {
                      id: '6241918dd6dc544f60d8f73a',
                      type: 'CHAIRMAN',
                      role: 'LOCAL_REGISTRAR',
                      name: [
                        {
                          firstNames: 'Kennedy',
                          familyName: 'Mweene',
                          use: 'en',
                          __typename: 'HumanName'
                        }
                      ],
                      avatar: null,
                      __typename: 'User'
                    },
                    comments: [],
                    input: [],
                    output: [],
                    certificates: null,
                    __typename: 'History'
                  },
                  {
                    date: '2022-04-21T14:10:15.617+00:00',
                    action: 'DOWNLOADED',
                    reinstated: false,
                    statusReason: null,
                    location: {
                      id: '852b103f-2fe0-4871-a323-51e51c6d9198',
                      name: 'Ibombo',
                      __typename: 'Location'
                    },
                    office: {
                      id: '204f706f-e097-4394-9d12-bd50f057f923',
                      name: 'Ibombo District Office',
                      __typename: 'Location'
                    },
                    user: {
                      id: '6241918dd6dc544f60d8f73a',
                      type: 'CHAIRMAN',
                      role: 'LOCAL_REGISTRAR',
                      name: [
                        {
                          firstNames: 'Kennedy',
                          familyName: 'Mweene',
                          use: 'en',
                          __typename: 'HumanName'
                        }
                      ],
                      avatar: null,
                      __typename: 'User'
                    },
                    comments: [],
                    input: [],
                    output: [],
                    certificates: null,
                    __typename: 'History'
                  },
                  {
                    date: '2022-04-21T14:07:45.960+00:00',
                    action: 'DECLARED',
                    reinstated: false,
                    statusReason: null,
                    location: {
                      id: '852b103f-2fe0-4871-a323-51e51c6d9198',
                      name: 'Ibombo',
                      __typename: 'Location'
                    },
                    office: {
                      id: '204f706f-e097-4394-9d12-bd50f057f923',
                      name: 'Ibombo District Office',
                      __typename: 'Location'
                    },
                    user: {
                      id: '6241918dd6dc544f60d8f738',
                      type: 'CHA',
                      role: 'FIELD_AGENT',
                      name: [
                        {
                          firstNames: 'Kalusha',
                          familyName: 'Bwalya',
                          use: 'en',
                          __typename: 'HumanName'
                        }
                      ],
                      avatar: null,
                      __typename: 'User'
                    },
                    comments: [],
                    input: [],
                    output: [],
                    certificates: null,
                    __typename: 'History'
                  }
                ],
                __typename: 'DeathRegistration'
              }
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
          registerForm={getReviewFormFromStore(store, Event.DEATH)}
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
        _fhirID: 'e34c0bb4-bdc8-4333-976d-4d7a4a3b6d9a',
        addressLine2UrbanOptionPrimary: '',
        addressLine2UrbanOptionSecondary: '',
        addressLine3UrbanOptionPrimary: '',
        addressLine3UrbanOptionSecondary: '',
        addressLine5Primary: '',
        addressLine5Secondary: '',
        birthDate: '1990-03-20',
        cityUrbanOptionPrimary: null,
        cityUrbanOptionSecondary: null,
        countryPrimary: 'FAR',
        countrySecondary: 'FAR',
        districtPrimary: '852b103f-2fe0-4871-a323-51e51c6d9198',
        districtSecondary: '852b103f-2fe0-4871-a323-51e51c6d9198',
        familyNameEng: 'seths',
        firstNamesEng: 'aegrst',
        gender: 'female',
        iD: '321951357',
        iDType: 'NATIONAL_ID',
        internationalAddressLine1Primary: 'URBAN',
        internationalAddressLine1Secondary: 'URBAN',
        internationalAddressLine2Primary: '',
        internationalAddressLine2Secondary: '',
        internationalAddressLine3Primary: '',
        internationalAddressLine3Secondary: '',
        internationalCityPrimary: null,
        internationalCitySecondary: null,
        internationalDistrictPrimary: '852b103f-2fe0-4871-a323-51e51c6d9198',
        internationalDistrictSecondary: '852b103f-2fe0-4871-a323-51e51c6d9198',
        internationalPostcodePrimary: null,
        internationalPostcodeSecondary: null,
        internationalStatePrimary: 'bac22b09-1260-4a59-a5b9-c56c43ae889c',
        internationalStateSecondary: 'bac22b09-1260-4a59-a5b9-c56c43ae889c',
        maritalStatus: 'MARRIED',
        nationality: 'FAR',
        numberUrbanOptionPrimary: '',
        numberUrbanOptionSecondary: '',
        postcodePrimary: null,
        postcodeSecondary: null,
        ruralOrUrbanPrimary: '',
        ruralOrUrbanSecondary: '',
        statePrimary: 'bac22b09-1260-4a59-a5b9-c56c43ae889c',
        stateSecondary: 'bac22b09-1260-4a59-a5b9-c56c43ae889c'
      })
    })
    it('populates proper casue of death section', async () => {
      const declaration = createReviewDeclaration(uuid(), {}, Event.DEATH)
      const graphqlMock = [
        {
          request: {
            query: GET_DEATH_REGISTRATION_FOR_REVIEW,
            variables: { id: declaration.id }
          },
          result: {
            data: {
              fetchDeathRegistration: {
                id: '4f5ff6f7-cf61-42e1-9e1e-dc4b73517aa6',
                _fhirIDMap: {
                  composition: '4f5ff6f7-cf61-42e1-9e1e-dc4b73517aa6'
                },
                deceased: {
                  id: '50fbd713-c86d-49fe-bc6a-52094b40d8dd',
                  name: [
                    {
                      use: 'bn',
                      firstNames: 'অনিক',
                      familyName: 'অনিক'
                    },
                    {
                      use: 'en',
                      firstNames: 'Anik',
                      familyName: 'anik'
                    }
                  ],
                  birthDate: '1983-01-01',
                  maritalStatus: 'MARRIED',
                  nationality: ['BGD'],
                  identifier: [
                    {
                      id: '123456789',
                      type: 'PASSPORT',
                      otherType: null
                    }
                  ],
                  gender: 'male',
                  deceased: {
                    deathDate: '2019-01-01'
                  },
                  address: graphQLPersonAddressMock
                },
                informant: {
                  id: 'c9e3e5cb-d483-4db4-afaa-625161826f00',
                  relationship: 'EXTENDED_FAMILY',
                  otherRelationship: null,
                  individual: {
                    id: 'cabeeea7-0f7d-41c3-84ed-8f88e4d617e1',
                    identifier: [
                      {
                        id: '123456789',
                        type: 'PASSPORT',
                        otherType: null
                      }
                    ],
                    name: [
                      {
                        use: 'bn',
                        firstNames: 'অনিক',
                        familyName: 'অনিক'
                      },
                      {
                        use: 'en',
                        firstNames: 'Anik',
                        familyName: 'Anik'
                      }
                    ],
                    nationality: ['BGD'],
                    birthDate: '1996-01-01',
                    telecom: [
                      {
                        system: 'phone',
                        value: '01622688231'
                      }
                    ],
                    address: graphQLPersonAddressMock
                  }
                },
                father: {
                  id: '7ac8d0a6-a391-42f9-add4-dec27279589',
                  name: [
                    {
                      use: 'bn',
                      firstNames: 'মোক্তার',
                      familyName: 'আলী'
                    },
                    {
                      use: 'en',
                      firstNames: 'Moktar',
                      familyName: 'Ali'
                    }
                  ]
                },
                mother: {
                  id: '7ac8d0a6-a391-42f9-add4-dec272asfdasdf',
                  name: [
                    {
                      use: 'bn',
                      firstNames: 'মরিউম',
                      familyName: 'আলী'
                    },
                    {
                      use: 'en',
                      firstNames: 'Morium',
                      familyName: 'Ali'
                    }
                  ]
                },
                spouse: {
                  id: '7ac8d0a6-a391-42f9-add4-decasdfasfd89',
                  name: [
                    {
                      use: 'bn',
                      firstNames: 'রেহানা',
                      familyName: 'আলী'
                    },
                    {
                      use: 'en',
                      firstNames: 'Rehana',
                      familyName: 'Ali'
                    }
                  ]
                },
                registration: {
                  id: 'fccf6eac-4dae-43d3-af33-2c977d1daf08',
                  attachments: null,
                  status: [
                    {
                      type: 'DECLARED',
                      timestamp: null
                    }
                  ],
                  type: 'DEATH',
                  contact: 'OTHER',
                  contactPhoneNumber: '+8801671010143',
                  contactRelationship: 'Friend',
                  trackingId: 'DS8QZ0Z',
                  registrationNumber: '2019123223DS8QZ0Z1'
                },
                eventLocation: graphQLEventLocationAddressMock,
                mannerOfDeath: 'ACCIDENT',
                causeOfDeath: 'Internal injury in head'
              }
            }
          }
        }
      ]
      const form = await getReviewFormFromStore(store, Event.DEATH)
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

      expect(data.data.causeOfDeath).toEqual({
        causeOfDeathEstablished: true,
        causeOfDeathCode: 'Internal injury in head'
      })
    })
  })
  describe('ReviewForm tests for register scope', () => {
    beforeEach(async () => {
      getItem.mockReturnValue(declareScope)
      await store.dispatch(checkAuth({ '?token': declareScope }))
    })

    it('shows error message for user with declare scope', async () => {
      const declaration = createReviewDeclaration(uuid(), {}, Event.BIRTH)
      const graphqlMock = [
        {
          request: {
            query: GET_BIRTH_REGISTRATION_FOR_REVIEW,
            variables: { id: declaration.id }
          },
          result: {
            data: {
              fetchBirthRegistration: {
                child: null,
                mother: null,
                father: null,
                informant: {
                  relationship: 'Informant Relation',
                  otherRelationship: 'Other Relation'
                },
                registration: {
                  informantType: 'MOTHER',
                  contact: 'MOTHER',
                  contactRelationship: 'Contact Relation',
                  attachments: null,
                  status: null,
                  type: 'BIRTH'
                },
                attendantAtBirth: 'NURSE',
                weightAtBirth: 2,
                birthType: 'SINGLE',
                eventLocation: graphQLEventLocationAddressMock,
                presentAtBirthRegistration: 'MOTHER_ONLY'
              }
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

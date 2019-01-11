import * as React from 'react'
import { ReviewForm, FETCH_BIRTH_REGISTRATION_QUERY } from './ReviewForm'
import { createTestComponent } from 'src/tests/util'
import { createStore } from 'src/store'
import { getReviewForm } from '@opencrvs/register/src/forms/register/review-selectors'
import {
  createReviewDraft,
  IDraft,
  setInitialDrafts,
  storeDraft
} from '@opencrvs/register/src/drafts'
import { v4 as uuid } from 'uuid'
import { REVIEW_BIRTH_PARENT_FORM_TAB } from '@opencrvs/register/src/navigation/routes'
import { RegisterForm } from '@opencrvs/register/src/views/RegisterForm/RegisterForm'
import { checkAuth } from '@opencrvs/register/src/profile/profileActions'

const declareScope =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJpYXQiOjE1MzMxOTUyMjgsImV4cCI6MTU0MzE5NTIyNywiYXVkIjpbImdhdGV3YXkiXSwic3ViIjoiMSJ9.G4KzkaIsW8fTkkF-O8DI0qESKeBI332UFlTXRis3vJ6daisu06W5cZsgYhmxhx_n0Q27cBYt2OSOnjgR72KGA5IAAfMbAJifCul8ib57R4VJN8I90RWqtvA0qGjV-sPndnQdmXzCJx-RTumzvr_vKPgNDmHzLFNYpQxcmQHA-N8li-QHMTzBHU4s9y8_5JOCkudeoTMOd_1021EDAQbrhonji5V1EOSY2woV5nMHhmq166I1L0K_29ngmCqQZYi1t6QBonsIowlXJvKmjOH5vXHdCCJIFnmwHmII4BK-ivcXeiVOEM_ibfxMWkAeTRHDshOiErBFeEvqd6VWzKvbKAH0UY-Rvnbh4FbprmO4u4_6Yd2y2HnbweSo-v76dVNcvUS0GFLFdVBt0xTay-mIeDy8CKyzNDOWhmNUvtVi9mhbXYfzzEkwvi9cWwT1M8ZrsWsvsqqQbkRCyBmey_ysvVb5akuabenpPsTAjiR8-XU2mdceTKqJTwbMU5gz-8fgulbTB_9TNJXqQlH7tyYXMWHUY3uiVHWg2xgjRiGaXGTiDgZd01smYsxhVnPAddQOhqZYCrAgVcT1GBFVvhO7CC-rhtNlLl21YThNNZNpJHsCgg31WA9gMQ_2qAJmw2135fAyylO8q7ozRUvx46EezZiPzhCkPMeELzLhQMEIqjo'

const registerScopeToken =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWdpc3RlciIsImNlcnRpZnkiLCJkZW1vIl0sImlhdCI6MTU0MjY4ODc3MCwiZXhwIjoxNTQzMjkzNTcwLCJhdWQiOlsib3BlbmNydnM6YXV0aC11c2VyIiwib3BlbmNydnM6dXNlci1tZ250LXVzZXIiLCJvcGVuY3J2czpoZWFydGgtdXNlciIsIm9wZW5jcnZzOmdhdGV3YXktdXNlciIsIm9wZW5jcnZzOm5vdGlmaWNhdGlvbi11c2VyIiwib3BlbmNydnM6d29ya2Zsb3ctdXNlciJdLCJpc3MiOiJvcGVuY3J2czphdXRoLXNlcnZpY2UiLCJzdWIiOiI1YmVhYWY2MDg0ZmRjNDc5MTA3ZjI5OGMifQ.ElQd99Lu7WFX3L_0RecU_Q7-WZClztdNpepo7deNHqzro-Cog4WLN7RW3ZS5PuQtMaiOq1tCb-Fm3h7t4l4KDJgvC11OyT7jD6R2s2OleoRVm3Mcw5LPYuUVHt64lR_moex0x_bCqS72iZmjrjS-fNlnWK5zHfYAjF2PWKceMTGk6wnI9N49f6VwwkinJcwJi6ylsjVkylNbutQZO0qTc7HRP-cBfAzNcKD37FqTRNpVSvHdzQSNcs7oiv3kInDN5aNa2536XSd3H-RiKR9hm9eID9bSIJgFIGzkWRd5jnoYxT70G0t03_mTVnDnqPXDtyI-lmerx24Ost0rQLUNIg'
const getItem = window.localStorage.getItem as jest.Mock
describe('ReviewForm tests', async () => {
  const { store, history } = createStore()
  const scope = ['register']
  const mock: any = jest.fn()
  const form = getReviewForm(store.getState())

  beforeAll(() => {
    getItem.mockReturnValue(registerScopeToken)
    store.dispatch(checkAuth({ '?token': registerScopeToken }))
  })

  it('it returns error while fetching', async () => {
    const draft = createReviewDraft(uuid(), {})
    const graphqlMock = [
      {
        request: {
          query: FETCH_BIRTH_REGISTRATION_QUERY
        },
        error: new Error('boom')
      }
    ]

    const testComponent = createTestComponent(
      <ReviewForm
        location={mock}
        history={history}
        staticContext={mock}
        registerForm={form}
        scope={scope}
        tabRoute={REVIEW_BIRTH_PARENT_FORM_TAB}
        match={{
          params: { draftId: draft.id, tabId: 'review' },
          isExact: true,
          path: '',
          url: ''
        }}
        draftId={draft.id}
      />,
      store,
      graphqlMock
    )
    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 0)
    })

    testComponent.component.update()

    expect(
      testComponent.component
        .find('#review-error-text')
        .children()
        .text()
    ).toBe('An error occurred while fetching birth registration')

    testComponent.component.unmount()
  })
  it('it returns birth registration', async () => {
    const draft = createReviewDraft(uuid(), {})
    const graphqlMock = [
      {
        request: {
          query: FETCH_BIRTH_REGISTRATION_QUERY,
          variables: { id: draft.id }
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
                  presentAtBirthRegistration:
                    'd43f9c01-bd4f-4df6-b38f-91f7a978a232'
                }
              },
              child: {
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
                birthDate: '2001-01-01',
                gender: 'male',
                id: '16025284-bae2-4b37-ae80-e16745b7a6b9'
              },
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
                dateOfMarriage: '2001-01-01',
                educationalAttainment: 'PRIMARY_ISCED_1',
                nationality: ['BGD'],
                identifier: [{ id: '1233', type: 'PASSPORT' }],
                multipleBirth: 1,
                address: [
                  {
                    type: 'PERMANENT',
                    line: ['12', '', 'union1', 'upazila10'],
                    district: 'district2',
                    state: 'state2',
                    postalCode: '',
                    country: 'BGD'
                  },
                  {
                    type: 'CURRENT',
                    line: ['12', '', 'union1', 'upazila10'],
                    district: 'district2',
                    state: 'state2',
                    postalCode: '',
                    country: 'BGD'
                  }
                ],
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
                contact: 'MOTHER',
                attachments: null,
                status: null,
                paperFormID: '123',
                trackingId: 'B123456',
                registrationNumber: null
              },
              attendantAtBirth: 'NURSE',
              weightAtBirth: 2,
              birthType: 'SINGLE',
              presentAtBirthRegistration: 'MOTHER_ONLY'
            }
          }
        }
      }
    ]
    const testComponent = createTestComponent(
      <ReviewForm
        location={mock}
        history={history}
        scope={scope}
        staticContext={mock}
        registerForm={form}
        tabRoute={REVIEW_BIRTH_PARENT_FORM_TAB}
        match={{
          params: { draftId: draft.id, tabId: 'review' },
          isExact: true,
          path: '',
          url: ''
        }}
        draftId={draft.id}
      />,
      store,
      graphqlMock
    )
    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 0)
    })

    testComponent.component.update()
    const data = testComponent.component
      .find(RegisterForm)
      .prop('draft') as IDraft

    expect(data.data.child).toEqual({
      _fhirID: '16025284-bae2-4b37-ae80-e16745b7a6b9',
      attendantAtBirth: 'NURSE',
      childBirthDate: '2001-01-01',
      familyName: 'আকাশ',
      familyNameEng: 'Akash',
      firstNames: '',
      firstNamesEng: '',
      gender: 'male',
      orderOfBirth: 1,
      typeOfBirth: 'SINGLE',
      weightAtBirth: 2
    })

    testComponent.component.unmount()
  })
  it('it returns empty data and checks if there is any error', async () => {
    const draft = createReviewDraft(uuid(), {})
    const graphqlMock = [
      {
        request: {
          query: FETCH_BIRTH_REGISTRATION_QUERY,
          variables: { id: draft.id }
        },
        result: {
          data: {
            fetchBirthRegistration: {}
          }
        }
      }
    ]
    const testComponent = createTestComponent(
      <ReviewForm
        location={mock}
        history={history}
        scope={scope}
        staticContext={mock}
        registerForm={form}
        tabRoute={REVIEW_BIRTH_PARENT_FORM_TAB}
        match={{
          params: { draftId: draft.id, tabId: 'review' },
          isExact: true,
          path: '',
          url: ''
        }}
        draftId={draft.id}
      />,
      store,
      graphqlMock
    )
    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 0)
    })
    testComponent.component.unmount()
  })
  it("when registration contact is father, father's should be set", async () => {
    const draft = createReviewDraft(uuid(), {})
    const graphqlMock = [
      {
        request: {
          query: FETCH_BIRTH_REGISTRATION_QUERY,
          variables: { id: draft.id }
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
                  presentAtBirthRegistration:
                    'd43f9c01-bd4f-4df6-b38f-91f7a978a232'
                }
              },
              child: null,
              mother: null,
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
                dateOfMarriage: '2001-01-01',
                educationalAttainment: 'PRIMARY_ISCED_1',
                nationality: ['BGD'],
                identifier: [{ id: '1233', type: 'PASSPORT' }],
                address: [
                  {
                    type: 'PERMANENT',
                    line: ['12', '', 'union1', 'upazila10'],
                    district: 'district2',
                    state: 'state2',
                    postalCode: '',
                    country: 'BGD'
                  },
                  {
                    type: 'CURRENT',
                    line: ['12', '', 'union1', 'upazila10'],
                    district: 'district2',
                    state: 'state2',
                    postalCode: '',
                    country: 'BGD'
                  }
                ],
                telecom: [
                  {
                    system: 'phone',
                    value: '01711111111'
                  },
                  {
                    system: 'email',
                    value: 'ajmol@ocrvs.com'
                  }
                ],
                id: '526362a1-aa8e-4848-af35-41524f9e7e85'
              },
              registration: {
                id: 'c8dbe751-5916-4e2a-ba95-1733ccf699b6',
                contact: 'FATHER',
                attachments: null,
                status: null,
                paperFormID: '123',
                trackingId: 'B123456',
                registrationNumber: null
              },
              attendantAtBirth: 'NURSE',
              weightAtBirth: 2,
              birthType: 'SINGLE',
              presentAtBirthRegistration: 'MOTHER_ONLY'
            }
          }
        }
      }
    ]
    const testComponent = createTestComponent(
      <ReviewForm
        location={mock}
        history={history}
        staticContext={mock}
        scope={scope}
        registerForm={form}
        tabRoute={REVIEW_BIRTH_PARENT_FORM_TAB}
        match={{
          params: { draftId: draft.id, tabId: 'review' },
          isExact: true,
          path: '',
          url: ''
        }}
        draftId={draft.id}
      />,
      store,
      graphqlMock
    )
    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 0)
    })
    testComponent.component.update()

    const data = testComponent.component
      .find(RegisterForm)
      .prop('draft') as IDraft

    expect(data.data.registration.registrationEmail).toBe('ajmol@ocrvs.com')
    testComponent.component.unmount()
  })

  it('when registration contact is there but no contact information for father/mother', async () => {
    const draft = createReviewDraft(uuid(), {})
    const graphqlMock = [
      {
        request: {
          query: FETCH_BIRTH_REGISTRATION_QUERY,
          variables: { id: draft.id }
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
                  presentAtBirthRegistration:
                    'd43f9c01-bd4f-4df6-b38f-91f7a978a232'
                }
              },
              child: null,
              mother: null,
              father: null,
              registration: {
                id: 'c8dbe751-5916-4e2a-ba95-1733ccf699b6',
                contact: 'MOTHER',
                attachments: null,
                status: null,
                paperFormID: '123',
                trackingId: 'B123456',
                registrationNumber: '12345'
              },
              attendantAtBirth: 'NURSE',
              weightAtBirth: 2,
              birthType: 'SINGLE',
              presentAtBirthRegistration: 'MOTHER_ONLY'
            }
          }
        }
      }
    ]
    const testComponent = createTestComponent(
      <ReviewForm
        location={mock}
        history={history}
        staticContext={mock}
        scope={scope}
        registerForm={form}
        tabRoute={REVIEW_BIRTH_PARENT_FORM_TAB}
        match={{
          params: { draftId: draft.id, tabId: 'review' },
          isExact: true,
          path: '',
          url: ''
        }}
        draftId={draft.id}
      />,
      store,
      graphqlMock
    )
    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 0)
    })

    testComponent.component.update()

    const data = testComponent.component
      .find(RegisterForm)
      .prop('draft') as IDraft

    expect(data.data.registration.registrationEmail).toBeUndefined()

    testComponent.component.unmount()
  })

  it('when registration has attachment', async () => {
    const draft = createReviewDraft(uuid(), {})
    const graphqlMock = [
      {
        request: {
          query: FETCH_BIRTH_REGISTRATION_QUERY,
          variables: { id: draft.id }
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
                  presentAtBirthRegistration:
                    'd43f9c01-bd4f-4df6-b38f-91f7a978a232'
                }
              },
              child: null,
              mother: null,
              father: null,
              registration: {
                id: 'c8dbe751-5916-4e2a-ba95-1733ccf699b6',
                contact: 'MOTHER',
                attachments: [
                  {
                    contentType: 'image/jpeg',
                    subject: 'MOTHER',
                    type: 'BIRTH_REGISTRATION',
                    data: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQECWAJYAAD'
                  }
                ],
                status: null,
                paperFormID: '123',
                trackingId: 'B123456',
                registrationNumber: null
              },
              attendantAtBirth: 'NURSE',
              weightAtBirth: 2,
              birthType: 'SINGLE',
              presentAtBirthRegistration: 'MOTHER_ONLY'
            }
          }
        }
      }
    ]
    const testComponent = createTestComponent(
      <ReviewForm
        location={mock}
        history={history}
        staticContext={mock}
        scope={scope}
        registerForm={form}
        tabRoute={REVIEW_BIRTH_PARENT_FORM_TAB}
        match={{
          params: { draftId: draft.id, tabId: 'review' },
          isExact: true,
          path: '',
          url: ''
        }}
        draftId={draft.id}
      />,
      store,
      graphqlMock
    )
    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 0)
    })

    testComponent.component.update()

    const data = testComponent.component
      .find(RegisterForm)
      .prop('draft') as IDraft

    expect(data.data.documents.image_uploader).toEqual([
      {
        optionValues: ['Mother', 'Birth Registration'],
        type: 'image/jpeg',
        title: 'Mother',
        description: 'Birth Registration',
        data: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQECWAJYAAD'
      }
    ])

    testComponent.component.unmount()
  })
  it('check registration', async () => {
    const draft = createReviewDraft(uuid(), {})
    const graphqlMock = [
      {
        request: {
          query: FETCH_BIRTH_REGISTRATION_QUERY,
          variables: { id: draft.id }
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
                  presentAtBirthRegistration:
                    'd43f9c01-bd4f-4df6-b38f-91f7a978a232'
                }
              },
              child: null,
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
                dateOfMarriage: '2001-01-01',
                educationalAttainment: 'PRIMARY_ISCED_1',
                nationality: ['BGD'],
                identifier: [{ id: '1233', type: 'PASSPORT' }],
                multipleBirth: 1,
                address: [
                  {
                    type: 'PERMANENT',
                    line: ['12', '', 'union1', 'upazila10'],
                    district: 'district2',
                    state: 'state2',
                    postalCode: '',
                    country: 'BGD'
                  },
                  {
                    type: 'CURRENT',
                    line: ['12', '', 'union1', 'upazila10'],
                    district: 'district2',
                    state: 'state2',
                    postalCode: '',
                    country: 'BGD'
                  }
                ],
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
                contact: 'MOTHER',
                attachments: null,
                status: [
                  {
                    comments: [
                      {
                        comment: 'This is a note'
                      }
                    ]
                  }
                ],
                paperFormID: '123',
                trackingId: 'B123456',
                registrationNumber: null
              },
              attendantAtBirth: 'NURSE',
              weightAtBirth: 2,
              birthType: 'SINGLE',
              presentAtBirthRegistration: 'MOTHER_ONLY'
            }
          }
        }
      }
    ]
    const testComponent = createTestComponent(
      <ReviewForm
        location={mock}
        history={history}
        staticContext={mock}
        scope={scope}
        registerForm={form}
        tabRoute={REVIEW_BIRTH_PARENT_FORM_TAB}
        match={{
          params: { draftId: draft.id, tabId: 'review' },
          isExact: true,
          path: '',
          url: ''
        }}
        draftId={draft.id}
      />,
      store,
      graphqlMock
    )
    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 0)
    })

    testComponent.component.update()

    const data = testComponent.component
      .find(RegisterForm)
      .prop('draft') as IDraft

    expect(data.data.registration).toEqual({
      _fhirID: 'c8dbe751-5916-4e2a-ba95-1733ccf699b6',
      whoseContactDetails: 'MOTHER',
      presentAtBirthRegistration: 'MOTHER_ONLY',
      registrationPhone: '01711111111',
      registrationEmail: 'moyna@ocrvs.com',
      paperFormNumber: '123',
      commentsOrNotes: 'This is a note',
      trackingId: 'B123456',
      registrationNumber: null
    })

    testComponent.component.unmount()
  })
  it('it checked if review form is already in store and avoid loading from backend', async () => {
    const draft = createReviewDraft(uuid(), {})
    draft.data = {
      child: {
        attendantAtBirth: 'NURSE',
        childBirthDate: '2001-01-01',
        familyName: 'আকাশ',
        familyNameEng: 'Akash',
        firstNames: '',
        firstNamesEng: '',
        gender: 'male',
        typeOfBirth: 'SINGLE',
        weightAtBirth: '2'
      },
      registration: {
        presentAtBirthRegistration: 'MOTHER_ONLY',
        registrationEmail: 'moyna@ocrvs.com',
        registrationPhone: '01741234567',
        whoseContactDetails: 'MOTHER'
      }
    }
    const initalDrafts = JSON.parse('[]')
    store.dispatch(setInitialDrafts(initalDrafts))
    store.dispatch(storeDraft(draft))

    const testComponent = createTestComponent(
      <ReviewForm
        location={mock}
        history={history}
        staticContext={mock}
        scope={scope}
        registerForm={form}
        tabRoute={REVIEW_BIRTH_PARENT_FORM_TAB}
        match={{
          params: { draftId: draft.id, tabId: 'review' },
          isExact: true,
          path: '',
          url: ''
        }}
        draftId={draft.id}
      />,
      store
    )
    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 0)
    })

    testComponent.component.update()
    const data = testComponent.component
      .find(RegisterForm)
      .prop('draft') as IDraft

    expect(data.data).toEqual({
      child: {
        attendantAtBirth: 'NURSE',
        childBirthDate: '2001-01-01',
        familyName: 'আকাশ',
        familyNameEng: 'Akash',
        firstNames: '',
        firstNamesEng: '',
        gender: 'male',
        typeOfBirth: 'SINGLE',
        weightAtBirth: '2'
      },
      registration: {
        presentAtBirthRegistration: 'MOTHER_ONLY',
        registrationEmail: 'moyna@ocrvs.com',
        registrationPhone: '01741234567',
        whoseContactDetails: 'MOTHER'
      }
    })

    testComponent.component.unmount()
  })
  describe('ReviewForm tests for register scope', () => {
    beforeAll(() => {
      getItem.mockReturnValue(declareScope)
      store.dispatch(checkAuth({ '?token': declareScope }))
    })

    it('shows error message for user with declare scope', async () => {
      const draft = createReviewDraft(uuid(), {})
      const graphqlMock = [
        {
          request: {
            query: FETCH_BIRTH_REGISTRATION_QUERY,
            variables: { id: draft.id }
          },
          result: {
            data: {
              fetchBirthRegistration: {
                child: null,
                mother: null,
                father: null,
                registration: {
                  contact: 'MOTHER',
                  attachments: null,
                  status: null,
                  paperFormID: '123'
                },
                attendantAtBirth: 'NURSE',
                weightAtBirth: 2,
                birthType: 'SINGLE',
                presentAtBirthRegistration: 'MOTHER_ONLY'
              }
            }
          }
        }
      ]
      const testComponent = createTestComponent(
        <ReviewForm
          location={mock}
          history={history}
          staticContext={mock}
          scope={scope}
          registerForm={form}
          tabRoute={REVIEW_BIRTH_PARENT_FORM_TAB}
          match={{
            params: { draftId: draft.id, tabId: 'review' },
            isExact: true,
            path: '',
            url: ''
          }}
          draftId={draft.id}
        />,
        store,
        graphqlMock
      )
      await new Promise(resolve => {
        setTimeout(resolve, 0)
      })

      testComponent.component.update()

      expect(
        testComponent.component
          .find('#review-unauthorized-error-text')
          .children()
          .text()
      ).toBe('We are unable to display this page to you')

      testComponent.component.unmount()
    })
  })
})

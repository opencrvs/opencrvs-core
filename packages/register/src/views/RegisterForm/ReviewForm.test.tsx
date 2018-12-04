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

describe('ReviewForm tests', async () => {
  const { store, history } = createStore()

  const mock: any = jest.fn()
  const form = getReviewForm(store.getState())

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
                gender: 'male'
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
                ]
              },
              father: null,
              registration: {
                contact: 'MOTHER'
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
      attendantAtBirth: 'NURSE',
      childBirthDate: '2001-01-01',
      familyName: 'আকাশ',
      familyNameEng: 'Akash',
      firstNames: '',
      firstNamesEng: '',
      gender: 'male',
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
                ]
              },
              registration: {
                contact: 'FATHER'
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
              child: null,
              mother: null,
              father: null,
              registration: {
                contact: 'MOTHER'
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
})

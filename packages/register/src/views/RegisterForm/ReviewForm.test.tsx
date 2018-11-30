import * as React from 'react'
import { ReviewForm, FETCH_BIRTH_REGISTRATION_QUERY } from './ReviewForm'
import { createTestComponent } from 'src/tests/util'
import { createStore } from 'src/store'
import { getReviewForm } from '@opencrvs/register/src/forms/register/review-selectors'
import { createReviewDraft } from '@opencrvs/register/src/drafts'
import { v4 as uuid } from 'uuid'
import { REVIEW_BIRTH_PARENT_FORM_TAB } from '@opencrvs/register/src/navigation/routes'

describe('ReviewForm tests', async () => {
  const { store, history } = createStore()

  const mock: any = jest.fn()
  const form = getReviewForm(store.getState())
  const draft = createReviewDraft(uuid(), {})
  // it('error while fetching', async () => {
  //   const graphqlMock = [
  //     {
  //       request: {
  //         query: FETCH_BIRTH_REGISTRATION_QUERY
  //       },
  //       error: new Error('boom')
  //     }
  //   ]

  //   const testComponent = createTestComponent(
  //     <ReviewForm
  //       location={mock}
  //       history={history}
  //       staticContext={mock}
  //       registerForm={form}
  //       tabRoute={REVIEW_BIRTH_PARENT_FORM_TAB}
  //       match={{
  //         params: { draftId: draft.id, tabId: 'review' },
  //         isExact: true,
  //         path: '',
  //         url: ''
  //       }}
  //       draftId={draft.id}
  //     />,
  //     store,
  //     graphqlMock
  //   )
  //   // wait for mocked data to load mockedProvider
  //   await new Promise(resolve => {
  //     setTimeout(resolve, 0)
  //   })

  //   testComponent.component.update()

  //   expect(
  //     testComponent.component
  //       .find('#review-error-text')
  //       .children()
  //       .text()
  //   ).toBe('An error occurred while fetching')

  //   testComponent.component.unmount()
  // })
  it('fetched data', async () => {
    const graphqlMock = [
      {
        request: {
          query: FETCH_BIRTH_REGISTRATION_QUERY,
          variables: { id: '1fa9a4ab-e0d2-41d8-b8d0-dbfa3d57728b' }
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
                    value: 'sa@dfas.asd'
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

    expect(
      testComponent.component
        .find('#review-error-text')
        .children()
        .text()
    ).toBe('An error occurred while fetching')

    testComponent.component.unmount()
  })
})

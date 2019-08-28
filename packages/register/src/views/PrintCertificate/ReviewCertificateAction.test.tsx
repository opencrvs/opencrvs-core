import * as React from 'react'
import { createStore } from '@register/store'
import { GET_BIRTH_REGISTRATION_FOR_CERTIFICATE } from '@register/views/DataProvider/birth/queries'
import { GET_DEATH_REGISTRATION_FOR_CERTIFICATION } from '@register/views/DataProvider/death/queries'
import { createTestComponent } from '@register/tests/util'
import { ReviewCertificateAction } from './ReviewCertificateAction'
import { ReactWrapper } from 'enzyme'
import { waitForElement } from '@register/tests/wait-for-element'

describe('when user wants to review death certificate', () => {
  const { store, history } = createStore()
  const mockLocation: any = jest.fn()
  const graphqlMock = [
    {
      request: {
        query: GET_DEATH_REGISTRATION_FOR_CERTIFICATION,
        variables: { id: 'asdhdqe2472487jsdfsdf' }
      },
      result: {
        data: {
          fetchDeathRegistration: {
            _fhirIDMap: {
              composition: 'a252a771-aba4-427f-ae69-3ddcf2bc301b'
            },
            id: 'a252a771-aba4-427f-ae69-3ddcf2bc301b',
            deceased: {
              id: '22d219e1-c964-468a-a2d1-f18389247ad3',
              name: [
                {
                  use: 'bn',
                  firstNames: '',
                  familyName: 'হাসান',
                  __typename: 'HumanName'
                },
                {
                  use: 'en',
                  firstNames: '',
                  familyName: 'Hassan',
                  __typename: 'HumanName'
                }
              ],
              birthDate: '2018-11-11',
              gender: 'male',
              maritalStatus: 'MARRIED',
              nationality: ['BGD'],
              identifier: [
                {
                  id: '1111111111111',
                  type: 'NATIONAL_ID',
                  otherType: null,
                  __typename: 'IdentityType'
                }
              ],
              deceased: {
                deathDate: '2018-11-11',
                __typename: 'Deceased'
              },
              address: [
                {
                  type: 'PERMANENT',
                  line: [
                    '',
                    '',
                    '',
                    '',
                    '',
                    '587c9bf9-7aa1-4103-ae15-2f5ccfababc1'
                  ],
                  district: '3967a79b-fd87-4ccf-99c5-2ecfeeb87f28',
                  state: '2b981ef4-1466-4f17-b325-48c50f6cd23b',
                  postalCode: null,
                  country: 'BGD',
                  __typename: 'Address'
                },
                {
                  type: 'CURRENT',
                  line: [
                    '',
                    '',
                    '',
                    '',
                    '',
                    '587c9bf9-7aa1-4103-ae15-2f5ccfababc1'
                  ],
                  district: '3967a79b-fd87-4ccf-99c5-2ecfeeb87f28',
                  state: '2b981ef4-1466-4f17-b325-48c50f6cd23b',
                  postalCode: null,
                  country: 'BGD',
                  __typename: 'Address'
                }
              ],
              __typename: 'Person'
            },
            informant: {
              id: '5a4dc272-67de-4fe3-bd5b-a29a1a3e8e4b',
              relationship: 'MOTHER',
              otherRelationship: null,
              individual: {
                id: 'dd7b90f2-1d99-49e1-b0a6-236ec0ffca85',
                identifier: [
                  {
                    id: '1111111111111',
                    type: 'NATIONAL_ID',
                    otherType: null,
                    __typename: 'IdentityType'
                  }
                ],
                name: [
                  {
                    use: 'bn',
                    firstNames: '',
                    familyName: 'হাসান',
                    __typename: 'HumanName'
                  },
                  {
                    use: 'en',
                    firstNames: '',
                    familyName: 'Hassan',
                    __typename: 'HumanName'
                  }
                ],
                nationality: ['BGD'],
                birthDate: null,
                telecom: [
                  {
                    system: 'phone',
                    value: '01711111111',
                    __typename: 'ContactPoint'
                  }
                ],
                address: [
                  {
                    type: 'CURRENT',
                    line: [
                      '',
                      '',
                      '',
                      '',
                      '',
                      '7586378c-c1ec-455e-9338-13320b84bf4c'
                    ],
                    district: '3967a79b-fd87-4ccf-99c5-2ecfeeb87f28',
                    state: '2b981ef4-1466-4f17-b325-48c50f6cd23b',
                    postalCode: null,
                    country: 'BGD',
                    __typename: 'Address'
                  },
                  {
                    type: 'PERMANENT',
                    line: [
                      '',
                      '',
                      '',
                      '',
                      '',
                      '7586378c-c1ec-455e-9338-13320b84bf4c'
                    ],
                    district: '3967a79b-fd87-4ccf-99c5-2ecfeeb87f28',
                    state: '2b981ef4-1466-4f17-b325-48c50f6cd23b',
                    postalCode: null,
                    country: 'BGD',
                    __typename: 'Address'
                  }
                ],
                __typename: 'Person'
              },
              __typename: 'RelatedPerson'
            },
            registration: {
              id: '1103c801-eded-4051-ba74-c3db4b036aa4',
              attachments: [],
              status: [
                {
                  comments: null,
                  location: {
                    name: 'Moktarpur',
                    alias: ['মোক্তারপুর'],
                    __typename: 'Location'
                  },
                  office: {
                    name: 'Moktarpur Union Parishad',
                    alias: ['মোক্তারপুর ইউনিয়ন পরিষদ'],
                    address: {
                      district: 'Gazipur',
                      state: 'Dhaka',
                      __typename: 'Address'
                    },
                    __typename: 'Location'
                  },
                  __typename: 'RegWorkflow'
                },
                {
                  comments: null,
                  location: {
                    name: 'Moktarpur',
                    alias: ['মোক্তারপুর'],
                    __typename: 'Location'
                  },
                  office: {
                    name: 'Moktarpur Union Parishad',
                    alias: ['মোক্তারপুর ইউনিয়ন পরিষদ'],
                    address: {
                      district: 'Gazipur',
                      state: 'Dhaka',
                      __typename: 'Address'
                    },
                    __typename: 'Location'
                  },
                  __typename: 'RegWorkflow'
                },
                {
                  comments: null,
                  location: {
                    name: 'Moktarpur',
                    alias: ['মোক্তারপুর'],
                    __typename: 'Location'
                  },
                  office: {
                    name: 'Moktarpur Union Parishad',
                    alias: ['মোক্তারপুর ইউনিয়ন পরিষদ'],
                    address: {
                      district: 'Gazipur',
                      state: 'Dhaka',
                      __typename: 'Address'
                    },
                    __typename: 'Location'
                  },
                  __typename: 'RegWorkflow'
                }
              ],
              type: 'DEATH',
              trackingId: 'D9GVFNO',
              registrationNumber: '2019333494D9GVFNO2',
              __typename: 'Registration'
            },
            eventLocation: {
              id: '330f3d98-bb84-4cef-ac0c-dd7dfeb50476',
              type: 'PERMANENT',
              address: {
                type: 'PERMANENT',
                line: [
                  '',
                  '',
                  '',
                  '',
                  '',
                  '587c9bf9-7aa1-4103-ae15-2f5ccfababc1'
                ],
                district: '3967a79b-fd87-4ccf-99c5-2ecfeeb87f28',
                state: '2b981ef4-1466-4f17-b325-48c50f6cd23b',
                postalCode: null,
                country: 'BGD',
                __typename: 'Address'
              },
              __typename: 'Location'
            },
            mannerOfDeath: 'NATURAL_CAUSES',
            causeOfDeathMethod: null,
            causeOfDeath: null,
            __typename: 'DeathRegistration'
          }
        }
      }
    }
  ]
  let component: ReactWrapper<{}, {}>

  beforeEach(async () => {
    const testComponent = createTestComponent(
      <ReviewCertificateAction
        location={mockLocation}
        history={history}
        staticContext={mockLocation}
        match={{
          params: {
            registrationId: 'asdhdqe2472487jsdfsdf',
            eventType: 'DEATH'
          },
          isExact: true,
          path: '',
          url: ''
        }}
      />,
      store,
      graphqlMock
    )
    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 500)
    })
    testComponent.component.update()

    component = testComponent.component
  })

  it('Should display have the Confirm And print Button', () => {
    const confirmBtnExist = !!component.find('#confirm-print').hostNodes()
      .length
    expect(confirmBtnExist).toBe(true)
  })

  it('Should show the Confirm Print Modal', () => {
    const confirmBtn = component.find('#confirm-print').hostNodes()
    confirmBtn.simulate('click')
    component.update()
    const modalIsDisplayed = !!component
      .find('#confirm-print-modal')
      .hostNodes().length
    expect(modalIsDisplayed).toBe(true)
  })

  it('Should close the modal on clicking the print the button', async () => {
    const confirmBtn = await waitForElement(component, '#confirm-print')
    confirmBtn.hostNodes().simulate('click')
    component.update()

    component
      .find('#print-certificate')
      .hostNodes()
      .simulate('click')
    component.update()

    const modalIsClosed = !!component.find('#confirm-print-modal').hostNodes()
      .length

    expect(modalIsClosed).toBe(false)
  })
})

describe('when user wants to review birth certificate', () => {
  const { store, history } = createStore()
  const mockLocation: any = jest.fn()
  const graphqlMock = [
    {
      request: {
        query: GET_BIRTH_REGISTRATION_FOR_CERTIFICATE,
        variables: { id: 'asdhdqe2472487jsdfsdf' }
      },
      result: {
        data: {
          fetchBirthRegistration: {
            _fhirIDMap: {
              composition: '4f7aef51-3a2b-483d-9a73-96021fe9b68d',
              encounter: '7216e5e7-9ecf-4bbd-a394-6dbdde14b747',
              observation: {
                presentAtBirthRegistration:
                  '3419f6d4-096c-4743-9690-1b8e20226e7e'
              }
            },
            id: '4f7aef51-3a2b-483d-9a73-96021fe9b68d',
            child: {
              id: '523cc77e-7714-47a6-b4cd-ec0b51182c07',
              name: [
                {
                  use: 'bn',
                  firstNames: '',
                  familyName: 'হাসান',
                  __typename: 'HumanName'
                },
                {
                  use: 'en',
                  firstNames: '',
                  familyName: 'Hassan',
                  __typename: 'HumanName'
                }
              ],
              birthDate: '2018-11-11',
              gender: 'male',
              __typename: 'Person'
            },
            mother: {
              id: '12c955a7-3850-4392-8ffb-62bd704c888e',
              name: [
                {
                  use: 'bn',
                  firstNames: '',
                  familyName: 'হাসান',
                  __typename: 'HumanName'
                },
                {
                  use: 'en',
                  firstNames: '',
                  familyName: 'Hassan',
                  __typename: 'HumanName'
                }
              ],
              birthDate: null,
              maritalStatus: 'MARRIED',
              dateOfMarriage: null,
              educationalAttainment: null,
              nationality: ['BGD'],
              multipleBirth: 1,
              identifier: [
                {
                  id: '1111111111111',
                  type: 'NATIONAL_ID',
                  otherType: null,
                  __typename: 'IdentityType'
                }
              ],
              address: [
                {
                  type: 'PERMANENT',
                  line: [
                    '',
                    '',
                    '',
                    '',
                    '',
                    '587c9bf9-7aa1-4103-ae15-2f5ccfababc1'
                  ],
                  district: '3967a79b-fd87-4ccf-99c5-2ecfeeb87f28',
                  state: '2b981ef4-1466-4f17-b325-48c50f6cd23b',
                  postalCode: null,
                  country: 'BGD',
                  __typename: 'Address'
                },
                {
                  type: 'CURRENT',
                  line: [
                    '',
                    '',
                    '',
                    '',
                    '',
                    '587c9bf9-7aa1-4103-ae15-2f5ccfababc1'
                  ],
                  district: '3967a79b-fd87-4ccf-99c5-2ecfeeb87f28',
                  state: '2b981ef4-1466-4f17-b325-48c50f6cd23b',
                  postalCode: null,
                  country: 'BGD',
                  __typename: 'Address'
                }
              ],
              telecom: null,
              __typename: 'Person'
            },
            father: null,
            registration: {
              id: 'a71f9bc1-6e83-49fa-a3f4-0df0691411c5',
              contact: 'MOTHER',
              contactPhoneNumber: '01711111111',
              attachments: [],
              status: [
                {
                  comments: null,
                  location: {
                    name: 'Moktarpur',
                    alias: ['মোক্তারপুর'],
                    __typename: 'Location'
                  },
                  office: {
                    name: 'Moktarpur Union Parishad',
                    alias: ['মোক্তারপুর ইউনিয়ন পরিষদ'],
                    address: {
                      district: 'Gazipur',
                      state: 'Dhaka',
                      __typename: 'Address'
                    },
                    __typename: 'Location'
                  },
                  __typename: 'RegWorkflow'
                },
                {
                  comments: null,
                  location: {
                    name: 'Moktarpur',
                    alias: ['মোক্তারপুর'],
                    __typename: 'Location'
                  },
                  office: {
                    name: 'Moktarpur Union Parishad',
                    alias: ['মোক্তারপুর ইউনিয়ন পরিষদ'],
                    address: {
                      district: 'Gazipur',
                      state: 'Dhaka',
                      __typename: 'Address'
                    },
                    __typename: 'Location'
                  },
                  __typename: 'RegWorkflow'
                },
                {
                  comments: null,
                  location: {
                    name: 'Moktarpur',
                    alias: ['মোক্তারপুর'],
                    __typename: 'Location'
                  },
                  office: {
                    name: 'Moktarpur Union Parishad',
                    alias: ['মোক্তারপুর ইউনিয়ন পরিষদ'],
                    address: {
                      district: 'Gazipur',
                      state: 'Dhaka',
                      __typename: 'Address'
                    },
                    __typename: 'Location'
                  },
                  __typename: 'RegWorkflow'
                }
              ],
              trackingId: 'BOHQBZG',
              registrationNumber: '2019333494BOHQBZG5',
              __typename: 'Registration'
            },
            attendantAtBirth: null,
            weightAtBirth: null,
            birthType: null,
            eventLocation: null,
            presentAtBirthRegistration: 'MOTHER',
            __typename: 'BirthRegistration'
          }
        }
      }
    }
  ]

  let component: ReactWrapper<{}, {}>

  beforeEach(async () => {
    const testComponent = createTestComponent(
      <ReviewCertificateAction
        location={mockLocation}
        history={history}
        staticContext={mockLocation}
        match={{
          params: {
            registrationId: 'asdhdqe2472487jsdfsdf',
            eventType: 'BIRTH'
          },
          isExact: true,
          path: '',
          url: ''
        }}
      />,
      store,
      graphqlMock
    )
    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 500)
    })
    testComponent.component.update()

    component = testComponent.component
  })

  it('Should display have the Confirm And print Button', () => {
    const confirmBtnExist = !!component.find('#confirm-print').hostNodes()
      .length
    expect(confirmBtnExist).toBe(true)
  })
})

import {
  PrintCertificateAction,
  getFullName
} from '@register/views/PrintCertificate/PrintCertificateAction'
import { GET_BIRTH_REGISTRATION_FOR_CERTIFICATE } from '@register/views/DataProvider/birth/queries'
import { createTestComponent } from '@register/tests/util'
import { createStore } from '@register/store'
import * as React from 'react'

import { FormFieldGenerator } from '@register/components/form'
import { collectBirthCertificateFormSection } from '@register/forms/certificate/fieldDefinitions/collector-section'
import {
  IInformativeRadioGroupFormField,
  INFORMATIVE_RADIO_GROUP
} from '@register/forms'
import { ReactWrapper } from 'enzyme'
import { ParentDetails } from '@register/views/PrintCertificate/ParentDetails'
import { InformativeRadioGroup } from '@register/views/PrintCertificate/InformativeRadioGroup'
import { conditionals } from '@register/forms/utils'
import { paymentFormSection } from '@register/forms/certificate/fieldDefinitions/payment-section'
// TODO:  Certificate generation fails.  Once we fix that we can resolve these tests
// import { certificatePreview } from '@register/forms/certificate/fieldDefinitions/preview-section'
import { identityNameMapper } from '@register/forms/identity'

describe('when user wants to print certificate', () => {
  const { store, history } = createStore()
  const mock: () => void = jest.fn()
  const mockLocation: any = jest.fn()

  it('renders fields after successful graphql query', async () => {
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
                composition: '369fba87-12af-4428-8ced-21e9a3838159',
                encounter: '8d308b0d-c460-438c-b06c-5b30931d3812',
                eventLocation: '8d308b0d-c460-438c-b06c-5b30931d3123',
                observation: {
                  birthType: 'd8b0e465-28b5-43bf-bcc9-1cf53b3736b8',
                  attendantAtBirth: '3440b511-4b47-47bf-bf4a-3c9d96a4da36'
                }
              },
              id: '369fba87-12af-4428-8ced-21e9a3838159',
              child: {
                id: 'aedbe50f-dec4-4134-8e84-a4e74700f02b',
                name: [
                  {
                    use: 'bn',
                    firstNames: 'ফাহিম',
                    familyName: 'মাশরুর',
                    __typename: 'HumanName'
                  },
                  {
                    use: 'en',
                    firstNames: 'Fahim',
                    familyName: 'Mashrur',
                    __typename: 'HumanName'
                  }
                ],
                birthDate: '2018-02-16',
                gender: 'male',
                __typename: 'Person'
              },
              mother: {
                id: '8baa73b4-6c31-4e7e-8c12-413159c0467f',
                name: [
                  {
                    use: 'bn',
                    firstNames: '',
                    familyName: 'মাশরুর',
                    __typename: 'HumanName'
                  },
                  {
                    use: 'en',
                    firstNames: '',
                    familyName: 'Mashrur',
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
                    id: '123',
                    type: 'PASSPORT',
                    otherType: '',
                    __typename: 'IdentityType'
                  }
                ],
                address: [
                  {
                    type: 'PERMANENT',
                    line: [
                      '2015',
                      '',
                      '',
                      '2b74f5ee-fb3d-4a2c-9b93-beb36e3850ff',
                      '',
                      '5518aef0-1d67-46cd-97c5-d46e9a44732a'
                    ],
                    district: 'c5c14965-c754-4d62-bdf5-008e30ca57e8',
                    state: '843ba812-e05f-4fc1-8276-a135a47225be',
                    postalCode: null,
                    country: 'BGD',
                    __typename: 'Address'
                  },
                  {
                    type: 'CURRENT',
                    line: [
                      '2015',
                      '',
                      '',
                      '2b74f5ee-fb3d-4a2c-9b93-beb36e3850ff',
                      '',
                      '5518aef0-1d67-46cd-97c5-d46e9a44732a'
                    ],
                    district: 'c5c14965-c754-4d62-bdf5-008e30ca57e8',
                    state: '843ba812-e05f-4fc1-8276-a135a47225be',
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
                id: '6e10ee71-24c8-446a-a6b1-09c62330a975',
                contact: null,
                contactPhoneNumber: '01712345678',
                attachments: null,
                status: [
                  {
                    comments: null,

                    location: {
                      id: '123',
                      name: 'Kaliganj Union Sub Center',
                      alias: ['']
                    },
                    office: {
                      id: '123',
                      name: 'Kaliganj Union Sub Center',
                      alias: [''],
                      address: {
                        district: '7876',
                        state: 'iuyiuy'
                      }
                    },
                    __typename: 'RegWorkflow'
                  }
                ],
                trackingId: 'B48RKLD',
                registrationNumber: '2019333494B48RKLD2',
                __typename: 'Registration'
              },
              attendantAtBirth: null,
              weightAtBirth: null,
              birthType: null,
              eventLocation: {
                address: {
                  country: 'BGD',
                  state: 'state4',
                  district: 'district2',
                  postalCode: '',
                  line: ['Rd #10', '', 'Akua', 'union1', '', 'upazila10'],
                  postCode: '1020'
                },
                type: 'PRIVATE_HOME',
                partOf: 'Location/upazila10'
              },
              presentAtBirthRegistration: null,
              __typename: 'BirthRegistration'
            }
          }
        }
      }
    ]

    const testComponent = createTestComponent(
      <PrintCertificateAction
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
      setTimeout(resolve, 0)
    })

    testComponent.component.update()
    const fields = collectBirthCertificateFormSection.fields
    ;(fields[1] as IInformativeRadioGroupFormField).information = {
      // @ts-ignore
      name: [
        {
          firstNames: 'মা',
          familyName: 'নাম'
        },
        {
          firstNames: 'Mother',
          familyName: 'Name'
        }
      ],
      // @ts-ignore
      identifier: [
        {
          id: '4564',
          type: 'NATIONAL_ID'
        }
      ],
      birthDate: '1960-08-18',
      nationality: ['BGD']
    }
    ;(fields[2] as IInformativeRadioGroupFormField).information = {
      // @ts-ignore
      name: [
        {
          firstNames: 'পিতা',
          familyName: 'নাম'
        },
        {
          firstNames: 'Father',
          familyName: 'Name'
        }
      ],
      // @ts-ignore
      identifier: [
        {
          id: '4564',
          type: 'NATIONAL_ID'
        }
      ],
      birthDate: '1955-08-18',
      nationality: ['BGD']
    }
    expect(
      testComponent.component.find(FormFieldGenerator).prop('fields')
    ).toEqual(fields)

    testComponent.component.unmount()
  })

  it('renders error message when there is an error in query', async () => {
    const graphqlMock = [
      {
        request: {
          query: GET_BIRTH_REGISTRATION_FOR_CERTIFICATE,
          variables: { id: '12345' }
        },
        result: {
          data: {
            fetchBirthRegistration: {
              id: '9aa15499-4d2f-48c6-9ced-b0b1b077bbb7',
              registration: {
                registrationNumber: '485736202837'
              },
              child: {
                birthDate: '2014-02-15'
              },
              mother: {
                name: [
                  {
                    firstNames: 'মা',
                    familyName: 'নাম'
                  },
                  {
                    firstNames: 'Mother',
                    familyName: 'Name'
                  }
                ],
                identifier: [
                  {
                    id: '4564',
                    type: 'NATIONAL_ID'
                  }
                ],
                birthDate: '1960-08-18',
                nationality: ['BGD']
              },
              father: {
                name: [
                  {
                    firstNames: 'পিতা',
                    familyName: 'নাম'
                  },
                  {
                    firstNames: 'Father',
                    familyName: 'Name'
                  }
                ],
                identifier: [
                  {
                    id: '4564',
                    otherType: '',
                    type: 'NATIONAL_ID'
                  }
                ],
                birthDate: '1955-08-18',
                nationality: ['BGD']
              },
              createdAt: '2018-12-07T13:11:49.380Z'
            }
          }
        }
      }
    ]

    const testComponent = createTestComponent(
      <PrintCertificateAction
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
      setTimeout(resolve, 0)
    })

    testComponent.component.update()

    expect(
      testComponent.component
        .find('#print-certificate-queue-error-text')
        .hostNodes()
    ).toHaveLength(1)

    testComponent.component.unmount()
  })

  it('renders i18n idType', () => {
    expect(identityNameMapper('NATIONAL_ID')).toEqual({
      id: 'formFields.iDTypeNationalID',
      defaultMessage: 'National ID',
      description: 'Option for form field: Type of ID'
    })
    expect(identityNameMapper('PASSPORT')).toEqual({
      id: 'formFields.iDTypePassport',
      defaultMessage: 'Passport',
      description: 'Option for form field: Type of ID'
    })
    expect(identityNameMapper('DRIVING_LICENSE')).toEqual({
      id: 'formFields.iDTypeDrivingLicense',
      defaultMessage: 'Drivers License',
      description: 'Option for form field: Type of ID'
    })
    expect(identityNameMapper('BIRTH_REGISTRATION_NUMBER')).toEqual({
      id: 'formFields.iDTypeBRN',
      defaultMessage: 'Birth Registration Number',
      description: 'Option for form field: Type of ID'
    })
    expect(identityNameMapper('DEATH_REGISTRATION_NUMBER')).toEqual({
      id: 'formFields.iDTypeDRN',
      defaultMessage: 'Death Registration Number',
      description: 'Option for form field: Type of ID'
    })
    expect(identityNameMapper('REFUGEE_NUMBER')).toEqual({
      id: 'formFields.iDTypeRefugeeNumber',
      defaultMessage: 'Refugee Number',
      description: 'Option for form field: Type of ID'
    })
    expect(identityNameMapper('ALIEN_NUMBER')).toEqual({
      id: 'formFields.iDTypeAlienNumber',
      defaultMessage: 'Alien Number',
      description: 'Option for form field: Type of ID'
    })
    expect(identityNameMapper('UNKNOWN')).toEqual({
      id: 'formFields.iD',
      defaultMessage: 'ID Number',
      description: 'Label for form field: ID Number'
    })
  })

  it('renders parent details component', () => {
    const parentDetailsComponent = createTestComponent(
      <ParentDetails
        information={{
          name: [
            {
              firstNames: 'মা',
              familyName: 'নাম'
            },
            {
              firstNames: 'Mother',
              familyName: 'Name'
            }
          ],
          identifier: [
            {
              id: '4564',
              type: 'NATIONAL_ID'
            }
          ],
          birthDate: '1960-08-18',
          nationality: ['BGD']
        }}
      />,
      store
    )

    expect(
      parentDetailsComponent.component.find('#parent_details').hostNodes()
        .length
    ).toBe(1)
  })

  it('renders informative radio group component', () => {
    const id = 'informative_radio_group'
    const onChange = mock
    const onBlur = mock
    const value = true
    const touched = false
    const error = ''
    const informativeRadioGroupComponent = createTestComponent(
      <InformativeRadioGroup
        inputProps={{ id, onChange, onBlur, value, error: Boolean(error) }}
        inputFieldProps={{
          id,
          label: 'Informative radio group',
          touched,
          error
        }}
        value={true}
        // @ts-ignore
        fieldDefinition={{
          name: 'motherDetails',
          type: INFORMATIVE_RADIO_GROUP,
          label: 'Informative radio group',
          required: true,
          information: {
            name: [
              {
                firstNames: 'মা',
                familyName: 'নাম'
              },
              {
                firstNames: 'Mother',
                familyName: 'Name'
              }
            ],
            identifier: [
              {
                id: '4564',
                type: 'NATIONAL_ID'
              }
            ],
            birthDate: '1960-08-18',
            nationality: ['BGD']
          },
          validate: [],
          options: [
            { value: true, label: 'Confirm' },
            { value: false, label: 'Deny' }
          ],
          conditionals: [conditionals.motherCollectsCertificate]
        }}
        onSetFieldValue={mock}
      />,
      store
    )

    expect(informativeRadioGroupComponent.component.exists()).toBe(true)
  })

  describe('when user interacts', () => {
    let component: ReactWrapper<{}, {}>

    beforeEach(async () => {
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
                  composition: '369fba87-12af-4428-8ced-21e9a3838159',
                  encounter: '8d308b0d-c460-438c-b06c-5b30931d3812',
                  eventLocation: '8d308b0d-c460-438c-b06c-5b30931d3123',
                  observation: {
                    birthType: 'd8b0e465-28b5-43bf-bcc9-1cf53b3736b8',
                    attendantAtBirth: '3440b511-4b47-47bf-bf4a-3c9d96a4da36'
                  }
                },
                id: '369fba87-12af-4428-8ced-21e9a3838159',
                child: {
                  id: 'aedbe50f-dec4-4134-8e84-a4e74700f02b',
                  name: [
                    {
                      use: 'bn',
                      firstNames: 'ফাহিম',
                      familyName: 'মাশরুর',
                      __typename: 'HumanName'
                    },
                    {
                      use: 'en',
                      firstNames: 'Fahim',
                      familyName: 'Mashrur',
                      __typename: 'HumanName'
                    }
                  ],
                  birthDate: '2018-02-16',
                  gender: 'male',
                  __typename: 'Person'
                },
                mother: {
                  id: '8baa73b4-6c31-4e7e-8c12-413159c0467f',
                  name: [
                    {
                      use: 'bn',
                      firstNames: '',
                      familyName: 'মাশরুর',
                      __typename: 'HumanName'
                    },
                    {
                      use: 'en',
                      firstNames: '',
                      familyName: 'Mashrur',
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
                      id: '123',
                      type: 'PASSPORT',
                      otherType: '',
                      __typename: 'IdentityType'
                    }
                  ],
                  address: [
                    {
                      type: 'PERMANENT',
                      line: [
                        '2015',
                        '',
                        '',
                        '2b74f5ee-fb3d-4a2c-9b93-beb36e3850ff',
                        '',
                        '5518aef0-1d67-46cd-97c5-d46e9a44732a'
                      ],
                      district: 'c5c14965-c754-4d62-bdf5-008e30ca57e8',
                      state: '843ba812-e05f-4fc1-8276-a135a47225be',
                      postalCode: null,
                      country: 'BGD',
                      __typename: 'Address'
                    },
                    {
                      type: 'CURRENT',
                      line: [
                        '2015',
                        '',
                        '',
                        '2b74f5ee-fb3d-4a2c-9b93-beb36e3850ff',
                        '',
                        '5518aef0-1d67-46cd-97c5-d46e9a44732a'
                      ],
                      district: 'c5c14965-c754-4d62-bdf5-008e30ca57e8',
                      state: '843ba812-e05f-4fc1-8276-a135a47225be',
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
                  id: '6e10ee71-24c8-446a-a6b1-09c62330a975',
                  contact: null,
                  contactPhoneNumber: '01712345678',
                  attachments: null,
                  status: [
                    {
                      comments: null,

                      location: {
                        id: '123',
                        name: 'Kaliganj Union Sub Center',
                        alias: ['']
                      },
                      office: {
                        id: '123',
                        name: 'Kaliganj Union Sub Center',
                        alias: [''],
                        address: {
                          district: '7876',
                          state: 'iuyiuy'
                        }
                      },
                      __typename: 'RegWorkflow'
                    }
                  ],
                  trackingId: 'B48RKLD',
                  registrationNumber: '2019333494B48RKLD2',
                  __typename: 'Registration'
                },
                attendantAtBirth: null,
                weightAtBirth: null,
                birthType: null,
                eventLocation: {
                  address: {
                    country: 'BGD',
                    state: 'state4',
                    district: 'district2',
                    postalCode: '',
                    line: ['Rd #10', '', 'Akua', 'union1', '', 'upazila10'],
                    postCode: '1020'
                  },
                  type: 'PRIVATE_HOME',
                  partOf: 'Location/upazila10'
                },
                presentAtBirthRegistration: null,
                __typename: 'BirthRegistration'
              }
            }
          }
        }
      ]

      const testComponent = createTestComponent(
        <PrintCertificateAction
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
        setTimeout(resolve, 0)
      })

      testComponent.component.update()
      component = testComponent.component
    })

    afterAll(() => {
      component.unmount()
    })

    it('renders the form', () => {
      const fields = collectBirthCertificateFormSection.fields
      ;(fields[1] as IInformativeRadioGroupFormField).information = {
        // @ts-ignore
        name: [
          {
            firstNames: 'মা',
            familyName: 'নাম'
          },
          {
            firstNames: 'Mother',
            familyName: 'Name'
          }
        ],
        // @ts-ignore
        identifier: [
          {
            id: '4564',
            type: 'PASSPORT'
          }
        ],
        birthDate: '1960-08-18',
        nationality: ['BGD']
      }
      ;(fields[2] as IInformativeRadioGroupFormField).information = {
        // @ts-ignore
        name: [
          {
            firstNames: 'পিতা',
            familyName: 'নাম'
          },
          {
            firstNames: 'Father',
            familyName: 'Name'
          }
        ],
        // @ts-ignore
        identifier: [
          {
            id: '4564',
            type: 'BIRTH_REGISTRATION_NUMBER'
          }
        ],
        birthDate: '1955-08-18',
        nationality: ['BGD']
      }
      expect(component.find(FormFieldGenerator).prop('fields')).toEqual(fields)
    })

    it('confirm button is not rendered at first', () => {
      expect(component.find('#print-confirm-button').hostNodes()).toHaveLength(
        0
      )
    })

    it('when mother is selected, confirm button is rendered but disabled at first', () => {
      const documentData = {
        personCollectingCertificate: 'MOTHER',
        motherDetails: ''
      }
      component.find(FormFieldGenerator).prop('onChange')(documentData)
      component.update()
      expect(
        component
          .find('#print-confirm-button')
          .hostNodes()
          .prop('disabled')
      ).toBe(true)
    })

    it('when mother has answered all questions, enables confirm button', () => {
      const documentData = {
        personCollectingCertificate: 'MOTHER',
        motherDetails: true
      }
      component.find(FormFieldGenerator).prop('onChange')(documentData)
      component.update()
      expect(
        component
          .find('#print-confirm-button')
          .hostNodes()
          .prop('disabled')
      ).toBe(false)
    })

    it('when father has answered all questions, enables confirm button', () => {
      const documentData = {
        personCollectingCertificate: 'FATHER',
        fatherDetails: true
      }
      component.find(FormFieldGenerator).prop('onChange')(documentData)
      component.update()
      expect(
        component
          .find('#print-confirm-button')
          .hostNodes()
          .prop('disabled')
      ).toBe(false)
    })

    it('when other person has answered all questions, enables confirm button', () => {
      const documentData = {
        personCollectingCertificate: 'OTHER',
        otherPersonGivenNames: 'John',
        otherPersonFamilyName: 'Doe',
        otherPersonIDType: 'NATIONAL_ID',
        documentNumber: '1234567890987',
        otherPersonSignedAffidavit: true
      }
      component.find(FormFieldGenerator).prop('onChange')(documentData)
      component.update()
      expect(
        component
          .find('#print-confirm-button')
          .hostNodes()
          .prop('disabled')
      ).toBe(false)
    })

    it('when user clicks confirm button, renders payment form', () => {
      const documentData = {
        personCollectingCertificate: 'MOTHER',
        motherDetails: true
      }
      component.find(FormFieldGenerator).prop('onChange')(documentData)
      component.update()

      component
        .find('#print-confirm-button')
        .hostNodes()
        .simulate('click')

      component.update()
      const fields = paymentFormSection.fields

      fields[2].initialValue = '50.00'
      fields[3].initialValue = '24'
      expect(component.find(FormFieldGenerator).prop('fields')).toEqual(fields)
    })

    // TODO:  Certificate generation fails.  Once we fix that we can resolve these tests
    /*it('when user clicks next button, renders certificate preview form', async () => {
      const documentData = {
        personCollectingCertificate: 'MOTHER',
        motherDetails: true
      }

      component.find(FormFieldGenerator).prop('onChange')(documentData)
      component.update()

      component
        .find('#print-confirm-button')
        .hostNodes()
        .simulate('click')

      component.update()

      expect(
        component.find('#payment-confirm-button').hostNodes()
      ).toHaveLength(1)
      component
        .find('#payment-confirm-button')
        .hostNodes()
        .simulate('click')
      component.update()

      expect(component.find(FormFieldGenerator).prop('fields')).toEqual(
        certificatePreview.fields
      )
    })

    it('Should generate the PDF', () => {
      const documentData = {
        personCollectingCertificate: 'MOTHER',
        motherDetails: true
      }
      component.find(FormFieldGenerator).prop('onChange')(documentData)
      component.update()

      component
        .find('#print-confirm-button')
        .hostNodes()
        .simulate('click')

      component.update()
      const fields = paymentFormSection.fields

      fields[2].initialValue = '50.00'
      fields[3].initialValue = '24'
      expect(component.find(FormFieldGenerator).prop('fields')).toEqual(fields)

      const PrintReceiptBtn = component.find('#print-receipt').hostNodes()
      expect(PrintReceiptBtn.length).toEqual(1)

      const globalAny: any = global
      globalAny.open = jest.fn()
      PrintReceiptBtn.simulate('click')
      expect(globalAny.open).toBeCalled()
    })*/
  })

  describe('When testing PrintCertificateAction utility method', () => {
    it('Should return fullname object', () => {
      const certificateDetails = {
        registrationNo: 'string',
        name: {
          en: 'John',
          bn: 'হাসাইন'
        },
        doe: {
          en: '',
          bn: ''
        },
        registrationLocation: {
          en: '',
          bn: ''
        },
        eventLocation: {
          en: '',
          bn: ''
        },
        event: 'death'
      }
      const result = getFullName(certificateDetails)
      expect(result).toEqual({ fullNameInBn: 'হাসাইন', fullNameInEng: 'John' })
    })
  })
})

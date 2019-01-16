import {
  FETCH_BIRTH_REGISTRATION_QUERY,
  PrintCertificateAction
} from './PrintCertificateAction'
import { createTestComponent } from 'src/tests/util'
import { createStore } from 'src/store'
import * as React from 'react'

import { FormFieldGenerator } from 'src/components/form'
import { collectCertificateFormSection } from './print-certificate'
import {
  IInformativeRadioGroupFormField,
  INFORMATIVE_RADIO_GROUP
} from 'src/forms'
import { ReactWrapper } from 'enzyme'
import { iDType, ParentDetails } from './ParentDetails'
import { InformativeRadioGroup } from './InformativeRadioGroup'
import { conditionals } from 'src/forms/utils'
import { paymentFormSection } from './payment-section'
import { certificatePreview } from './certificate-preview'
import { calculateDays, timeElapsed } from './calculatePrice'

describe('when user wants to print certificate', async () => {
  const { store } = createStore()
  const mock: () => void = jest.fn()
  const formSection = store.getState().printCertificateForm
    .collectCertificateFrom

  it('renders fields after successful graphql query', async () => {
    const graphqlMock = [
      {
        request: {
          query: FETCH_BIRTH_REGISTRATION_QUERY,
          variables: { id: 'asdhdqe2472487jsdfsdf' }
        },
        result: {
          data: {
            fetchBirthRegistration: {
              id: '9aa15499-4d2f-48c6-9ced-b0b1b077bbb7',
              child: {
                name: [
                  {
                    use: 'en',
                    firstNames: 'Mokbul',
                    familyName: 'Islam'
                  },
                  {
                    use: 'bn',
                    firstNames: 'নাম',
                    familyName: 'নাম'
                  }
                ],
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
        backLabel="Back"
        title="Print certificate"
        registrationId="asdhdqe2472487jsdfsdf"
        togglePrintCertificateSection={mock}
        printCertificateFormSection={formSection}
        IssuerDetails={{
          name: 'Some name',
          role: 'Registrar',
          issuedAt: 'some location'
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
    const fields = collectCertificateFormSection.fields
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
          query: FETCH_BIRTH_REGISTRATION_QUERY,
          variables: { id: '12345' }
        },
        result: {
          data: {
            fetchBirthRegistration: {
              id: '9aa15499-4d2f-48c6-9ced-b0b1b077bbb7',
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
        backLabel="Back"
        title="Print certificate"
        registrationId="asdhdqe2472487jsdfsdf"
        togglePrintCertificateSection={mock}
        printCertificateFormSection={formSection}
        IssuerDetails={{
          name: '',
          role: '',
          issuedAt: ''
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
    expect(iDType('NATIONAL_ID')).toEqual({
      id: 'formFields.iDTypeNationalID',
      defaultMessage: 'National ID',
      description: 'Option for form field: Type of ID'
    })
    expect(iDType('PASSPORT')).toEqual({
      id: 'formFields.iDTypePassport',
      defaultMessage: 'Passport',
      description: 'Option for form field: Type of ID'
    })
    expect(iDType('BIRTH_REGISTRATION_NUMBER')).toEqual({
      id: 'formFields.iDTypeBRN',
      defaultMessage: 'Birth Registration Number',
      description: 'Option for form field: Type of ID'
    })
    expect(iDType('DEATH_REGISTRATION_NUMBER')).toEqual({
      id: 'formFields.iDTypeDRN',
      defaultMessage: 'Death Registration Number',
      description: 'Option for form field: Type of ID'
    })
    expect(iDType('REFUGEE_NUMBER')).toEqual({
      id: 'formFields.iDTypeRefugeeNumber',
      defaultMessage: 'Refugee Number',
      description: 'Option for form field: Type of ID'
    })
    expect(iDType('ALIEN_NUMBER')).toEqual({
      id: 'formFields.iDTypeAlienNumber',
      defaultMessage: 'Alien Number',
      description: 'Option for form field: Type of ID'
    })
    expect(iDType('UNKNOWN')).toEqual({
      id: 'formFields.iD',
      defaultMessage: 'NID number',
      description: 'Label for form field: NID number'
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

  describe('when user interacts', async () => {
    let component: ReactWrapper<{}, {}>

    beforeEach(async () => {
      const graphqlMock = [
        {
          request: {
            query: FETCH_BIRTH_REGISTRATION_QUERY,
            variables: { id: 'asdhdqe2472487jsdfsdf' }
          },
          result: {
            data: {
              fetchBirthRegistration: {
                id: '9aa15499-4d2f-48c6-9ced-b0b1b077bbb7',
                child: {
                  name: [
                    {
                      use: 'en',
                      firstNames: 'Mokbul',
                      familyName: 'Islam'
                    },
                    {
                      use: 'bn',
                      firstNames: 'নাম',
                      familyName: 'নাম'
                    }
                  ],
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
                      type: 'PASSPORT'
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
                      type: 'BIRTH_REGISTRATION_NUMBER'
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
          backLabel="Back"
          title="Print certificate"
          registrationId="asdhdqe2472487jsdfsdf"
          togglePrintCertificateSection={mock}
          printCertificateFormSection={formSection}
          IssuerDetails={{
            name: '',
            role: '',
            issuedAt: ''
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
      const fields = collectCertificateFormSection.fields
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
        documentNumber: '2345',
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

    it('when user clicks next button, renders certificate preview form', () => {
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
    it('timeElapsedInWords function returns required time duration in words', () => {
      Date.now = jest.fn(() => new Date('2019-01-01'))

      let days = calculateDays('2018-08-18')

      let time = timeElapsed(days)
      expect(time.value).toBe(4)
      expect(time.unit).toBe('Month')
      days = calculateDays('2018-12-16')
      time = timeElapsed(days)
      expect(time.value).toBe(16)
      expect(time.unit).toBe('Day')

      let error
      try {
        calculateDays('16-12-2018')
      } catch (e) {
        error = e
      }
      expect(error).toBeInstanceOf(Error)
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
    })
  })
})

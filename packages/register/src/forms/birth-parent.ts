import { IForm } from './'
import { defineMessages } from 'react-intl'
import { countries, states, districts } from './addressData'

export const messages = defineMessages({
  childTab: {
    id: 'register.form.tabs.childTab',
    defaultMessage: 'Child',
    description: 'Tab title for Child'
  },
  childTitle: {
    id: 'register.form.section.childTitle',
    defaultMessage: "Child's details",
    description: 'Form section title for Child'
  },
  motherTab: {
    id: 'register.form.tabs.motherTab',
    defaultMessage: 'Mother',
    description: 'Tab title for Mother'
  },
  motherTitle: {
    id: 'register.form.section.motherTitle',
    defaultMessage: "Mother's details",
    description: 'Form section title for Mother'
  },
  fatherTab: {
    id: 'register.form.tabs.fatherTab',
    defaultMessage: 'Father',
    description: 'Tab title for Father'
  },
  fatherTitle: {
    id: 'register.form.section.fatherTitle',
    defaultMessage: "Father's details",
    description: 'Form section title for Father'
  },
  informantTab: {
    id: 'register.form.tabs.informantTab',
    defaultMessage: 'Informant',
    description: 'Tab title for Informant'
  },
  informantTitle: {
    id: 'register.form.section.informantTitle',
    defaultMessage: "Informant's details",
    description: 'Form section title for Informant'
  },
  registrationTab: {
    id: 'register.form.tabs.registrationTab',
    defaultMessage: 'Registration',
    description: 'Tab title for Registration'
  },
  registrationTitle: {
    id: 'register.form.section.registrationTitle',
    defaultMessage: 'Registration',
    description: 'Form section title for Registration'
  },
  documentsTab: {
    id: 'register.form.tabs.documentsTab',
    defaultMessage: 'Documents',
    description: 'Tab title for Documents'
  },
  documentsTitle: {
    id: 'register.form.section.documentsTitle',
    defaultMessage: 'Documents',
    description: 'Form section title for Documents'
  },
  previewTab: {
    id: 'register.form.tabs.previewTab',
    defaultMessage: 'Preview',
    description: 'Tab title for Preview'
  },
  previewTitle: {
    id: 'register.form.section.previewTitle',
    defaultMessage: 'Preview',
    description: 'Form section title for Preview'
  },
  childGivenName: {
    id: 'formFields.childGivenName',
    defaultMessage: 'Given name',
    description: 'Label for form field: Given name'
  },
  childMiddleNames: {
    id: 'formFields.childMiddleNames',
    defaultMessage: 'Middle name(s)',
    description: 'Label for form field: Middle names'
  },
  childFamilyName: {
    id: 'formFields.childFamilyName',
    defaultMessage: 'Family name',
    description: 'Label for form field: Family name'
  },
  childGivenNameEng: {
    id: 'formFields.childGivenName',
    defaultMessage: 'Given name (in english)',
    description: 'Label for form field: Given name in english'
  },
  childMiddleNamesEng: {
    id: 'formFields.childMiddleNames',
    defaultMessage: 'Middle name(s) (in english)',
    description: 'Label for form field: Middle names in english'
  },
  childFamilyNameEng: {
    id: 'formFields.childFamilyName',
    defaultMessage: 'Family name (in english)',
    description: 'Label for form field: Family name in english'
  },
  childSex: {
    id: 'formFields.childSex',
    defaultMessage: 'Sex',
    description: 'Label for form field: Sex name'
  },
  childSexMale: {
    id: 'formFields.childSexMale',
    defaultMessage: 'Male',
    description: 'Option for form field: Sex name'
  },
  childSexFemale: {
    id: 'formFields.childSexFemale',
    defaultMessage: 'Female',
    description: 'Option for form field: Sex name'
  },
  childSexOther: {
    id: 'formFields.childSexOther',
    defaultMessage: 'Other',
    description: 'Option for form field: Sex name'
  },
  childSexUnknown: {
    id: 'formFields.childSexUnknown',
    defaultMessage: 'Unknown',
    description: 'Option for form field: Sex name'
  },
  childDateOfBirth: {
    id: 'formFields.childDateOfBirth',
    defaultMessage: 'Date of birth',
    description: 'Label for form field: Date of birth'
  },
  attendantAtBirth: {
    id: 'formFields.attendantAtBirth',
    defaultMessage: 'Attendant at birth',
    description: 'Label for form field: Attendant at birth'
  },
  attendantAtBirthPhysician: {
    id: 'formFields.attendantAtBirth',
    defaultMessage: 'Physician',
    description: 'Label for form field: Attendant at birth'
  },
  attendantAtBirthNurse: {
    id: 'formFields.attendantAtBirth',
    defaultMessage: 'Nurse',
    description: 'Label for form field: Attendant at birth'
  },
  attendantAtBirthNurseMidwife: {
    id: 'formFields.attendantAtBirth',
    defaultMessage: 'Nurse midwife',
    description: 'Label for form field: Attendant at birth'
  },
  attendantAtBirthMidwife: {
    id: 'formFields.attendantAtBirth',
    defaultMessage: 'Midwife',
    description: 'Label for form field: Attendant at birth'
  },
  attendantAtBirthOtherParamedicalPersonnel: {
    id: 'formFields.attendantAtBirth',
    defaultMessage: 'Other paramedical personnel',
    description: 'Label for form field: Attendant at birth'
  },
  attendantAtBirthLayperson: {
    id: 'formFields.attendantAtBirth',
    defaultMessage: 'Layperson',
    description: 'Label for form field: Attendant at birth'
  },
  attendantAtBirthNone: {
    id: 'formFields.attendantAtBirth',
    defaultMessage: 'None',
    description: 'Label for form field: Attendant at birth'
  },
  attendantAtBirthOther: {
    id: 'formFields.attendantAtBirth',
    defaultMessage: 'Other',
    description: 'Label for form field: Attendant at birth'
  },
  typeOfBirth: {
    id: 'formFields.typeOfBirth',
    defaultMessage: 'Type of birth',
    description: 'Label for form field: Type of birth'
  },
  typeOfBirthSingle: {
    id: 'formFields.typeOfBirth',
    defaultMessage: 'Single',
    description: 'Label for form field: Type of birth'
  },
  typeOfBirthTwin: {
    id: 'formFields.typeOfBirth',
    defaultMessage: 'Twin',
    description: 'Label for form field: Type of birth'
  },
  typeOfBirthTriplet: {
    id: 'formFields.typeOfBirth',
    defaultMessage: 'Triplet',
    description: 'Label for form field: Type of birth'
  },
  typeOfBirthQuadruplet: {
    id: 'formFields.typeOfBirth',
    defaultMessage: 'Quadruplet',
    description: 'Label for form field: Type of birth'
  },
  typeOfBirthHigherMultipleDelivery: {
    id: 'formFields.typeOfBirth',
    defaultMessage: 'Higher multiple delivery',
    description: 'Label for form field: Type of birth'
  },
  orderOfBirth: {
    id: 'formFields.orderOfBirth',
    defaultMessage: 'Order of birth (number)',
    description: 'Label for form field: Order of birth'
  },
  weightAtBirth: {
    id: 'formFields.weightAtBirth',
    defaultMessage: 'Weight at birth',
    description: 'Label for form field: Weight at birth'
  },
  placeOfDelivery: {
    id: 'formFields.placeOfDelivery',
    defaultMessage: 'Place of delivery',
    description: 'Label for form field: Place of delivery'
  },
  deliveryInstitution: {
    id: 'formFields.deliveryInstitution',
    defaultMessage: 'Type or select institution',
    description: 'Label for form field: Type or select institution'
  },
  deliveryAddress: {
    id: 'formFields.deliveryAddress',
    defaultMessage: 'Address of place of delivery',
    description: 'Label for form field: Address of place of delivery'
  },
  mothersFirstName: {
    id: 'formFields.mothersFirstName',
    defaultMessage: "Mother's first name",
    description: "Label for form field: Mother's first name"
  },
  defaultLabel: {
    id: 'formFields.defaultLabel',
    defaultMessage: 'Label goes here',
    description: 'default label'
  },
  fathersDetailsExist: {
    id: 'formFields.fathersDetailsExist',
    defaultMessage: "Do you have the father's details?",
    description: "Question to ask the user if they have the father's details"
  },
  confirm: {
    id: 'formFields.confirm',
    defaultMessage: 'Yes',
    description: 'confirmation label for yes / no radio button'
  },
  deny: {
    id: 'formFields.deny',
    defaultMessage: 'No',
    description: 'deny label for yes / no radio button'
  },
  currentAddress: {
    id: 'formFields.currentAddress',
    defaultMessage: 'Current Address',
    description: "Title for the father's address fields"
  },
  addressSameAsMother: {
    id: 'formFields.addressSameAsMother',
    defaultMessage: "Is the father's address the same as the mother's address?",
    description:
      "Title for the radio button to select that the father's address is the same as the mother's address"
  },
  country: {
    id: 'formFields.country',
    defaultMessage: 'Country',
    description: 'Title for the country select'
  },
  state: {
    id: 'formFields.state',
    defaultMessage: 'State',
    description: 'Title for the state select'
  },
  district: {
    id: 'formFields.district',
    defaultMessage: 'District',
    description: 'Title for the district select'
  },
  addressLine1: {
    id: 'formFields.addressLine1',
    defaultMessage: 'Address Line 1',
    description: 'Title for the address line 1'
  },
  addressLine2: {
    id: 'formFields.addressLine2',
    defaultMessage: 'Address Line 2',
    description: 'Title for the address line 2'
  },
  addressLine3: {
    id: 'formFields.addressLine3',
    defaultMessage: 'Address Line 3',
    description: 'Title for the address line 3'
  },
  addressLine4: {
    id: 'formFields.addressLine4',
    defaultMessage: 'Address Line 4',
    description: 'Title for the address line 4'
  },
  postCode: {
    id: 'formFields.postCode',
    defaultMessage: 'Postcode',
    description: 'Title for the postcode field'
  }
})

export interface IBirthParentFormData {
  child: {
    firstName: string
    foo: string
    bar: string
    baz: string
  }
  mother: {
    firstName: string
  }
}

export const birthParentForm: IForm = {
  sections: [
    {
      id: 'child',
      viewType: 'form',
      name: messages.childTab,
      title: messages.childTitle,
      fields: [
        {
          name: 'childGivenName',
          type: 'text',
          label: messages.childGivenName,
          required: true,
          initialValue: '',
          validate: []
        },
        {
          name: 'childMiddleNames',
          type: 'text',
          label: messages.childMiddleNames,
          required: false,
          initialValue: '',
          validate: []
        },
        {
          name: 'childFamilyName',
          type: 'text',
          label: messages.childFamilyName,
          validate: []
        },
        {
          name: 'childGivenNameEng',
          type: 'text',
          label: messages.childGivenNameEng,
          required: true,
          validate: []
        },
        {
          name: 'childMiddleNamesEng',
          type: 'text',
          label: messages.childMiddleNamesEng,
          required: false,
          initialValue: '',
          validate: []
        },
        {
          name: 'childFamilyNameEng',
          type: 'text',
          label: messages.childFamilyNameEng,
          validate: []
        },
        {
          name: 'childSex',
          type: 'select',
          label: messages.childSex,
          required: true,
          initialValue: '',
          validate: [],
          options: [
            { value: 'male', label: messages.childSexMale },
            { value: 'female', label: messages.childSexFemale },
            { value: 'other', label: messages.childSexOther },
            { value: 'unknown', label: messages.childSexUnknown }
          ]
        },
        {
          name: 'dateOfBirth',
          type: 'date',
          label: messages.childDateOfBirth,
          required: true,
          validate: []
        },
        {
          name: 'attendantAtBirth',
          type: 'select',
          label: messages.attendantAtBirth,
          required: true,
          validate: [],
          options: [
            { value: 'PHYSICIAN', label: messages.attendantAtBirthPhysician },
            { value: 'NURSE', label: messages.attendantAtBirthNurse },
            {
              value: 'NURSE_MIDWIFE',
              label: messages.attendantAtBirthNurseMidwife
            },
            { value: 'MIDWIFE', label: messages.attendantAtBirthMidwife },
            {
              value: 'OTHER_PARAMEDICAL_PERSONNEL',
              label: messages.attendantAtBirthOtherParamedicalPersonnel
            },
            { value: 'LAYPERSON', label: messages.attendantAtBirthLayperson },
            { value: 'NONE', label: messages.attendantAtBirthNone },
            { value: 'OTHER', label: messages.attendantAtBirthOther }
          ]
        },
        {
          name: 'typeOfBirth',
          type: 'select',
          label: messages.typeOfBirth,
          required: true,
          validate: [],
          options: [
            { value: 'SINGLE', label: messages.typeOfBirthSingle },
            { value: 'TWIN', label: messages.typeOfBirthTwin },
            { value: 'TRIPLET', label: messages.typeOfBirthTriplet },
            { value: 'QUADRUPLET', label: messages.typeOfBirthQuadruplet },
            {
              value: 'HIGHER_MULTIPLE_DELIVERY',
              label: messages.typeOfBirthHigherMultipleDelivery
            }
          ]
        },
        {
          name: 'orderOfBirth',
          type: 'text',
          label: messages.orderOfBirth,
          required: true,
          validate: []
        },
        {
          name: 'weightAtBirth',
          type: 'text',
          label: messages.weightAtBirth,
          required: true,
          validate: [],
          postfix: 'Kg'
        },
        {
          name: 'placeOfDelivery',
          type: 'select',
          label: messages.placeOfDelivery,
          required: true,
          validate: [],
          options: [{ value: '?', label: messages.defaultLabel }]
        },
        {
          name: 'deliveryInstitution',
          type: 'select',
          label: messages.deliveryInstitution,
          required: true,
          validate: [],
          options: [{ value: '?', label: messages.defaultLabel }]
        },
        {
          name: 'deliveryAddress',
          type: 'textarea',
          label: messages.deliveryAddress,
          required: true,
          validate: [],
          disabled: true
        }
      ]
    },
    {
      id: 'mother',
      viewType: 'form',
      name: messages.motherTab,
      title: messages.motherTitle,
      fields: [
        {
          name: 'firstName',
          type: 'text',
          label: messages.mothersFirstName,
          required: false,
          initialValue: '',
          validate: []
        }
      ]
    },
    {
      id: 'father',
      viewType: 'form',
      name: messages.fatherTab,
      title: messages.fatherTitle,
      fields: [
        {
          name: 'fathersDetailsExist',
          type: 'radioGroup',
          label: messages.fathersDetailsExist,
          required: true,
          initialValue: '',
          validate: [],
          options: [
            { value: '1', label: messages.confirm },
            { value: '0', label: messages.deny }
          ]
        },
        {
          name: 'fathersAddress',
          type: 'address',
          label: messages.currentAddress,
          required: true,
          initialValue: '',
          validate: [],
          fields: [
            {
              name: 'addressSameAsMother',
              type: 'radioGroup',
              label: messages.addressSameAsMother,
              required: true,
              initialValue: '',
              validate: [],
              options: [
                { value: '1', label: messages.confirm },
                { value: '0', label: messages.deny }
              ]
            },
            {
              name: 'country',
              type: 'select',
              label: messages.country,
              required: true,
              initialValue: '',
              validate: [],
              options: countries
            },
            {
              name: 'state',
              type: 'select',
              label: messages.state,
              required: true,
              initialValue: '',
              validate: [],
              options: states
            },
            {
              name: 'district',
              type: 'select',
              label: messages.district,
              required: true,
              initialValue: '',
              validate: [],
              options: districts
            },
            {
              name: 'addressLine1',
              type: 'text',
              label: messages.addressLine1,
              required: true,
              initialValue: '',
              validate: []
            },
            {
              name: 'addressLine2',
              type: 'text',
              label: messages.addressLine2,
              required: false,
              initialValue: '',
              validate: []
            },
            {
              name: 'addressLine3',
              type: 'text',
              label: messages.addressLine3,
              required: false,
              initialValue: '',
              validate: []
            },
            {
              name: 'addressLine4',
              type: 'text',
              label: messages.addressLine4,
              required: false,
              initialValue: '',
              validate: []
            },
            {
              name: 'postCode',
              type: 'text',
              label: messages.postCode,
              required: true,
              initialValue: '',
              validate: []
            }
          ]
        }
      ]
    },
    {
      id: 'registration',
      viewType: 'form',
      name: messages.registrationTab,
      title: messages.registrationTitle,
      fields: []
    },
    {
      id: 'documents',
      viewType: 'form',
      name: messages.documentsTab,
      title: messages.documentsTitle,
      fields: []
    },
    {
      id: 'preview',
      viewType: 'preview',
      name: messages.previewTab,
      title: messages.previewTitle,
      fields: []
    }
  ]
}

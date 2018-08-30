import { IForm } from './'
import { defineMessages } from 'react-intl'

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
  typeOfBirth: {
    id: 'formFields.typeOfBirth',
    defaultMessage: 'Type of birth',
    description: 'Label for form field: Type of birth'
  },
  orderOfBirth: {
    id: 'formFields.orderOfBirth',
    defaultMessage: 'Order of birth',
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
  }
})

export const birthParentForm: IForm = {
  sections: [
    {
      id: 'child',
      name: messages.childTab,
      title: messages.childTitle,
      fields: [
        {
          name: 'childGivenName',
          type: 'text',
          label: messages.childGivenName,
          required: true,
          validate: []
        },
        {
          name: 'childMiddleNames',
          type: 'text',
          label: messages.childMiddleNames,
          required: false,
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
          validate: [],
          options: [
            { value: 'm', label: 'Male' },
            { value: 'f', label: 'Female' },
            { value: 'u', label: 'Unknown' }
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
          options: [{ value: '?', label: '?' }]
        },
        {
          name: 'typeOfBirth',
          type: 'select',
          label: messages.typeOfBirth,
          required: true,
          validate: [],
          options: [{ value: '?', label: '?' }]
        },
        {
          name: 'orderOfBirth',
          type: 'select',
          label: messages.orderOfBirth,
          required: true,
          validate: [],
          options: [{ value: '?', label: '?' }]
        },
        {
          name: 'weightAtBirth', // needs Kg unit
          type: 'text',
          label: messages.weightAtBirth,
          required: true,
          validate: []
        },
        {
          name: 'placeOfDelivery',
          type: 'select',
          label: messages.placeOfDelivery,
          required: true,
          validate: [],
          options: [{ value: '?', label: '?' }]
        },
        {
          name: 'deliveryInstitution',
          type: 'select',
          label: messages.deliveryInstitution,
          required: true,
          validate: [],
          options: [{ value: '?', label: '?' }]
        },
        {
          name: 'deliveryAddress', // needs text area display
          type: 'text',
          label: messages.deliveryAddress,
          required: true,
          validate: []
        }
      ]
    },
    {
      id: 'mother',
      name: messages.motherTab,
      title: messages.motherTitle,
      fields: [
        {
          name: 'firstName',
          type: 'text',
          label: messages.mothersFirstName,
          required: false,
          validate: []
        }
      ]
    },
    {
      id: 'father',
      name: messages.fatherTab,
      title: messages.fatherTitle,
      fields: []
    },
    {
      id: 'registration',
      name: messages.registrationTab,
      title: messages.registrationTitle,
      fields: []
    },
    {
      id: 'documents',
      name: messages.documentsTab,
      title: messages.documentsTitle,
      fields: []
    }
  ]
}

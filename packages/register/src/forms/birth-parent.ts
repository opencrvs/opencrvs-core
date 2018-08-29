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
  firstName: {
    id: 'formFields.firstName',
    defaultMessage: 'First name',
    description: 'Label for form field: First name'
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
          name: 'firstName',
          type: 'text',
          label: messages.firstName,
          required: true,
          validate: []
        },
        {
          name: 'foo',
          type: 'text',
          label: messages.defaultLabel,
          required: false,
          validate: []
        },
        {
          name: 'bar',
          type: 'text',
          label: messages.defaultLabel,
          required: false,
          validate: []
        },
        {
          name: 'baz',
          type: 'select',
          label: messages.defaultLabel,
          required: true,
          validate: [],
          options: [
            { value: 'chocolate', label: 'Chocolate' },
            { value: 'strawberry', label: 'Strawberry' },
            { value: 'vanilla', label: 'Vanilla' }
          ]
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

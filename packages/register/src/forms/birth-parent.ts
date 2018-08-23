import { IForm } from './'
import { defineMessages } from 'react-intl'

const messages = defineMessages({
  child: {
    id: 'menu.child',
    defaultMessage: 'Child',
    description: 'Child'
  },
  mother: {
    id: 'menu.mother',
    defaultMessage: 'Mother',
    description: 'Mother'
  },
  father: {
    id: 'menu.father',
    defaultMessage: 'Father',
    description: 'Father'
  },
  documents: {
    id: 'menu.informant',
    defaultMessage: 'Documents',
    description: 'Documents'
  },
  registration: {
    id: 'menu.registration',
    defaultMessage: 'Registration',
    description: 'Registration'
  }
})

export const birthParentForm: IForm = {
  sections: [
    {
      id: 'child',
      name: messages.child,
      title: "Child's details",
      fields: [
        {
          name: 'firstName',
          type: 'text',
          label: 'First name',
          required: true,
          validate: []
        },
        {
          name: 'foo',
          type: 'text',
          label: 'Label goes here',
          required: false,
          validate: []
        },
        {
          name: 'bar',
          type: 'text',
          label: 'Label goes here',
          required: false,
          validate: []
        },
        {
          name: 'baz',
          type: 'select',
          label: 'Label goes here',
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
      name: messages.mother,
      title: "Mother's details",
      fields: [
        {
          name: 'firstName',
          type: 'text',
          label: "Mother's first name",
          required: false,
          validate: []
        }
      ]
    },
    {
      id: 'father',
      name: messages.father,
      title: "Father's details",
      fields: []
    },
    {
      id: 'registration',
      name: messages.registration,
      title: 'Registration',
      fields: []
    },
    {
      id: 'documents',
      name: messages.documents,
      title: 'Documents',
      fields: []
    }
  ]
}

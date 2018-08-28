import { IForm } from './'

export const birthParentForm: IForm = {
  sections: [
    {
      id: 'child',
      name: 'Child',
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
      name: 'Mother',
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
      name: 'Father',
      title: "Father's details",
      fields: []
    },
    {
      id: 'registration',
      name: 'Registration',
      title: 'Registration',
      fields: []
    },
    {
      id: 'documents',
      name: 'Documents',
      title: 'Documents',
      fields: []
    }
  ]
}

import { defineMessages } from 'react-intl'

export interface IFatherSectionFormData {
  firstName: string
  foo: string
  bar: string
  baz: string
}

export const messages = defineMessages({
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
    description: 'Title for the current address fields'
  }
})

export const fatherSection = {
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
      initialValue: '0',
      validate: [],
      options: [
        { value: '1', label: messages.confirm },
        { value: '0', label: messages.deny }
      ]
    },
    {
      name: 'fathersCurrentAddress',
      type: 'address',
      label: messages.currentAddress,
      required: false,
      initialValue: '',
      validate: []
    }
  ]
}

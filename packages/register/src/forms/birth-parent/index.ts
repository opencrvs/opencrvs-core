import { IForm } from 'src/forms'
import { defineMessages } from 'react-intl'
import { childSection, IChildSectionFormData } from './child-section'
import { motherSection, IMotherSectionFormData } from './mother-section'

export interface IBirthParentFormData {
  child: IChildSectionFormData
  mother: IMotherSectionFormData
}

const messages = defineMessages({
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
    defaultMessage: 'Supporting documents',
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
  }
})

export const birthParentForm: IForm = {
  sections: [
    childSection,
    motherSection,
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
          validate: [],
          options: [
            { value: '1', label: messages.confirm },
            { value: '0', label: messages.deny }
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
      fields: [
        {
          name: 'documents',
          type: 'documents',
          initialValue: '',
          label: messages.fathersDetailsExist,
          validate: []
        }
      ]
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

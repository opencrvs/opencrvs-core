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
    defaultMessage: 'Documents',
    description: 'Form section title for Documents'
  }
})

export const birthParentForm: IForm = {
  sections: [
    childSection,
    motherSection,
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

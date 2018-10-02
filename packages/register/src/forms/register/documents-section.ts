import { defineMessages } from 'react-intl'
import { IFormSection, LIST } from 'src/forms'

const messages = defineMessages({
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

export const DocumentsSection: IFormSection = {
  id: 'documents',
  viewType: 'form',
  name: messages.documentsTab,
  title: messages.documentsTitle,
  fields: [
    {
      name: 'list',
      type: LIST,
      // Just a dummy message here - not actually shown anywhere
      label: messages.documentsTab,
      required: false,
      initialValue: '',
      validate: [],
      items: []
    }
  ]
}

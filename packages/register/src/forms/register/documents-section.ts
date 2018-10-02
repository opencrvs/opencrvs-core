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
    defaultMessage: 'Supporting documents',
    description: 'Form section title for Documents'
  },
  paragraph: {
    id: 'register.form.section.documents.paragraph',
    defaultMessage:
      'For birth regiatration of children below 5 years old, one of the documents listed bellow is required:',
    description: 'Documents Paragraph text'
  },
  informantAttestation: {
    id: 'register.form.section.documents.list.informantAttestation',
    defaultMessage: 'Attestation of the informant, or',
    description: 'Attested document of the informant'
  },
  attestedVaccination: {
    id: 'register.form.section.documents.list.attestedVaccination',
    defaultMessage: 'Attested copy of the vaccination (EPI) card, or',
    description: 'Attested copy of the vaccination card'
  },
  attestedBirthRecord: {
    id: 'register.form.section.documents.list.attestedBirthRecord',
    defaultMessage: 'Attested copy of hospital document or birth record, or',
    description: 'Attested copy of hospital document'
  },
  certification: {
    id: 'register.form.section.documents.list.certification',
    defaultMessage:
      'Certification regarding NGO worker authorized by registrar in favour of date of birth, or',
    description: 'Certification regarding NGO worker'
  },
  otherDocuments: {
    id: 'register.form.section.documents.list.otherDocuments',
    defaultMessage:
      'Attested copy(s) of the document as prescribed by the Registrar',
    description: 'Attested copy(s) of the document'
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
      label: messages.documentsTab,
      required: false,
      initialValue: '',
      validate: [],
      items: [
        messages.informantAttestation,
        messages.attestedVaccination,
        messages.attestedBirthRecord,
        messages.certification,
        messages.otherDocuments
      ]
    }
  ]
}

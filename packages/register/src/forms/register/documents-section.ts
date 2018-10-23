import { defineMessages } from 'react-intl'
import {
  IFormSection,
  LIST,
  PARAGRAPH,
  IMAGE_UPLOADER_WITH_OPTIONS,
  RADIO_GROUP
} from 'src/forms'
import { conditionals } from '../utils'

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
  uploadImage: {
    id: 'register.form.section.documents.uploadImage',
    defaultMessage: 'Upload a photo of the supporting document',
    description: 'Title for the upload image button'
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
  },
  documentsUploadName: {
    id: 'register.form.section.upload.documentsName',
    defaultMessage: 'Documents Upload',
    description: 'Tab title for Documents Upload'
  },
  documentsUploadTitle: {
    id: 'register.form.section.upload.documentsTitle',
    defaultMessage: 'Supporting documents',
    description: 'Form section title for Documents'
  },
  uploadDocForWhom: {
    id: 'formFields.uploadDocForWhom',
    defaultMessage: 'Whose suppoting document are you uploading?',
    description: 'Question to ask user, for whom, documents are being uploaded'
  },
  uploadDocForChild: {
    id: 'formFields.uploadDocForChild',
    defaultMessage: 'Child',
    description: 'Label for radio option Child'
  },
  uploadDocForMother: {
    id: 'formFields.uploadDocForMother',
    defaultMessage: 'Mother',
    description: 'Label for radio option Mother'
  },
  uploadDocForFather: {
    id: 'formFields.uploadDocForFather',
    defaultMessage: 'Father',
    description: 'Label for radio option Father'
  },
  uploadDocForOther: {
    id: 'formFields.uploadDocForOther',
    defaultMessage: 'Other',
    description: 'Label for radio option Other'
  },
  whatDocToUpload: {
    id: 'formFields.whatDocToUpload',
    defaultMessage: 'Which document type are you uploading?',
    description:
      'Question to ask user, what type of documents are being uploaded'
  },
  docTypeBR: {
    id: 'formFields.docTypeBR',
    defaultMessage: 'Birth Registration',
    description: 'Label for radio option Birth Registration'
  },
  docTypeNID: {
    id: 'formFields.docTypeNID',
    defaultMessage: 'NID',
    description: 'Label for radio option NID'
  },
  docTypePassport: {
    id: 'formFields.docTypePassport',
    defaultMessage: 'Passport',
    description: 'Label for radio option Passport'
  },
  docTypeSC: {
    id: 'formFields.docTypeSC',
    defaultMessage: 'School Certificate',
    description: 'Label for radio option School Certificate'
  },
  docTypeOther: {
    id: 'formFields.docTypeOther',
    defaultMessage: 'Other',
    description: 'Label for radio option Other'
  }
})

export const documentsSection: IFormSection = {
  id: 'documents',
  viewType: 'form',
  name: messages.documentsTab,
  title: messages.documentsTitle,
  fields: [
    {
      name: 'image_uploader',
      type: IMAGE_UPLOADER_WITH_OPTIONS,
      label: messages.uploadImage,
      initialValue: '',
      validate: [],
      optionSection: {
        id: 'documents-upload',
        viewType: 'form',
        name: messages.documentsUploadName,
        title: messages.documentsUploadTitle,
        fields: [
          {
            name: 'uploadDocForWhom',
            type: RADIO_GROUP,
            label: messages.uploadDocForWhom,
            required: true,
            initialValue: '',
            validate: [],
            options: [
              { value: 'Child', label: messages.uploadDocForChild },
              { value: 'Mother', label: messages.uploadDocForMother },
              { value: 'Father', label: messages.uploadDocForFather },
              { value: 'Other', label: messages.uploadDocForOther }
            ]
          },
          {
            name: 'whatDocToUpload',
            type: RADIO_GROUP,
            label: messages.whatDocToUpload,
            required: true,
            initialValue: '',
            validate: [],
            options: [
              { value: 'Birth Registration', label: messages.docTypeBR },
              { value: 'NID', label: messages.docTypeNID },
              { value: 'Passport', label: messages.docTypePassport },
              { value: 'School Certificate', label: messages.docTypeSC },
              { value: 'Other', label: messages.docTypeOther }
            ],
            conditionals: [conditionals.uploadDocForWhom]
          }
        ]
      }
    },
    {
      name: 'paragraph',
      type: PARAGRAPH,
      label: messages.paragraph,
      initialValue: '',
      validate: []
    },
    {
      name: 'list',
      type: LIST,
      label: messages.documentsTab,
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

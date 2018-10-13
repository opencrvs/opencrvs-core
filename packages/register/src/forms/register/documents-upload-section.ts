import { defineMessages } from 'react-intl'
import { IFormSection, RADIO_GROUP } from 'src/forms'
import { conditionals } from '../utils'

const messages = defineMessages({
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

export const documentsUploadSection: IFormSection = {
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

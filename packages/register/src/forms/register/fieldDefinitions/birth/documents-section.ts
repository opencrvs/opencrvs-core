import { defineMessages } from 'react-intl'
import {
  IFormSection,
  PARAGRAPH,
  IMAGE_UPLOADER_WITH_OPTIONS,
  RADIO_GROUP,
  SELECT_WITH_DYNAMIC_OPTIONS,
  DYNAMIC_LIST
} from '@register/forms'
import { birthFieldToAttachmentTransformer } from '@register/forms/register/fieldDefinitions/birth/mappings/mutation/documents-mappings'
import { birthAttachmentToFieldTransformer } from '@register/forms/register/fieldDefinitions/birth/mappings/query/documents-mappings'
import { diffDoB } from '@register/forms/utils'

const messages: {
  [key: string]: ReactIntl.FormattedMessage.MessageDescriptor
} = defineMessages({
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
      'For birth regiatration of children below 5 years old, one of the documents listed below is required:',
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
  docTypeNIDFront: {
    id: 'formFields.docTypeNIDFront',
    defaultMessage: 'National ID (front)',
    description: 'Label for select option radio option NID front'
  },
  docTypeNIDBack: {
    id: 'formFields.docTypeNIDBack',
    defaultMessage: 'National ID (back)',
    description: 'Label for select option radio option NID back'
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
  },
  docTypeChildBirthProof: {
    id: 'formFields.docTypeChildBirthProof',
    defaultMessage: 'Proof of Place and Date of Birth',
    description: 'Label for select option Child Birth Proof'
  },
  docTypeEPICard: {
    id: 'formFields.docTypeEPICard',
    defaultMessage: 'EPI Card',
    description: 'Label for select option EPI Card'
  },
  docTypeDoctorCertificate: {
    id: 'formFields.docTypeDoctorCertificate',
    defaultMessage: 'Doctor Certificate',
    description: 'Label for select option Doctor Certificate'
  },
  proofOfMothersID: {
    id: 'formFields.proofOfMothersID',
    defaultMessage: "Proof of Mother's ID",
    description: 'Label for list item Mother ID Proof'
  },
  proofOfFathersID: {
    id: 'formFields.proofOfFathersID',
    defaultMessage: "Proof of Father's ID",
    description: 'Label for list item Father ID Proof'
  },
  proofOfBirthPlaceAndDate: {
    id: 'formFields.proofOfBirthPlaceAndDate',
    defaultMessage: 'Proof of Place and Date of Birth of Child',
    description: 'Label for list item Child Birth Proof'
  },
  proofOfParentPermanentAddress: {
    id: 'formFields.proofOfParentPermanentAddress',
    defaultMessage: 'Proof of Permanent Address of Parent',
    description: 'Label for list item Parent Permanent Address Proof'
  },
  proofOfEPICardOfChild: {
    id: 'formFields.proofOfEPICardOfChild',
    defaultMessage: 'EPI Card of Child',
    description: 'Label for list item EPI Card of Child'
  },
  proofOfDocCertificateOfChild: {
    id: 'formFields.proofOfDocCertificateOfChild',
    defaultMessage:
      "Certificate from doctor to prove child's age OR School certificate",
    description: 'Label for list item Doctor Certificate'
  }
})

export const documentsSection: IFormSection = {
  id: 'documents',
  viewType: 'form',
  name: messages.documentsTab,
  title: messages.documentsTitle,
  fields: [
    {
      name: 'imageUploader',
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
            hideAsterisk: true,
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
            type: SELECT_WITH_DYNAMIC_OPTIONS,
            label: messages.whatDocToUpload,
            required: true,
            hideAsterisk: true,
            initialValue: '',
            validate: [],
            dynamicOptions: {
              dependency: 'uploadDocForWhom',
              options: {
                Child: [
                  {
                    value: 'Proof of Place and Date of Birth',
                    label: messages.docTypeChildBirthProof
                  },
                  { value: 'EPI Card', label: messages.docTypeEPICard },
                  {
                    value: 'Doctor Certificate',
                    label: messages.docTypeDoctorCertificate
                  },
                  { value: 'School Certificate', label: messages.docTypeSC }
                ],
                Mother: [
                  { value: 'Birth Registration', label: messages.docTypeBR },
                  {
                    value: 'National ID (front)',
                    label: messages.docTypeNIDFront
                  },
                  {
                    value: 'National ID (back)',
                    label: messages.docTypeNIDBack
                  },
                  { value: 'Passport', label: messages.docTypePassport },
                  { value: 'School Certificate', label: messages.docTypeSC },
                  { value: 'Other', label: messages.docTypeOther }
                ],
                Father: [
                  { value: 'Birth Registration', label: messages.docTypeBR },
                  {
                    value: 'National ID (front)',
                    label: messages.docTypeNIDFront
                  },
                  {
                    value: 'National ID (back)',
                    label: messages.docTypeNIDBack
                  },
                  { value: 'Passport', label: messages.docTypePassport },
                  { value: 'School Certificate', label: messages.docTypeSC },
                  { value: 'Other', label: messages.docTypeOther }
                ],
                Other: [
                  { value: 'Birth Registration', label: messages.docTypeBR },
                  {
                    value: 'National ID (front)',
                    label: messages.docTypeNIDFront
                  },
                  {
                    value: 'National ID (back)',
                    label: messages.docTypeNIDBack
                  },
                  { value: 'Passport', label: messages.docTypePassport },
                  { value: 'School Certificate', label: messages.docTypeSC },
                  { value: 'Other', label: messages.docTypeOther }
                ]
              }
            }
          }
        ]
      },
      mapping: {
        mutation: birthFieldToAttachmentTransformer,
        query: birthAttachmentToFieldTransformer
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
      type: DYNAMIC_LIST,
      label: messages.documentsTab,
      validate: [],
      initialValue: '',
      dynamicItems: {
        dependency: 'child.childBirthDate',
        valueMapper: diffDoB,
        items: {
          within45days: [
            messages.proofOfMothersID,
            messages.proofOfFathersID,
            messages.proofOfBirthPlaceAndDate,
            messages.proofOfParentPermanentAddress
          ],
          between46daysTo5yrs: [
            messages.proofOfMothersID,
            messages.proofOfFathersID,
            messages.proofOfBirthPlaceAndDate,
            messages.proofOfParentPermanentAddress,
            messages.proofOfEPICardOfChild
          ],
          after5yrs: [
            messages.proofOfMothersID,
            messages.proofOfFathersID,
            messages.proofOfBirthPlaceAndDate,
            messages.proofOfParentPermanentAddress,
            messages.proofOfDocCertificateOfChild
          ]
        }
      }
    }
  ]
}

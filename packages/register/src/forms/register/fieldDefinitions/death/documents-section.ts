import {
  IFormSection,
  ViewType,
  IMAGE_UPLOADER_WITH_OPTIONS,
  RADIO_GROUP,
  PARAGRAPH,
  LIST,
  SELECT_WITH_DYNAMIC_OPTIONS,
  DOCUMENT_UPLOADER_WITH_OPTION
} from '@register/forms'
import { defineMessages } from 'react-intl'
import {
  deathFieldToAttachmentTransformer,
  documentForWhomFhirMapping
} from '@register/forms/register/fieldDefinitions/death/mappings/mutation/documents-mappings'
import { deathAttachmentToFieldTransformer } from '@register/forms/register/fieldDefinitions/death/mappings/query/documents-mappings'
import { conditionals } from '@register/forms/utils'

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
  whatDocToUpload: {
    id: 'formFields.whatDocToUpload',
    defaultMessage: 'Which document type are you uploading?',
    description:
      'Question to ask user, what type of documents are being uploaded'
  },
  deceasedIDProof: {
    id: 'formFields.deceasedIDProof',
    defaultMessage: "Proof of Deceased's ID",
    description: 'Option for radio group field: Type of Document To Upload'
  },
  deceasedPermanentAddressProof: {
    id: 'formFields.deceasedPermanentAddressProof',
    defaultMessage: 'Proof of Permanent Address of Deceased',
    description: 'Option for radio group field: Type of Document To Upload'
  },
  deceasedDeathProof: {
    id: 'formFields.deceasedDeathProof',
    defaultMessage: 'Proof of Death of Deceased',
    description: 'Option for radio group field: Type of Document To Upload'
  },
  deceasedDoBProof: {
    id: 'formFields.deceasedDoBProof',
    defaultMessage: 'Proof of Date of Birth of Deceased',
    description: 'Option for radio group field: Type of Document To Upload'
  },
  applicantIDProof: {
    id: 'formFields.applicantIDProof',
    defaultMessage: "Proof of Applicant's ID",
    description: 'Option for radio group field: Type of Document To Upload'
  },
  paragraph: {
    id: 'formFields.deceasedDocumentParagraph',
    defaultMessage:
      'For this death registration, the following documents are required:',
    description: 'Documents Paragraph text'
  },
  typeOfDocument: {
    id: 'formFields.typeOfDocument',
    defaultMessage: 'Choose type of document',
    description: 'Label for Select Form Field: Type of Document'
  },
  docTypeBR: {
    id: 'formFields.docTypeBR',
    defaultMessage: 'Birth Registration',
    description: 'Label for select option Birth Registration'
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
  docTypePostMortemReport: {
    id: 'formFields.docTypePostMortemReport',
    defaultMessage: 'Certified Post Mortem Report',
    description: 'Label for select option Post Mortem Report'
  },
  docTypeHospitalDischargeCertificate: {
    id: 'formFields.docTypeHospitalDischargeCertificate',
    defaultMessage: 'Hospital Discharge Certificate',
    description: 'Label for select option Hospital Discharge Certificate'
  },
  docTypeLetterOfDeath: {
    id: 'formFields.docTypeLetterOfDeath',
    defaultMessage: 'Attested Letter of Death',
    description: 'Label for select option Attested Letter of Death'
  },
  docTypeDeathCertificate: {
    id: 'formFields.docTypeDeathCertificate',
    defaultMessage: 'Attested Certificate of Death',
    description: 'Label for select option Attested Certificate of Death'
  },
  docTypeCopyOfBurialReceipt: {
    id: 'formFields.docTypeCopyOfBurialReceipt',
    defaultMessage: 'Certified Copy of Burial Receipt',
    description: 'Label for select option Certified Copy of Burial Receipt'
  },
  docTypeFuneralReceipt: {
    id: 'formFields.docTypeFuneralReceipt',
    defaultMessage: 'Certified Copy of Funeral Receipt',
    description: 'Label for select option Certified Copy of Funeral Receipt'
  },
  select: {
    id: 'register.select.placeholder',
    defaultMessage: 'Select'
  },
  docTypePassport: {
    id: 'formFields.docTypePassport',
    defaultMessage: 'Passport',
    description: 'Label for radio option Passport'
  }
})

export const documentsSection: IFormSection = {
  id: 'documents',
  viewType: 'form' as ViewType,
  name: messages.documentsTab,
  title: messages.documentsTitle,
  optional: true,
  groups: [
    {
      id: 'documents-view-group',
      fields: [
        {
          name: 'paragraph',
          type: PARAGRAPH,
          label: messages.paragraph,
          initialValue: '',
          validate: []
        },
        {
          name: 'uploadDocForDeceased',
          type: DOCUMENT_UPLOADER_WITH_OPTION,
          label: messages.deceasedIDProof,
          initialValue: '',
          extraValue: documentForWhomFhirMapping["Proof of Deceased's ID"],
          hideAsterisk: true,
          validate: [],
          options: [
            { value: 'National ID (front)', label: messages.docTypeNIDFront },
            { value: 'National ID (back)', label: messages.docTypeNIDBack },
            { value: 'Birth Registration', label: messages.docTypeBR },
            { value: 'Passport', label: messages.docTypePassport }
          ],
          mapping: {
            mutation: deathFieldToAttachmentTransformer,
            query: deathAttachmentToFieldTransformer
          }
        },
        {
          name: 'uploadDocForApplicant',
          type: DOCUMENT_UPLOADER_WITH_OPTION,
          label: messages.applicantIDProof,
          initialValue: '',
          extraValue: documentForWhomFhirMapping["Proof of Applicant's ID"],
          hideAsterisk: true,
          validate: [],
          options: [
            { value: 'National ID (front)', label: messages.docTypeNIDFront },
            { value: 'National ID (back)', label: messages.docTypeNIDBack },
            { value: 'Birth Registration', label: messages.docTypeBR },
            { value: 'Passport', label: messages.docTypePassport }
          ],
          mapping: {
            mutation: deathFieldToAttachmentTransformer,
            query: deathAttachmentToFieldTransformer
          }
        },
        {
          name: 'uploadDocForDeceasedDeath',
          type: DOCUMENT_UPLOADER_WITH_OPTION,
          label: messages.deceasedDeathProof,
          initialValue: '',
          extraValue: documentForWhomFhirMapping['Proof of Death of Deceased'],
          hideAsterisk: true,
          validate: [],
          options: [
            {
              value: 'Certified Post Mortem Report',
              label: messages.docTypePostMortemReport
            },
            {
              value: 'Hospital Discharge Certificate',
              label: messages.docTypeHospitalDischargeCertificate
            },
            {
              value: 'Attested Letter of Death',
              label: messages.docTypeLetterOfDeath
            },
            {
              value: 'Attested Certificate of Death',
              label: messages.docTypeDeathCertificate
            },
            {
              value: 'Certified Copy of Burial Receipt',
              label: messages.docTypeCopyOfBurialReceipt
            },
            {
              value: 'Certified Copy of Funeral Receipt',
              label: messages.docTypeFuneralReceipt
            }
          ],
          mapping: {
            mutation: deathFieldToAttachmentTransformer,
            query: deathAttachmentToFieldTransformer
          }
        },
        {
          name: 'uploadDocForDeceasedPermanentAddress',
          type: DOCUMENT_UPLOADER_WITH_OPTION,
          label: messages.deceasedPermanentAddressProof,
          initialValue: '',
          extraValue:
            documentForWhomFhirMapping['Proof Deceased Permanent Address'],
          hideAsterisk: true,
          validate: [],
          options: [
            { value: 'National ID (front)', label: messages.docTypeNIDFront },
            { value: 'National ID (back)', label: messages.docTypeNIDBack },
            { value: 'Birth Registration', label: messages.docTypeBR },
            { value: 'Passport', label: messages.docTypePassport }
          ],
          conditionals: [conditionals.deceasedNationIdSelected],
          mapping: {
            mutation: deathFieldToAttachmentTransformer,
            query: deathAttachmentToFieldTransformer
          }
        }
      ]
    }
  ]
}

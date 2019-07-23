import { defineMessages } from 'react-intl'
import {
  IFormSection,
  PARAGRAPH,
  DOCUMENT_UPLOADER_WITH_OPTION
} from '@register/forms'
import {
  birthFieldToAttachmentTransformer,
  documentForWhomFhirMapping
} from '@register/forms/register/fieldDefinitions/birth/mappings/mutation/documents-mappings'
import { birthAttachmentToFieldTransformer } from '@register/forms/register/fieldDefinitions/birth/mappings/query/documents-mappings'
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
    defaultMessage: 'Attach Supporting documents',
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
  paragraph45daysTo5Years: {
    id: 'register.form.section.documents.paragraph45daysTo5Years',
    defaultMessage:
      'For birth regiatration of children below 5 years old, one of the documents listed below is required:',
    description: 'Documents Paragraph text'
  },
  paragraphAbove5Years: {
    id: 'register.form.section.documents.paragraphAbove5Years',
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
    defaultMessage: 'Proof of Place and Date of Birth of Child',
    description: 'Label for select option Child Birth Proof'
  },
  docTypeChildAgeProof: {
    id: 'formFields.docTypeChildAgeProof',
    defaultMessage: 'Proof of Child Age',
    description: 'Label for select option Child Age Proof'
  },
  docTypeEPICard: {
    id: 'formFields.docTypeEPICard',
    defaultMessage: 'EPI Card',
    description: 'Label for select option EPI Card'
  },
  docTypeEPIStaffCertificate: {
    id: 'formFields.docTypeEPIStaffCertificate',
    defaultMessage: 'EPI Staff Certificate',
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
  },
  select: {
    id: 'register.select.placeholder',
    defaultMessage: 'Select'
  },
  dischargeCertificate: {
    id: 'formFields.docTypeHospitalDischargeCertificate',
    defaultMessage: 'Discharge Certificate'
  },
  birthMedicalInstitution: {
    id: 'formFields.docTypeMedicalInstitution',
    defaultMessage: 'Proof of birth from medical institution'
  },
  birthAttendant: {
    id: 'formFields.docTypebirthAttendant',
    defaultMessage: 'Proof of birth from birth attendant'
  },
  docTaxReceipt: {
    id: 'formFields.docTypeTaxReceipt',
    defaultMessage: 'Receipt of tax payment'
  }
})

export const documentsSection: IFormSection = {
  id: 'documents',
  viewType: 'form',
  name: messages.documentsTab,
  title: messages.documentsTitle,
  fields: [
    {
      name: 'paragraph',
      type: PARAGRAPH,
      label: messages.paragraph,
      initialValue: '',
      validate: [],
      conditionals: [conditionals.between46daysTo5yrs, conditionals.after5yrs]
    },
    {
      name: 'paragraph',
      type: PARAGRAPH,
      label: messages.paragraph45daysTo5Years,
      initialValue: '',
      validate: [],
      conditionals: [conditionals.withIn45Days, conditionals.after5yrs]
    },
    {
      name: 'paragraph',
      type: PARAGRAPH,
      label: messages.paragraphAbove5Years,
      initialValue: '',
      validate: [],
      conditionals: [
        conditionals.withIn45Days,
        conditionals.between46daysTo5yrs
      ]
    },
    {
      name: 'uploadDocForMother',
      type: DOCUMENT_UPLOADER_WITH_OPTION,
      label: messages.proofOfMothersID,
      initialValue: '',
      extraValue: documentForWhomFhirMapping.Mother,
      hideAsterisk: true,
      validate: [],
      options: [
        { value: 'Birth Registration', label: messages.docTypeBR },
        { value: 'National ID (front)', label: messages.docTypeNIDFront },
        { value: 'National ID (back)', label: messages.docTypeNIDBack },
        { value: 'Passport', label: messages.docTypePassport },
        { value: 'School Certificate', label: messages.docTypeSC },
        { value: 'Other', label: messages.docTypeOther }
      ],
      mapping: {
        mutation: birthFieldToAttachmentTransformer,
        query: birthAttachmentToFieldTransformer
      }
    },
    {
      name: 'uploadDocForFather',
      type: DOCUMENT_UPLOADER_WITH_OPTION,
      label: messages.proofOfFathersID,
      initialValue: '',
      extraValue: documentForWhomFhirMapping.Father,
      hideAsterisk: true,
      validate: [],
      options: [
        { value: 'Birth Registration', label: messages.docTypeBR },
        { value: 'National ID (front)', label: messages.docTypeNIDFront },
        { value: 'National ID (back)', label: messages.docTypeNIDBack },
        { value: 'Passport', label: messages.docTypePassport },
        { value: 'School Certificate', label: messages.docTypeSC },
        { value: 'Other', label: messages.docTypeOther }
      ],
      mapping: {
        mutation: birthFieldToAttachmentTransformer,
        query: birthAttachmentToFieldTransformer
      }
    },
    {
      name: 'uploadDocForParentPermanentAddress',
      type: DOCUMENT_UPLOADER_WITH_OPTION,
      label: messages.proofOfParentPermanentAddress,
      initialValue: '',
      extraValue: documentForWhomFhirMapping.Parent,
      hideAsterisk: true,
      validate: [],
      options: [
        { value: 'Tax Payment Receipt', label: messages.docTaxReceipt },
        { value: 'Other', label: messages.docTypeOther }
      ],
      mapping: {
        mutation: birthFieldToAttachmentTransformer,
        query: birthAttachmentToFieldTransformer
      }
    },
    {
      name: 'uploadDocForChildDOB',
      type: DOCUMENT_UPLOADER_WITH_OPTION,
      label: messages.docTypeChildBirthProof,
      initialValue: '',
      extraValue: documentForWhomFhirMapping.Child,
      hideAsterisk: true,
      validate: [],
      options: [
        {
          value: 'Discharge Certificate',
          label: messages.dischargeCertificate
        },
        {
          value: 'Proof of birth from medical institution',
          label: messages.birthMedicalInstitution
        },
        {
          value: 'Proof of birth from birth attendant',
          label: messages.birthAttendant
        },
        { value: 'Other', label: messages.docTypeOther }
      ],
      mapping: {
        mutation: birthFieldToAttachmentTransformer,
        query: birthAttachmentToFieldTransformer
      }
    },
    {
      name: 'uploadDocForChildAge',
      type: DOCUMENT_UPLOADER_WITH_OPTION,
      label: messages.docTypeChildAgeProof,
      initialValue: '',
      extraValue: documentForWhomFhirMapping.ChildAge,
      hideAsterisk: true,
      validate: [],
      options: [
        { value: 'EPI Card', label: messages.docTypeEPICard },
        {
          value: 'EPI Staff Certificate',
          label: messages.docTypeEPIStaffCertificate
        },
        {
          value: 'Doctor Certificate',
          label: messages.docTypeDoctorCertificate
        },
        { value: 'Other', label: messages.docTypeOther }
      ],
      conditionals: [conditionals.withIn45Days, conditionals.after5yrs],
      mapping: {
        mutation: birthFieldToAttachmentTransformer,
        query: birthAttachmentToFieldTransformer
      }
    },
    {
      name: 'uploadDocForChildAge',
      type: DOCUMENT_UPLOADER_WITH_OPTION,
      label: messages.docTypeChildAgeProof,
      initialValue: '',
      extraValue: documentForWhomFhirMapping.ChildAge,
      hideAsterisk: true,
      validate: [],
      options: [
        {
          value: 'Doctor Certificate',
          label: messages.docTypeDoctorCertificate
        },
        { value: 'School Certificate', label: messages.docTypeSC },
        { value: 'Other', label: messages.docTypeOther }
      ],
      conditionals: [
        conditionals.withIn45Days,
        conditionals.between46daysTo5yrs
      ],
      mapping: {
        mutation: birthFieldToAttachmentTransformer,
        query: birthAttachmentToFieldTransformer
      }
    }
  ]
}

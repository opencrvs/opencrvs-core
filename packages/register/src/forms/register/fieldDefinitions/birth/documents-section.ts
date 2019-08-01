import { formMessages as messages } from '@register/i18n/messages'
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

export const documentsSection: IFormSection = {
  id: 'documents',
  viewType: 'form',
  name: messages.documentsName,
  title: messages.documentsTitle,
  groups: [
    {
      id: 'documents-view-group',
      fields: [
        {
          name: 'paragraph',
          type: PARAGRAPH,
          label: messages.paragraph,
          initialValue: '',
          validate: [],
          conditionals: [
            conditionals.between46daysTo5yrs,
            conditionals.after5yrs
          ]
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
  ]
}

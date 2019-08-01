import {
  IFormSection,
  ViewType,
  PARAGRAPH,
  DOCUMENT_UPLOADER_WITH_OPTION
} from '@register/forms'
import {
  deathFieldToAttachmentTransformer,
  documentForWhomFhirMapping
} from '@register/forms/register/fieldDefinitions/death/mappings/mutation/documents-mappings'
import { deathAttachmentToFieldTransformer } from '@register/forms/register/fieldDefinitions/death/mappings/query/documents-mappings'
import { formMessages as messages } from '@register/i18n/messages'
import { conditionals } from '@register/forms/utils'

export const documentsSection: IFormSection = {
  id: 'documents',
  viewType: 'form' as ViewType,
  name: messages.documentsName,
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

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
          label: messages.paragraphRequiredDocuments,
          initialValue: '',
          validate: []
        },
        {
          name: 'uploadDocPlaceAndDOB',
          type: DOCUMENT_UPLOADER_WITH_OPTION,
          label: messages.proofOfBirthPlaceAndDate,
          initialValue: '',
          extraValue: documentForWhomFhirMapping.Child,
          hideAsterisk: true,
          validate: [],
          options: [
            {
              value: 'Original birth record',
              label: messages.docTypeChildBirthProof
            },
            {
              value: 'Under five card',
              label: messages.docTypeChildUnderFiveCard
            }
          ],
          mapping: {
            mutation: birthFieldToAttachmentTransformer,
            query: birthAttachmentToFieldTransformer
          }
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
            { value: 'Front of national ID', label: messages.docTypeNIDFront },
            { value: 'Back of national ID', label: messages.docTypeNIDBack }
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
            { value: 'Front of national ID', label: messages.docTypeNIDFront },
            { value: 'Back of national ID', label: messages.docTypeNIDBack }
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

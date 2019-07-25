import { formMessages as messages } from '@register/i18n/messages'
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
            groups: [
              {
                id: 'documents-upload-view-group',
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
                    placeholder: messages.select,
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
                          {
                            value: 'School Certificate',
                            label: messages.docTypeSC
                          }
                        ],
                        Mother: [
                          {
                            value: 'Birth Registration',
                            label: messages.docTypeBR
                          },
                          {
                            value: 'National ID (front)',
                            label: messages.docTypeNIDFront
                          },
                          {
                            value: 'National ID (back)',
                            label: messages.docTypeNIDBack
                          },
                          {
                            value: 'Passport',
                            label: messages.docTypePassport
                          },
                          {
                            value: 'School Certificate',
                            label: messages.docTypeSC
                          },
                          { value: 'Other', label: messages.docTypeOther }
                        ],
                        Father: [
                          {
                            value: 'Birth Registration',
                            label: messages.docTypeBR
                          },
                          {
                            value: 'National ID (front)',
                            label: messages.docTypeNIDFront
                          },
                          {
                            value: 'National ID (back)',
                            label: messages.docTypeNIDBack
                          },
                          {
                            value: 'Passport',
                            label: messages.docTypePassport
                          },
                          {
                            value: 'School Certificate',
                            label: messages.docTypeSC
                          },
                          { value: 'Other', label: messages.docTypeOther }
                        ],
                        Other: [
                          {
                            value: 'Birth Registration',
                            label: messages.docTypeBR
                          },
                          {
                            value: 'National ID (front)',
                            label: messages.docTypeNIDFront
                          },
                          {
                            value: 'National ID (back)',
                            label: messages.docTypeNIDBack
                          },
                          {
                            value: 'Passport',
                            label: messages.docTypePassport
                          },
                          {
                            value: 'School Certificate',
                            label: messages.docTypeSC
                          },
                          { value: 'Other', label: messages.docTypeOther }
                        ]
                      }
                    }
                  }
                ]
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
          label: messages.documentsName,
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
  ]
}

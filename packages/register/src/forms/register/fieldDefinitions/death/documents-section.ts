import {
  IFormSection,
  ViewType,
  IMAGE_UPLOADER_WITH_OPTIONS,
  RADIO_GROUP,
  PARAGRAPH,
  LIST,
  SELECT_WITH_DYNAMIC_OPTIONS
} from '@register/forms'
import { deathFieldToAttachmentTransformer } from '@register/forms/register/fieldDefinitions/death/mappings/mutation/documents-mappings'
import { deathAttachmentToFieldTransformer } from '@register/forms/register/fieldDefinitions/death/mappings/query/documents-mappings'
import { formMessages as messages } from '@register/i18n/messages'

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
          name: 'imageUploader',
          type: IMAGE_UPLOADER_WITH_OPTIONS,
          label: messages.uploadImage,
          required: false,
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
                    name: 'whatDocToUpload',
                    type: RADIO_GROUP,
                    label: messages.whatDocToUpload,
                    required: true,
                    hideAsterisk: true,
                    initialValue: '',
                    validate: [],
                    options: [
                      {
                        value: "Proof of Deceased's ID",
                        label: messages.deceasedIDProof
                      },
                      {
                        value: 'Proof Deceased Permanent Address',
                        label: messages.deceasedPermanentAddressProof
                      },
                      {
                        value: 'Proof of Death of Deceased',
                        label: messages.deceasedDeathProof
                      },
                      {
                        value: 'Proof of Date of Birth of Deceased',
                        label: messages.deceasedDoBProof
                      },
                      {
                        value: "Proof of Applicant's ID",
                        label: messages.applicantIDProof
                      }
                    ]
                  },
                  {
                    name: 'typeOfDocument',
                    type: SELECT_WITH_DYNAMIC_OPTIONS,
                    label: messages.typeOfDocument,
                    required: true,
                    hideAsterisk: true,
                    validate: [],
                    placeholder: messages.select,
                    initialValue: '',
                    dynamicOptions: {
                      dependency: 'whatDocToUpload',
                      options: {
                        "Proof of Deceased's ID": [
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
                          }
                        ],
                        'Proof Deceased Permanent Address': [
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
                          }
                        ],
                        'Proof of Death of Deceased': [
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
                        'Proof of Date of Birth of Deceased': [
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
                          }
                        ],
                        "Proof of Applicant's ID": [
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
                          }
                        ]
                      }
                    }
                  }
                ]
              }
            ]
          },
          mapping: {
            mutation: deathFieldToAttachmentTransformer,
            query: deathAttachmentToFieldTransformer
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
          label: messages.documentsName,
          initialValue: '',
          validate: [],
          items: [
            messages.deceasedIDProof,
            messages.deceasedPermanentAddressProof,
            messages.deceasedDeathProof,
            messages.deceasedDoBProof,
            messages.applicantIDProof
          ]
        }
      ]
    }
  ]
}

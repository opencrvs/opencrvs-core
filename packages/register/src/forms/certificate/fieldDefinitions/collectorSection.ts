import { RadioSize } from '@opencrvs/components/lib/forms'
import {
  IFormSection,
  RADIO_GROUP,
  SELECT_WITH_OPTIONS,
  TEXT,
  PARAGRAPH,
  CHECKBOX_GROUP,
  IFormSectionGroup,
  SIMPLE_DOCUMENT_UPLOADER,
  FIELD_WITH_DYNAMIC_DEFINITIONS,
  CertificateSection
} from '@register/forms'
import {
  birthIdentityOptions,
  deathIdentityOptions,
  identityNameMapper,
  identityTypeMapper
} from '@register/forms/identity'
import { conditionals } from '@register/forms/utils'
import { formMessages } from '@register/i18n/messages'
import { messages as certificateMessages } from '@register/i18n/messages/views/certificate'
import { validIDNumber } from '@register/utils/validate'

export const certCollectorGroupForBirthAppWithFatherDetails: IFormSectionGroup = {
  id: 'certCollector',
  title: certificateMessages.whoToCollect,
  error: certificateMessages.certificateCollectorError,
  fields: [
    {
      name: 'type',
      type: RADIO_GROUP,
      size: RadioSize.LARGE,
      label: certificateMessages.whoToCollect,
      required: true,
      initialValue: '',
      validate: [],
      options: [
        { value: 'MOTHER', label: formMessages.contactDetailsMother },
        { value: 'FATHER', label: formMessages.contactDetailsFather },
        { value: 'OTHER', label: formMessages.someoneElse }
      ]
    }
  ]
}

export const certCollectorGroupForBirthAppWithoutFatherDetails: IFormSectionGroup = {
  id: 'certCollector',
  title: certificateMessages.whoToCollect,
  error: certificateMessages.certificateCollectorError,
  fields: [
    {
      name: 'type',
      type: RADIO_GROUP,
      size: RadioSize.LARGE,
      label: certificateMessages.whoToCollect,
      required: true,
      initialValue: '',
      validate: [],
      options: [
        { value: 'MOTHER', label: formMessages.contactDetailsMother },
        { value: 'OTHER', label: formMessages.someoneElse }
      ]
    }
  ]
}

export const collectBirthCertificateFormSection: IFormSection = {
  id: CertificateSection.Collector,
  viewType: 'form',
  name: certificateMessages.printCertificate,
  title: certificateMessages.certificateCollectionTitle,
  groups: [
    {
      id: 'otherCertCollector',
      conditionals: [conditionals.certCollectorOther],
      title: certificateMessages.otherCollectorFormTitle,
      error: certificateMessages.certificateOtherCollectorInfoError,
      fields: [
        {
          name: 'paragraph',
          type: PARAGRAPH,
          label: certificateMessages.otherCollectorFormParagraph,
          initialValue: '',
          validate: []
        },
        {
          name: 'iDType',
          type: SELECT_WITH_OPTIONS,
          label: formMessages.typeOfId,
          required: true,
          initialValue: '',
          validate: [],
          placeholder: formMessages.select,
          options: birthIdentityOptions
        },
        {
          name: 'iDTypeOther',
          type: TEXT,
          label: formMessages.iDTypeOtherLabel,
          required: true,
          initialValue: '',
          validate: [],
          conditionals: [conditionals.iDType]
        },
        {
          name: 'iD',
          type: FIELD_WITH_DYNAMIC_DEFINITIONS,
          dynamicDefinitions: {
            label: {
              dependency: 'iDType',
              labelMapper: identityNameMapper
            },
            type: {
              kind: 'dynamic',
              dependency: 'iDType',
              typeMapper: identityTypeMapper
            },
            validate: [
              {
                validator: validIDNumber,
                dependencies: ['iDType']
              }
            ]
          },
          label: formMessages.iD,
          required: true,
          initialValue: '',
          validate: []
        },
        {
          name: 'firstName',
          type: TEXT,
          label: formMessages.firstName,
          required: true,
          initialValue: '',
          validate: []
        },
        {
          name: 'lastName',
          type: TEXT,
          label: formMessages.lastName,
          required: true,
          initialValue: '',
          validate: []
        },
        {
          name: 'relationship',
          type: TEXT,
          label: formMessages.applicantsRelationWithChild,
          required: true,
          initialValue: '',
          validate: []
        }
      ]
    },
    {
      id: 'affidavit',
      conditionals: [conditionals.certCollectorOther],
      title: certificateMessages.certificateOtherCollectorAffidavitFormTitle,
      error: certificateMessages.certificateOtherCollectorAffidavitError,
      fields: [
        {
          name: 'paragraph',
          type: PARAGRAPH,
          label:
            certificateMessages.certificateOtherCollectorAffidavitFormParagraph,
          initialValue: '',
          validate: []
        },
        {
          name: 'affidavitFile',
          type: SIMPLE_DOCUMENT_UPLOADER,
          label: certificateMessages.signedAffidavitFileLabel,
          description: certificateMessages.noLabel,
          initialValue: '',
          required: false,
          validate: []
        },
        {
          name: 'noAffidavitAgreement',
          type: CHECKBOX_GROUP,
          label: certificateMessages.noLabel,
          initialValue: [],
          validate: [],
          required: false,
          options: [
            {
              value: 'AFFIDAVIT',
              label: certificateMessages.noSignedAffidavitAvailable
            }
          ]
        }
      ]
    }
  ]
}

export const collectDeathCertificateFormSection: IFormSection = {
  id: CertificateSection.Collector,
  viewType: 'form',
  name: certificateMessages.printCertificate,
  title: certificateMessages.certificateCollectionTitle,
  groups: [
    {
      id: 'certCollector',
      title: certificateMessages.certificateCollectionTitle,
      error: certificateMessages.certificateCollectorError,
      fields: [
        {
          name: 'type',
          type: RADIO_GROUP,
          size: RadioSize.LARGE,
          label: certificateMessages.whoToCollect,
          required: true,
          initialValue: true,
          validate: [],
          options: [
            { value: 'INFORMANT', label: formMessages.applicantName },
            { value: 'OTHER', label: formMessages.someoneElse }
          ]
        }
      ]
    },
    {
      id: 'otherCertCollector',
      conditionals: [conditionals.certCollectorOther],
      title: certificateMessages.otherCollectorFormTitle,
      error: certificateMessages.certificateOtherCollectorInfoError,
      fields: [
        {
          name: 'paragraph',
          type: PARAGRAPH,
          label: certificateMessages.otherCollectorFormParagraph,
          initialValue: '',
          validate: []
        },
        {
          name: 'iDType',
          type: SELECT_WITH_OPTIONS,
          label: formMessages.typeOfId,
          required: true,
          initialValue: '',
          validate: [],
          placeholder: formMessages.select,
          options: deathIdentityOptions
        },
        {
          name: 'iDTypeOther',
          type: TEXT,
          label: formMessages.iDTypeOtherLabel,
          required: true,
          initialValue: '',
          validate: [],
          conditionals: [conditionals.iDType]
        },
        {
          name: 'iD',
          type: FIELD_WITH_DYNAMIC_DEFINITIONS,
          dynamicDefinitions: {
            label: {
              dependency: 'iDType',
              labelMapper: identityNameMapper
            },
            type: {
              kind: 'dynamic',
              dependency: 'iDType',
              typeMapper: identityTypeMapper
            },
            validate: [
              {
                validator: validIDNumber,
                dependencies: ['iDType']
              }
            ]
          },
          label: formMessages.iD,
          required: true,
          initialValue: '',
          validate: []
        },
        {
          name: 'firstName',
          type: TEXT,
          label: formMessages.firstName,
          required: true,
          initialValue: '',
          validate: []
        },
        {
          name: 'lastName',
          type: TEXT,
          label: formMessages.lastName,
          required: true,
          initialValue: '',
          validate: []
        },
        {
          name: 'relationship',
          type: TEXT,
          label: formMessages.applicantsRelationWithDeceased,
          required: true,
          initialValue: '',
          validate: []
        }
      ]
    },
    {
      id: 'affidavit',
      conditionals: [conditionals.certCollectorOther],
      title: certificateMessages.certificateOtherCollectorAffidavitFormTitle,
      error: certificateMessages.certificateOtherCollectorAffidavitError,
      fields: [
        {
          name: 'paragraph',
          type: PARAGRAPH,
          label:
            certificateMessages.certificateOtherCollectorAffidavitFormParagraph,
          initialValue: '',
          validate: []
        },
        {
          name: 'affidavitFile',
          type: SIMPLE_DOCUMENT_UPLOADER,
          label: certificateMessages.signedAffidavitFileLabel,
          description: certificateMessages.noLabel,
          initialValue: '',
          required: false,
          validate: []
        },
        {
          name: 'noAffidavitAgreement',
          type: CHECKBOX_GROUP,
          label: certificateMessages.noLabel,
          required: false,
          initialValue: [],
          validate: [],
          options: [
            {
              value: 'AFFIDAVIT',
              label: certificateMessages.noSignedAffidavitAvailable
            }
          ]
        }
      ]
    }
  ]
}

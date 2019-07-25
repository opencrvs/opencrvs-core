import {
  IFormSection,
  IFormField,
  SELECT_WITH_OPTIONS,
  RADIO_GROUP,
  TEXT,
  INFORMATIVE_RADIO_GROUP,
  WARNING,
  PARAGRAPH,
  FIELD_WITH_DYNAMIC_DEFINITIONS
} from '@register/forms'
import { conditionals } from '@register/forms/utils'
import {
  identityTypeMapper,
  identityNameMapper
} from '@register/forms/identity'
import { validIDNumber } from '@register/utils/validate'
import { formMessages as messages } from '@register/i18n/messages'
import { messages as certificateMessages } from '@register/i18n/messages/views/certificate'

export const fatherDataExists: IFormField = {
  name: 'personCollectingCertificate',
  type: SELECT_WITH_OPTIONS,
  label: certificateMessages.whoToCollect,
  required: true,
  initialValue: '',
  validate: [],
  options: [
    { value: 'MOTHER', label: certificateMessages.mother },
    { value: 'FATHER', label: certificateMessages.father },
    { value: 'OTHER', label: certificateMessages.other }
  ]
}

export const fatherDataDoesNotExist: IFormField = {
  name: 'personCollectingCertificate',
  type: SELECT_WITH_OPTIONS,
  label: certificateMessages.whoToCollect,
  required: true,
  initialValue: '',
  validate: [],
  options: [
    { value: 'MOTHER', label: certificateMessages.mother },
    { value: 'OTHER', label: certificateMessages.other }
  ]
}

export const collectBirthCertificateFormSection: IFormSection = {
  id: 'collectCertificate',
  viewType: 'form',
  name: certificateMessages.printCertificate,
  title: certificateMessages.certificateCollectionTitle,
  groups: [
    {
      id: 'collect-certificate-view-group',
      fields: [
        {
          name: 'motherDetails',
          type: INFORMATIVE_RADIO_GROUP,
          label: messages.confirmMotherDetails,
          required: true,
          initialValue: '',
          information: {},
          dynamicInformationRetriever: data => data.mother,
          validate: [],
          options: [
            { value: true, label: messages.confirm },
            { value: false, label: messages.deny }
          ],
          conditionals: [conditionals.motherCollectsCertificate]
        },
        {
          name: 'fatherDetails',
          type: INFORMATIVE_RADIO_GROUP,
          label: messages.confirmMotherDetails,
          required: true,
          initialValue: '',
          information: {},
          dynamicInformationRetriever: data => data.father,
          validate: [],
          options: [
            { value: true, label: messages.confirm },
            { value: false, label: messages.deny }
          ],
          conditionals: [conditionals.fatherCollectsCertificate]
        },
        {
          name: 'otherPersonPrompt',
          type: PARAGRAPH,
          label: messages.prompt,
          initialValue: '',
          validate: [],
          conditionals: [conditionals.otherPersonCollectsCertificate]
        },
        {
          name: 'otherPersonIDType',
          type: SELECT_WITH_OPTIONS,
          label: messages.iDType,
          required: true,
          initialValue: '',
          validate: [],
          options: [
            { value: 'PASSPORT', label: messages.iDTypePassport },
            { value: 'NATIONAL_ID', label: messages.iDTypeNationalID },
            {
              value: 'DRIVING_LICENSE',
              label: messages.iDTypeDrivingLicense
            },
            {
              value: 'BIRTH_REGISTRATION_NUMBER',
              label: messages.iDTypeBRN
            },
            {
              value: 'DEATH_REGISTRATION_NUMBER',
              label: messages.iDTypeDRN
            },
            {
              value: 'REFUGEE_NUMBER',
              label: messages.iDTypeRefugeeNumber
            },
            { value: 'ALIEN_NUMBER', label: messages.iDTypeAlienNumber }
          ],
          conditionals: [conditionals.otherPersonCollectsCertificate]
        },
        {
          name: 'documentNumber',
          type: FIELD_WITH_DYNAMIC_DEFINITIONS,
          dynamicDefinitions: {
            label: {
              dependency: 'otherPersonIDType',
              labelMapper: identityNameMapper
            },
            type: {
              kind: 'dynamic',
              dependency: 'otherPersonIDType',
              typeMapper: identityTypeMapper
            },
            validate: [
              {
                validator: validIDNumber,
                dependencies: ['otherPersonIDType']
              }
            ]
          },
          label: messages.documentNumber,
          required: true,
          initialValue: '',
          validate: [],
          conditionals: [conditionals.otherPersonCollectsCertificate]
        },
        {
          name: 'otherPersonGivenNames',
          type: TEXT,
          label: messages.givenNames,
          required: true,
          initialValue: '',
          validate: [],
          conditionals: [conditionals.otherPersonCollectsCertificate]
        },
        {
          name: 'otherPersonFamilyName',
          type: TEXT,
          label: messages.familyName,
          required: true,
          initialValue: '',
          validate: [],
          conditionals: [conditionals.otherPersonCollectsCertificate]
        },
        {
          name: 'otherPersonSignedAffidavit',
          type: RADIO_GROUP,
          label: messages.signedAffidavitConfirmation,
          required: true,
          initialValue: '',
          validate: [],
          options: [
            { value: true, label: messages.confirm },
            { value: false, label: messages.deny }
          ],
          conditionals: [conditionals.otherPersonCollectsCertificate]
        },
        {
          name: 'warningNotVerified',
          type: WARNING,
          label: messages.warningNotVerified,
          initialValue: '',
          validate: [],
          conditionals: [conditionals.birthCertificateCollectorNotVerified]
        }
      ]
    }
  ]
}

export const collectDeathCertificateFormSection: IFormSection = {
  id: 'collectDeathCertificate',
  viewType: 'form',
  name: certificateMessages.printCertificate,
  title: certificateMessages.certificateCollectionTitle,
  groups: [
    {
      id: 'collect-death-certificate-view-group',
      fields: [
        {
          name: 'personCollectingCertificate',
          type: SELECT_WITH_OPTIONS,
          label: certificateMessages.whoToCollect,
          required: true,
          initialValue: '',
          validate: [],
          options: [
            { value: 'INFORMANT', label: certificateMessages.informant },
            { value: 'OTHER', label: certificateMessages.other }
          ]
        },
        {
          name: 'informantDetails',
          type: INFORMATIVE_RADIO_GROUP,
          label: messages.confirmMotherDetails,
          required: true,
          initialValue: '',
          information: {},
          dynamicInformationRetriever: data => data.informant.individual,
          validate: [],
          options: [
            { value: true, label: messages.confirm },
            { value: false, label: messages.deny }
          ],
          conditionals: [conditionals.informantCollectsCertificate]
        },
        {
          name: 'otherPersonPrompt',
          type: PARAGRAPH,
          label: messages.prompt,
          initialValue: '',
          validate: [],
          conditionals: [conditionals.otherPersonCollectsCertificate]
        },
        {
          name: 'otherPersonIDType',
          type: SELECT_WITH_OPTIONS,
          label: messages.iDType,
          required: true,
          initialValue: '',
          validate: [],
          options: [
            { value: 'PASSPORT', label: messages.iDTypePassport },
            { value: 'NATIONAL_ID', label: messages.iDTypeNationalID },
            {
              value: 'DRIVING_LICENSE',
              label: messages.iDTypeDrivingLicense
            },
            {
              value: 'BIRTH_REGISTRATION_NUMBER',
              label: messages.iDTypeBRN
            },
            {
              value: 'DEATH_REGISTRATION_NUMBER',
              label: messages.iDTypeDRN
            },
            {
              value: 'REFUGEE_NUMBER',
              label: messages.iDTypeRefugeeNumber
            },
            { value: 'ALIEN_NUMBER', label: messages.iDTypeAlienNumber }
          ],
          conditionals: [conditionals.otherPersonCollectsCertificate]
        },
        {
          name: 'documentNumber',
          type: FIELD_WITH_DYNAMIC_DEFINITIONS,
          dynamicDefinitions: {
            label: {
              dependency: 'otherPersonIDType',
              labelMapper: identityNameMapper
            },
            type: {
              kind: 'dynamic',
              dependency: 'otherPersonIDType',
              typeMapper: identityTypeMapper
            },
            validate: [
              {
                validator: validIDNumber,
                dependencies: ['otherPersonIDType']
              }
            ]
          },
          label: messages.documentNumber,
          required: true,
          initialValue: '',
          validate: [],
          conditionals: [conditionals.otherPersonCollectsCertificate]
        },
        {
          name: 'otherPersonGivenNames',
          type: TEXT,
          label: messages.givenNames,
          required: true,
          initialValue: '',
          validate: [],
          conditionals: [conditionals.otherPersonCollectsCertificate]
        },
        {
          name: 'otherPersonFamilyName',
          type: TEXT,
          label: messages.familyName,
          required: true,
          initialValue: '',
          validate: [],
          conditionals: [conditionals.otherPersonCollectsCertificate]
        },
        {
          name: 'otherPersonSignedAffidavit',
          type: RADIO_GROUP,
          label: messages.signedAffidavitConfirmation,
          required: true,
          initialValue: '',
          validate: [],
          options: [
            { value: true, label: messages.confirm },
            { value: false, label: messages.deny }
          ],
          conditionals: [conditionals.otherPersonCollectsCertificate]
        },
        {
          name: 'warningNotVerified',
          type: WARNING,
          label: messages.warningNotVerified,
          initialValue: '',
          validate: [],
          conditionals: [conditionals.deathCertificateCollectorNotVerified]
        }
      ]
    }
  ]
}

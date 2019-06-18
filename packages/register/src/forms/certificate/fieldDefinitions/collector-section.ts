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
import { defineMessages } from 'react-intl'
import { conditionals } from '@register/forms/utils'
import {
  messages as identityMessages,
  identityTypeMapper,
  identityNameMapper
} from '@register/forms/identity'
import { validIDNumber } from '@register/utils/validate'

const messages: {
  [key: string]: ReactIntl.FormattedMessage.MessageDescriptor
} = defineMessages({
  certificateCollectionTitle: {
    id: 'register.workQueue.title.certificateCollection',
    defaultMessage: 'Certificate Collection',
    description: 'The title of print certificate action'
  },
  printCertificate: {
    id: 'print.certificate.form.name',
    defaultMessage: 'Print',
    description: 'The title of review button in list expansion actions'
  },
  print: {
    id: 'print.certificate.form.title',
    defaultMessage: 'Print certificate',
    description: 'The title of review button in list expansion actions'
  },
  whoToCollect: {
    id: 'formFields.print.whoToCollect',
    defaultMessage: 'Who is collecting the certificate?',
    description: 'The label for collector of certificate select'
  },
  informant: {
    id: 'print.certificate.collector.informant',
    defaultMessage: 'Informant',
    description:
      'The label for select value when informant is the collector of certificate'
  },
  mother: {
    id: 'print.certificate.collector.mother',
    defaultMessage: 'Mother',
    description:
      'The label for select value when mother is the collector of certificate'
  },
  father: {
    id: 'print.certificate.collector.father',
    defaultMessage: 'Father',
    description:
      'The label for select value when father is the collector of certificate'
  },
  other: {
    id: 'print.certificate.collector.other',
    defaultMessage: 'Other',
    description:
      'The label for select value when the collector of certificate is other person'
  },
  confirmMotherDetails: {
    id: 'formFields.print.confirmMotherInformation',
    defaultMessage:
      'Does their proof of ID document match the following details?',
    description: 'The label for mother details paragraph'
  },
  confirm: {
    id: 'formFields.confirm',
    defaultMessage: 'Yes',
    description: 'confirmation label for yes / no radio button'
  },
  deny: {
    id: 'formFields.deny',
    defaultMessage: 'No',
    description: 'deny label for yes / no radio button'
  },
  givenNames: {
    id: 'formFields.print.otherPersonGivenNames',
    defaultMessage: 'Given name',
    description: 'Label for given name text input'
  },
  familyName: {
    id: 'formFields.print.otherPersonFamilyName',
    defaultMessage: 'Family name',
    description: 'Label for family name text input'
  },
  signedAffidavitConfirmation: {
    id: 'formFields.print.signedAffidavit',
    defaultMessage: 'Do they have a signed affidavit?',
    description: 'Label for signed affidavit confirmation radio group'
  },
  documentNumber: {
    id: 'formFields.print.documentNumber',
    defaultMessage: 'Document number',
    description: 'Label for document number input field'
  },
  warningNotVerified: {
    id: 'formFields.print.warningNotVerified',
    defaultMessage:
      'Please be aware that if you proceed you will be responsible for issuing a certificate without the necessary proof of ID from the collector.',
    description: 'Label for warning message when the collector is not verified'
  },
  prompt: {
    id: 'formFields.print.otherPersonPrompt',
    defaultMessage:
      'Because there are no details of this person on record, we need to capture their details:',
    description: 'Labal for prompt in case of other person collects certificate'
  }
})

export const fatherDataExists: IFormField = {
  name: 'personCollectingCertificate',
  type: SELECT_WITH_OPTIONS,
  label: messages.whoToCollect,
  required: true,
  initialValue: '',
  validate: [],
  options: [
    { value: 'MOTHER', label: messages.mother },
    { value: 'FATHER', label: messages.father },
    { value: 'OTHER', label: messages.other }
  ]
}

export const fatherDataDoesNotExist: IFormField = {
  name: 'personCollectingCertificate',
  type: SELECT_WITH_OPTIONS,
  label: messages.whoToCollect,
  required: true,
  initialValue: '',
  validate: [],
  options: [
    { value: 'MOTHER', label: messages.mother },
    { value: 'OTHER', label: messages.other }
  ]
}

export const collectBirthCertificateFormSection: IFormSection = {
  id: 'collectCertificate',
  viewType: 'form',
  name: messages.printCertificate,
  title: messages.certificateCollectionTitle,
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
      label: identityMessages.iDType,
      required: true,
      initialValue: '',
      validate: [],
      options: [
        { value: 'PASSPORT', label: identityMessages.iDTypePassport },
        { value: 'NATIONAL_ID', label: identityMessages.iDTypeNationalID },
        {
          value: 'DRIVING_LICENSE',
          label: identityMessages.iDTypeDrivingLicense
        },
        {
          value: 'BIRTH_REGISTRATION_NUMBER',
          label: identityMessages.iDTypeBRN
        },
        {
          value: 'DEATH_REGISTRATION_NUMBER',
          label: identityMessages.iDTypeDRN
        },
        {
          value: 'REFUGEE_NUMBER',
          label: identityMessages.iDTypeRefugeeNumber
        },
        { value: 'ALIEN_NUMBER', label: identityMessages.iDTypeAlienNumber }
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

export const collectDeathCertificateFormSection: IFormSection = {
  id: 'collectDeathCertificate',
  viewType: 'form',
  name: messages.printCertificate,
  title: messages.certificateCollectionTitle,
  fields: [
    {
      name: 'personCollectingCertificate',
      type: SELECT_WITH_OPTIONS,
      label: messages.whoToCollect,
      required: true,
      initialValue: '',
      validate: [],
      options: [
        { value: 'INFORMANT', label: messages.informant },
        { value: 'OTHER', label: messages.other }
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
      label: identityMessages.iDType,
      required: true,
      initialValue: '',
      validate: [],
      options: [
        { value: 'PASSPORT', label: identityMessages.iDTypePassport },
        { value: 'NATIONAL_ID', label: identityMessages.iDTypeNationalID },
        {
          value: 'DRIVING_LICENSE',
          label: identityMessages.iDTypeDrivingLicense
        },
        {
          value: 'BIRTH_REGISTRATION_NUMBER',
          label: identityMessages.iDTypeBRN
        },
        {
          value: 'DEATH_REGISTRATION_NUMBER',
          label: identityMessages.iDTypeDRN
        },
        {
          value: 'REFUGEE_NUMBER',
          label: identityMessages.iDTypeRefugeeNumber
        },
        { value: 'ALIEN_NUMBER', label: identityMessages.iDTypeAlienNumber }
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

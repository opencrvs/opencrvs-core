import {
  IFormSection,
  SELECT_WITH_OPTIONS,
  RADIO_GROUP,
  TEXT,
  INFORMATIVE_RADIO_GROUP
} from 'src/forms'
import { defineMessages } from 'react-intl'
import { conditionals } from 'src/forms/utils'
import { messages as identityMessages } from 'src/forms/identity'

const messages = defineMessages({
  printCertificate: {
    id: 'register.workQueue.print.form.name',
    defaultMessage: 'Print',
    description: 'The title of review button in list expansion actions'
  },
  print: {
    id: 'register.workQueue.print.form.title',
    defaultMessage: 'Print certificate',
    description: 'The title of review button in list expansion actions'
  },
  whoToCollect: {
    id: 'formFields.print.whoToCollect',
    defaultMessage: 'Who is collecting the certificate?',
    description: 'The label for collector of certificate select'
  },
  mother: {
    id: 'register.workQueue.print.collector.mother',
    defaultMessage: 'Mother',
    description:
      'The label for select value when mother is the collector of certificate'
  },
  father: {
    id: 'register.workQueue.print.collector.father',
    defaultMessage: 'Father',
    description:
      'The label for select value when father is the collector of certificate'
  },
  other: {
    id: 'register.workQueue.print.collector.other',
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
  }
})
export const printCertificateForm: IFormSection = {
  id: 'print',
  viewType: 'form',
  name: messages.printCertificate,
  title: messages.printCertificate,
  fields: [
    {
      name: 'personCollectingCertificate',
      type: SELECT_WITH_OPTIONS,
      label: messages.whoToCollect,
      required: true,
      initialValue: 'MOTHER',
      validate: [],
      options: [
        { value: 'MOTHER', label: messages.mother },
        { value: 'FATHER', label: messages.father },
        { value: 'OTHER', label: messages.other }
      ]
    },
    {
      name: 'motherDetails',
      type: INFORMATIVE_RADIO_GROUP,
      label: messages.confirmMotherDetails,
      required: true,
      initialValue: '',
      validate: [],
      options: [
        { value: 'Yes', label: messages.confirm },
        { value: 'No', label: messages.deny }
      ],
      conditionals: [conditionals.motherCollectsCertificate]
    },
    {
      name: 'fatherDetails',
      type: INFORMATIVE_RADIO_GROUP,
      label: messages.confirmMotherDetails,
      required: true,
      initialValue: '',
      validate: [],
      options: [
        { value: 'Yes', label: messages.confirm },
        { value: 'No', label: messages.deny }
      ],
      conditionals: [conditionals.fatherCollectsCertificate]
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
          value: 'DRIVING_LICENCE',
          label: identityMessages.iDTypeDrivingLicence
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
      type: TEXT,
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
        { value: 'Yes', label: messages.confirm },
        { value: 'No', label: messages.deny }
      ],
      conditionals: [conditionals.otherPersonCollectsCertificate]
    }
  ]
}

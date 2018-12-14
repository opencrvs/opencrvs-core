import { IFormSection, SELECT_WITH_OPTIONS, RADIO_GROUP, TEXT } from 'src/forms'
import { defineMessages } from 'react-intl'
import { conditionals } from 'src/forms/utils'

const messages = defineMessages({
  printCertificate: {
    id: 'register.workQueue.list.buttons.printCertificate',
    defaultMessage: 'Print certificate',
    description: 'The title of review button in list expansion actions'
  },
  whoToCollect: {
    id: 'register.workQueue.print.whoToCollect',
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
  motherDetailsTextTMP: {
    id: 'register.workQueue.print.collector.motherDetailsText',
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
      initialValue: '',
      validate: [],
      options: [
        { value: 'MOTHER', label: messages.mother },
        { value: 'FATHER', label: messages.father },
        { value: 'OTHER', label: messages.other }
      ]
    },
    {
      name: 'motherDetails',
      type: RADIO_GROUP,
      label: messages.motherDetailsTextTMP,
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

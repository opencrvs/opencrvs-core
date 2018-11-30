import { defineMessages } from 'react-intl'
import {
  IFormSection,
  SELECT_WITH_OPTIONS,
  TEXT,
  TEL,
  NUMBER,
  CHECKBOX_GROUP,
  TEXTAREA
} from 'src/forms'
import { phoneNumberFormat, emailAddressFormat } from 'src/utils/validate'

const messages = defineMessages({
  registrationTab: {
    id: 'register.form.tabs.registrationTab',
    defaultMessage: 'Registration',
    description: 'Tab title for Registration'
  },
  registrationTitle: {
    id: 'register.form.section.registrationTitle',
    defaultMessage: 'Registration',
    description: 'Form section title for Registration'
  },
  whoIsPresentLabel: {
    defaultMessage: "Who's present for the registration",
    id: 'formFields.registration.whoIsPresent',
    description: "Input label for Who's present input"
  },
  presentBoth: {
    id: 'formFields.registration.whoIsPresent.both',
    defaultMessage: 'Both Parents',
    description: 'Label for "Both Parents" select option'
  },
  presentMother: {
    id: 'formFields.registration.whoIsPresent.mother',
    defaultMessage: 'Mother',
    description: 'Label for "Mother" select option'
  },
  presentFather: {
    id: 'formFields.registration.whoIsPresent.father',
    defaultMessage: 'Father',
    description: 'Label for "Father" select option'
  },
  presentOther: {
    id: 'formFields.registration.whoIsPresent.other',
    defaultMessage: 'Other',
    description: 'Label for "Other" select option'
  },
  whoseContactDetailsLabel: {
    defaultMessage:
      'Whose contact details would the informant want to share for communication purposes?',
    id: 'formFields.registration.whoseContactDetails',
    description: 'Input label for contact details person'
  },
  contactDetailsBoth: {
    id: 'formFields.registration.whoseContactDetails.both',
    defaultMessage: 'Both Parents',
    description: 'Label for "Both Parents" select option'
  },
  contactDetailsMother: {
    id: 'formFields.registration.whoseContactDetails.mother',
    defaultMessage: 'Mother',
    description: 'Label for "Mother" select option'
  },
  contactDetailsFather: {
    id: 'formFields.registration.whoseContactDetails.father',
    defaultMessage: 'Father',
    description: 'Label for "Father" select option'
  },
  contactDetailsOther: {
    id: 'formFields.registration.whoseContactDetails.other',
    defaultMessage: 'Other',
    description: 'Label for "Other" select option'
  },
  registrationEmailLabel: {
    defaultMessage: 'Email address',
    id: 'formFields.registration.email',
    description: 'Input label for email input'
  },
  registrationPhoneLabel: {
    defaultMessage: 'Phone number',
    id: 'formFields.registration.phone',
    description: 'Input label for phone input'
  },
  registrationCertificateLanguage: {
    defaultMessage:
      'Which languages does the informant want the certificate issued in?',
    id: 'formFields.registration.certificateLanguage',
    description: 'Input label for certificate language checkboxes'
  },
  paperFormNumberLabel: {
    defaultMessage: 'Paper form number',
    id: 'formFields.registration.paperFormNumber',
    description: 'Input label for paper form number input'
  },
  registrationCertificateBN: {
    id: 'formFields.registration.certificateLanguage.bn',
    description: 'Selection label for "bn" option',
    defaultMessage: 'Bangla'
  },
  registrationCertificateEN: {
    id: 'formFields.registration.certificateLanguage.en',
    description: 'Selection label for "en" option',
    defaultMessage: 'English'
  },
  registrationCertificateOther: {
    id: 'formFields.registration.certificateLanguage.other',
    description: 'Selection label for "other" option',
    defaultMessage: 'Other'
  },
  commentsOrNotesLabel: {
    defaultMessage: 'Comments or notes',
    id: 'formFields.registration.commentsOrNotes',
    description: 'Input label for comments or notes textarea'
  },
  commentsOrNotesDescription: {
    id: 'formFields.registration.commentsOrNotes.description',
    description: 'Help text for the notes field',
    defaultMessage:
      'Use this section to add any comments or notes that might be relevant to the completion and certification of this registration. This information won’t be shared with the informants.'
  }
})

export const registrationSection: IFormSection = {
  id: 'registration',
  viewType: 'form',
  name: messages.registrationTab,
  title: messages.registrationTitle,
  fields: [
    {
      name: 'presentAtBirthRegistration',
      type: SELECT_WITH_OPTIONS,
      label: messages.whoIsPresentLabel,
      required: true,
      initialValue: '',
      validate: [],
      options: [
        {
          value: 'BOTH_PARENTS',
          label: messages.presentBoth
        },
        {
          value: 'MOTHER_ONLY',
          label: messages.presentMother
        },
        {
          value: 'FATHER_ONLY',
          label: messages.presentFather
        },
        {
          value: 'OTHER',
          label: messages.presentOther
        }
      ]
    },
    {
      name: 'whoseContactDetails',
      type: SELECT_WITH_OPTIONS,
      label: messages.whoseContactDetailsLabel,
      required: true,
      initialValue: '',
      validate: [],
      options: [
        {
          value: 'BOTH',
          label: messages.contactDetailsBoth
        },
        {
          value: 'MOTHER',
          label: messages.contactDetailsMother
        },
        {
          value: 'FATHER',
          label: messages.contactDetailsFather
        }
      ]
    },
    {
      name: 'registrationEmail',
      type: TEXT,
      label: messages.registrationEmailLabel,
      required: true,
      initialValue: '',
      validate: [emailAddressFormat]
    },
    {
      name: 'registrationPhone',
      type: TEL,
      label: messages.registrationPhoneLabel,
      required: true,
      initialValue: '',
      validate: [phoneNumberFormat]
    },
    {
      name: 'registrationCertificateLanguage',
      type: CHECKBOX_GROUP,
      label: messages.registrationCertificateLanguage,
      required: true,
      initialValue: [],
      validate: [],
      options: [
        {
          value: 'bn',
          label: messages.registrationCertificateBN
        },
        {
          value: 'en',
          label: messages.registrationCertificateEN
        },
        {
          value: 'other',
          label: messages.registrationCertificateOther
        }
      ]
    },
    {
      name: 'paperFormNumber',
      type: NUMBER,
      label: messages.paperFormNumberLabel,
      required: true,
      initialValue: '',
      validate: []
    },
    {
      name: 'commentsOrNotes',
      type: TEXTAREA,
      label: messages.commentsOrNotesLabel,
      required: false,
      initialValue: '',
      validate: [],
      description: messages.commentsOrNotesDescription
    }
  ]
}

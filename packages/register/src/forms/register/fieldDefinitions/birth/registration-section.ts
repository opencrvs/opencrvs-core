import { defineMessages } from 'react-intl'
import {
  IFormSection,
  SELECT_WITH_OPTIONS,
  TEL,
  TEXTAREA,
  WARNING
} from '@register/forms'
import { phoneNumberFormat } from '@register/utils/validate'
import {
  fieldNameTransformer,
  fieldToCommentTransformer,
  sectionFieldToBundleFieldTransformer
} from '@register/forms/mappings/mutation/field-mappings'
import {
  fieldValueTransformer,
  bundleFieldToSectionFieldTransformer,
  commentToFieldTransformer
} from '@register/forms/mappings/query/field-mappings'
import { setRegistrationSectionTransformer } from '@register/forms/register/fieldDefinitions/birth/mappings/mutation/registration-mappings'
import { getRegistrationSectionTransformer } from '@register/forms/register/fieldDefinitions/birth/mappings/query/registration-mappings'

const messages: {
  [key: string]: ReactIntl.FormattedMessage.MessageDescriptor
} = defineMessages({
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
    defaultMessage: 'Who is present for the registration',
    id: 'formFields.registration.whoIsPresent',
    description: 'Input label for who is present input'
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
    defaultMessage: 'Who is the contact person for this application?',
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
  phoneVerificationWarning: {
    id: 'formFields.registration.phoneVerificationWarning',
    defaultMessage:
      'Check with the applicant that the mobile phone number you have entered is correct',
    description: 'Warning message to verify applicant phone number '
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
      required: false,
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
      ],
      mapping: {
        mutation: sectionFieldToBundleFieldTransformer(),
        query: bundleFieldToSectionFieldTransformer()
      }
    },
    {
      name: 'whoseContactDetails',
      type: SELECT_WITH_OPTIONS,
      label: messages.whoseContactDetailsLabel,
      required: false,
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
      ],
      mapping: {
        mutation: fieldNameTransformer('contact'),
        query: fieldValueTransformer('contact')
      }
    },
    {
      name: 'registrationPhone',
      type: TEL,
      label: messages.registrationPhoneLabel,
      required: true,
      initialValue: '',
      validate: [phoneNumberFormat],
      mapping: {
        mutation: fieldNameTransformer('contactPhoneNumber'),
        query: fieldValueTransformer('contactPhoneNumber')
      }
    },
    {
      name: 'phoneVerificationWarning',
      type: WARNING,
      label: messages.phoneVerificationWarning,
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
      description: messages.commentsOrNotesDescription,
      mapping: {
        mutation: fieldToCommentTransformer,
        query: commentToFieldTransformer
      }
    }
  ],
  mapping: {
    mutation: setRegistrationSectionTransformer,
    query: getRegistrationSectionTransformer
  }
}

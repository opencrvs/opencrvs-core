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
    id: 'register.form.section.application.name',
    defaultMessage: 'Registration',
    description: 'Form section name for Registration'
  },
  registrationTitle: {
    id: 'register.form.section.application.title',
    defaultMessage: 'Registration',
    description: 'Form section title for Registration'
  },
  whoIsPresentLabel: {
    defaultMessage: 'Who is present for the registration',
    id: 'form.field.label.application.whoIsPresent',
    description: 'Input label for who is present input'
  },
  presentBoth: {
    id: 'form.field.label.application.whoIsPresent.both',
    defaultMessage: 'Both Parents',
    description: 'Label for "Both Parents" select option'
  },
  presentMother: {
    id: 'form.field.label.application.whoIsPresent.mother',
    defaultMessage: 'Mother',
    description: 'Label for "Mother" select option'
  },
  presentFather: {
    id: 'form.field.label.application.whoIsPresent.father',
    defaultMessage: 'Father',
    description: 'Label for "Father" select option'
  },
  presentOther: {
    id: 'form.field.label.application.whoIsPresent.other',
    defaultMessage: 'Other',
    description: 'Label for "Other" select option'
  },
  whoseContactDetailsLabel: {
    defaultMessage: 'Who is the contact person for this application?',
    id: 'form.field.label.application.whoseContactDetails',
    description: 'Input label for contact details person'
  },
  contactDetailsBoth: {
    id: 'form.field.label.application.whoseContactDetails.both',
    defaultMessage: 'Both Parents',
    description: 'Label for "Both Parents" select option'
  },
  contactDetailsMother: {
    id: 'form.field.label.application.whoseContactDetails.mother',
    defaultMessage: 'Mother',
    description: 'Label for "Mother" select option'
  },
  contactDetailsFather: {
    id: 'form.field.label.application.whoseContactDetails.father',
    defaultMessage: 'Father',
    description: 'Label for "Father" select option'
  },
  contactDetailsOther: {
    id: 'form.field.label.application.whoseContactDetails.other',
    defaultMessage: 'Other',
    description: 'Label for "Other" select option'
  },
  registrationPhoneLabel: {
    defaultMessage: 'Phone number',
    id: 'form.field.label.application.phone',
    description: 'Input label for phone input'
  },
  registrationCertificateLanguage: {
    defaultMessage:
      'Which languages does the informant want the certificate issued in?',
    id: 'form.field.label.application.certificateLanguage',
    description: 'Input label for certificate language checkboxes'
  },
  registrationCertificateBN: {
    id: 'languages.bengali',
    description: 'Selection label for "bn" option',
    defaultMessage: 'Bangla'
  },
  registrationCertificateEN: {
    id: 'languages.english',
    description: 'Selection label for "en" option',
    defaultMessage: 'English'
  },
  registrationCertificateOther: {
    id: 'form.field.label.application.certificateLanguage.other',
    description: 'Selection label for "other" option',
    defaultMessage: 'Other'
  },
  phoneVerificationWarning: {
    id: 'form.field.label.application.phoneVerificationWarning',
    defaultMessage:
      'Check with the applicant that the mobile phone number you have entered is correct',
    description: 'Warning message to verify applicant phone number '
  },
  commentsOrNotesLabel: {
    defaultMessage: 'Comments or notes',
    id: 'form.field.label.application.commentsOrNotes',
    description: 'Input label for comments or notes textarea'
  },
  commentsOrNotesDescription: {
    id: 'form.field.label.application.commentsOrNotes.description',
    description: 'Help text for the notes field',
    defaultMessage:
      'Use this section to add any comments or notes that might be relevant to the completion and certification of this registration. This information won’t be shared with the informants.'
  },
  select: {
    id: 'register.select.placeholder',
    defaultMessage: 'Select'
  }
})

export const registrationSection: IFormSection = {
  id: 'registration',
  viewType: 'hidden',
  name: messages.registrationTab,
  title: messages.registrationTitle,
  groups: [
    {
      id: 'registration-view-group',
      fields: [
        {
          name: 'presentAtBirthRegistration',
          type: SELECT_WITH_OPTIONS,
          label: messages.whoIsPresentLabel,
          required: false,
          initialValue: '',
          validate: [],
          placeholder: messages.select,
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
          placeholder: messages.select,
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
      ]
    }
  ],
  mapping: {
    mutation: setRegistrationSectionTransformer,
    query: getRegistrationSectionTransformer
  }
}

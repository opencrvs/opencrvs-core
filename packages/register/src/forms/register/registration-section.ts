import { defineMessages } from 'react-intl'
import { IFormSection } from 'src/forms'
import { phoneNumberFormat } from 'src/utils/validate'

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
  }
})

export const registrationSection: IFormSection = {
  id: 'registration',
  viewType: 'form',
  name: messages.registrationTab,
  title: messages.registrationTitle,
  fields: [
    {
      name: 'whoIsPresent',
      type: 'select',
      label: {
        defaultMessage: "Who's present for the registration",
        id: 'formFields.registration.whoIsPresent',
        description: "Input label for Who's present input"
      },
      required: true,
      initialValue: '',
      validate: [],
      options: [
        {
          value: 'BOTH',
          label: {
            id: 'formFields.registration.whoIsPresent.both',
            defaultMessage: 'Both Parents',
            description: 'Label for "Both Parents" select option'
          }
        },
        {
          value: 'MOTHER',
          label: {
            id: 'formFields.registration.whoIsPresent.mother',
            defaultMessage: 'Mother',
            description: 'Label for "Mother" select option'
          }
        },
        {
          value: 'FATHER',
          label: {
            id: 'formFields.registration.whoIsPresent.father',
            defaultMessage: 'Father',
            description: 'Label for "Father" select option'
          }
        },
        {
          value: 'OTHER',
          label: {
            id: 'formFields.registration.whoIsPresent.other',
            defaultMessage: 'Other',
            description: 'Label for "Other" select option'
          }
        }
      ]
    },
    {
      name: 'whoseContactDetails',
      type: 'select',
      label: {
        defaultMessage:
          'Whose contact details would the informant want to share for communication purposes?',
        id: 'formFields.registration.whoseContactDetails',
        description: 'Input label for contact details person'
      },
      required: true,
      initialValue: '',
      validate: [],
      options: [
        {
          value: 'BOTH',
          label: {
            id: 'formFields.registration.whoseContactDetails.both',
            defaultMessage: 'Both Parents',
            description: 'Label for "Both Parents" select option'
          }
        },
        {
          value: 'MOTHER',
          label: {
            id: 'formFields.registration.whoseContactDetails.mother',
            defaultMessage: 'Mother',
            description: 'Label for "Mother" select option'
          }
        },
        {
          value: 'FATHER',
          label: {
            id: 'formFields.registration.whoseContactDetails.father',
            defaultMessage: 'Father',
            description: 'Label for "Father" select option'
          }
        },
        {
          value: 'OTHER',
          label: {
            id: 'formFields.registration.whoseContactDetails.other',
            defaultMessage: 'Other',
            description: 'Label for "Other" select option'
          }
        }
      ]
    },
    {
      name: 'registrationEmail',
      type: 'text',
      label: {
        defaultMessage: 'Email address',
        id: 'formFields.registration.email',
        description: 'Input label for email input'
      },
      required: true,
      initialValue: '',
      validate: []
    },
    {
      name: 'registrationPhone',
      type: 'text',
      label: {
        defaultMessage: 'Phone number',
        id: 'formFields.registration.phone',
        description: 'Input label for phone input'
      },
      required: true,
      initialValue: '',
      validate: [phoneNumberFormat]
    },
    {
      name: 'registrationCertificateLanguage',
      type: 'text',
      label: {
        // TODO
        defaultMessage:
          'Which languages does the informant want the certificate issued in?',
        id: 'formFields.registration.certificateLanguage',
        description: 'Input label for certificate language checkboxes'
      },
      required: true,
      initialValue: '',
      validate: []
    },
    {
      name: 'paperFormNumber',
      type: 'text',
      label: {
        defaultMessage: 'Paper form number',
        id: 'formFields.registration.paperFormNumber',
        description: 'Input label for paper form number input'
      },
      required: true,
      initialValue: '',
      validate: []
    },
    {
      name: 'commentsOrNotes',
      type: 'text',
      label: {
        defaultMessage: 'Comments or notes',
        id: 'formFields.registration.commentsOrNotes',
        description: 'Input label for comments or notes textarea'
      },
      required: false,
      initialValue: '',
      validate: []
    }
  ]
}

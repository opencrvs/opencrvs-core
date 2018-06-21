import { defineMessages } from 'react-intl'
/* istanbul ignore file */

export const messages = defineMessages({
  stepOneTitle: {
    id: 'login.stepOneTitle',
    defaultMessage: 'Login to OpenCRVS',
    description: 'The title that appears in step one of the form'
  },
  stepOneInstruction: {
    id: 'login.stepOneInstruction',
    defaultMessage: 'Please enter your mobile number and password.',
    description: 'The instruction that appears in step one of the form'
  },
  mobileNumberLabel: {
    id: 'login.mobileNumberLabel',
    defaultMessage: 'Mobile number',
    description: 'The label that appears on the mobile number input'
  },
  mobileNumberPlaceholder: {
    id: 'login.mobileNumberPlaceholder',
    defaultMessage: 'e.g: +44-7XXX-XXXXXX',
    description: 'The placeholder that appears on the mobile number input'
  },
  passwordLabel: {
    id: 'login.passwordLabel',
    defaultMessage: 'Password',
    description: 'The label that appears on the password input'
  },
  submit: {
    id: 'login.submit',
    defaultMessage: 'Submit',
    description: 'The label that appears on the submit button'
  }
})

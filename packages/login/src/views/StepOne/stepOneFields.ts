import * as validations from '../../utils/validate'

import { defineMessages } from 'react-intl'

export const messages = defineMessages({
  mobileLabel: {
    id: 'login.mobileLabel',
    defaultMessage: 'Mobile number',
    description: 'The label that appears on the mobile number input'
  },
  mobilePlaceholder: {
    id: 'login.mobilePlaceholder',
    defaultMessage: '07XXXXXXXXX',
    description: 'The placeholder that appears on the mobile number input'
  },
  passwordLabel: {
    id: 'login.passwordLabel',
    defaultMessage: 'Password',
    description: 'The label that appears on the password input'
  }
})

export const stepOneFields = {
  mobile: {
    id: 'mobile',
    name: 'mobile',
    maxLength: 11,
    validate: [validations.required, validations.phoneNumberFormat],
    disabled: false,
    type: 'tel',
    focusInput: false,
    label: messages.mobileLabel,
    placeholder: messages.mobilePlaceholder
  },
  password: {
    id: 'password',
    name: 'password',
    validate: [validations.required],
    disabled: false,
    type: 'password',
    focusInput: false,
    label: messages.passwordLabel
  }
}

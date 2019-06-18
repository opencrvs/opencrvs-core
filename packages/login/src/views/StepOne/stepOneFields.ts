import { defineMessages } from 'react-intl'

export const messages: {
  [key: string]: ReactIntl.FormattedMessage.MessageDescriptor
} = defineMessages({
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
    validate: [],
    disabled: false,
    type: 'tel',
    focusInput: false,
    label: messages.mobileLabel
  },
  password: {
    id: 'password',
    name: 'password',
    validate: [],
    disabled: false,
    type: 'password',
    focusInput: false,
    label: messages.passwordLabel
  }
}

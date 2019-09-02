import { defineMessages, MessageDescriptor } from 'react-intl'

export const messages: {
  [key: string]: MessageDescriptor
} = defineMessages({
  username: {
    id: 'login.username',
    defaultMessage: 'User Name',
    description: 'The label that appears on the mobile number input'
  },
  passwordLabel: {
    id: 'login.passwordLabel',
    defaultMessage: 'Password',
    description: 'The label that appears on the password input'
  }
})

export const stepOneFields = {
  username: {
    id: 'username',
    name: 'username',
    // maxLength: 11,
    validate: [],
    disabled: false,
    type: 'text',
    focusInput: false,
    label: messages.username
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

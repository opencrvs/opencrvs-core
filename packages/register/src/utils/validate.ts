import { defineMessages } from 'react-intl'
import { config } from '../config'
import { FormattedMessage, MessageValue } from 'react-intl'

import { validate as validateEmail } from 'email-validator'

export interface IValidationResult {
  message: FormattedMessage.MessageDescriptor
  props?: { [key: string]: MessageValue }
}

export type Validation = (value: string) => IValidationResult | undefined

export const messages = defineMessages({
  required: {
    id: 'validations.required',
    defaultMessage: 'Required',
    description: 'The error message that appears on required fields'
  },
  minLength: {
    id: 'validations.minLength',
    defaultMessage: 'Must be {min} characters or more',
    description:
      'The error message that appears on fields with a minimum length'
  },
  numberRequired: {
    id: 'validations.numberRequired',
    defaultMessage: 'Must be a number',
    description:
      'The error message that appears on fields where the value must be a number'
  },
  phoneNumberFormat: {
    id: 'validations.phoneNumberFormat',
    defaultMessage:
      'Must be a valid {locale} mobile phone number. Starting with 0. E.G. {format}',
    description:
      'The error message that appears on phone numbers where the first character must be a 0'
  },
  mobilePhoneRegex: {
    id: 'validations.mobilePhoneRegex',
    defaultMessage: '07[0-9]{9,10}',
    description:
      'The regular expression to use when validating a local mobile phone number'
  },
  mobileNumberFormat: {
    id: 'validations.mobileNumberFormat',
    defaultMessage: '07123456789',
    description:
      'The format of the mobile number that appears in an error message'
  },
  requiredSymbol: {
    id: 'validations.requiredSymbol',
    defaultMessage: '',
    description:
      'A blank error message. Used for highlighting a required field without showing an error'
  },
  emailAddressFormat: {
    id: 'validations.emailAddressFormat',
    defaultMessage: 'Must be a valid email address',
    description:
      'The error message appears when the email addresses are not valid'
  }
})

const dynamicValidationProps = {
  phoneNumberFormat: {
    min: 10,
    locale: config.LOCALE.toUpperCase(),
    format: messages.mobileNumberFormat.defaultMessage
  }
}

export const isAValidPhoneNumberFormat = (value: string): boolean => {
  const numberRexExp = new RegExp(messages.mobilePhoneRegex.defaultMessage)
  return numberRexExp.test(value)
}
export const isAValidEmailAddressFormat = (value: string): boolean => {
  return validateEmail(value)
}

export const requiredSymbol: Validation = (value: string) =>
  value ? undefined : { message: messages.requiredSymbol }

export const required: Validation = (value: string | boolean) => {
  if (typeof value === 'string') {
    return value !== '' ? undefined : { message: messages.required }
  }
  return value !== undefined ? undefined : { message: messages.required }
}

export const minLength = (min: number) => (value: string) => {
  return value && value.length < min
    ? { message: messages.minLength, props: { min } }
    : undefined
}

export const isNumber: Validation = (value: string) =>
  value && isNaN(Number(value))
    ? { message: messages.numberRequired }
    : undefined

export const phoneNumberFormat: Validation = (value: string) => {
  return value && isAValidPhoneNumberFormat(value)
    ? undefined
    : {
        message: messages.phoneNumberFormat,
        props: dynamicValidationProps.phoneNumberFormat
      }
}

export const emailAddressFormat: Validation = (value: string) => {
  return value && isAValidEmailAddressFormat(value)
    ? undefined
    : {
        message: messages.emailAddressFormat
      }
}

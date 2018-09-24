import { defineMessages } from 'react-intl'
import { config } from '../config'
import { FormattedMessage, MessageValue } from 'react-intl'
import * as XRegExp from 'xregexp'

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
  bengaliNameFormat: {
    id: 'validations.bengaliNameFormat',
    defaultMessage: 'Must contain only Bengali letters',
    description:
      'The error message that appears when a non letter character is used in a Bengali name'
  },
  englishNameFormat: {
    id: 'validations.englishNameFormat',
    defaultMessage: 'Must contain only English letters',
    description:
      'The error message that appears when a non letter character is used in an English name'
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

/*
 * TODO: The name validation functions should be refactored out.
 *
 * Name validation has some complexities. These will vary from country to
 * country too. e.g. in Bangladesh there is actually no given name or
 * family name. Or first name/last name. To fit names in the common western
 * format, people have to use multiple words in a "first name" or a "last name".
 *
 * Another complexity is what letters are allowed. Should we allow hyphens?
 * Then in Bengali, there are some rules which we can build to ensure better
 * quality input. e.g. a word can not start with a "mark" or diatribe.
 *
 * For now, we are going with simple validation that just prevents non-letter
 * input.
 */

//
// Each character has to be a part of the Unicode Bengali script
// and it has to be a part of the Unicode letter category.
//
export const isValidBengaliLettersWord = (value: string): boolean => {
  const bengaliRe = XRegExp.cache('^\\p{Bengali}+$')
  const nameLettersRe = XRegExp.cache('^[\\pL\\pM]+$')

  return bengaliRe.test(value) && nameLettersRe.test(value)
}

//
// Simple pattern. Allow only english letters.
//
export const isValidEnglishLettersWord = (value: string): boolean => {
  // Still using XRegExp for its caching ability
  const englishRe = XRegExp.cache('^[A-Za-z]+$')

  return englishRe.test(value)
}

type Checker = (value: string) => boolean

//
// Utility 2nd order function. Does a little common task then passes on to
// the callback.
//
const checkNameWords = (value: string, checker: Checker): boolean => {
  const trimmedValue = value === undefined || value === null ? '' : value.trim()

  if (!trimmedValue) {
    return true
  }

  const parts: string[] = trimmedValue.split(/\s+/)
  return parts.every(checker)
}

export const isValidBengaliName = (value: string): boolean => {
  return checkNameWords(value, isValidBengaliLettersWord)
}

export const isValidEnglishName = (value: string): boolean => {
  return checkNameWords(value, isValidEnglishLettersWord)
}

export const bengaliNameFormat: Validation = (value: string) => {
  return isValidBengaliName(value)
    ? undefined
    : { message: messages.bengaliNameFormat }
}

export const englishNameFormat: Validation = (value: string) => {
  return isValidEnglishName(value)
    ? undefined
    : { message: messages.englishNameFormat }
}

export const emailAddressFormat: Validation = (value: string) => {
  return value && isAValidEmailAddressFormat(value)
    ? undefined
    : {
        message: messages.emailAddressFormat
      }
}

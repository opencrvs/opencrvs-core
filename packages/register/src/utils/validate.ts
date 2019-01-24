import { defineMessages } from 'react-intl'
import { FormattedMessage, MessageValue } from 'react-intl'
import { IFormFieldValue } from '@opencrvs/register/src/forms'

import { validate as validateEmail } from 'email-validator'
import * as XRegExp from 'xregexp'
import { isArray } from 'util'

export interface IValidationResult {
  message: FormattedMessage.MessageDescriptor
  props?: { [key: string]: MessageValue }
}

export type Validation = (
  value: IFormFieldValue
) => IValidationResult | undefined

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
      'Must be 11 digit valid mobile phone number that stars with 01',
    description:
      'The error message that appears on phone numbers where the first two characters must be a 01 and length must be 11'
  },
  dateFormat: {
    id: 'validations.dateFormat',
    defaultMessage: 'Must be a valid date',
    description: 'The error message appears when the given date is not valid'
  },
  emailAddressFormat: {
    id: 'validations.emailAddressFormat',
    defaultMessage: 'Must be a valid email address',
    description:
      'The error message appears when the email addresses are not valid'
  },
  requiredSymbol: {
    id: 'validations.requiredSymbol',
    defaultMessage: '',
    description:
      'A blank error message. Used for highlighting a required field without showing an error'
  },
  bengaliOnlyNameFormat: {
    id: 'validations.bengaliOnlyNameFormat',
    defaultMessage: 'Must contain only Bengali characters',
    description:
      'The error message that appears when a non bengali character is used in a Bengali name'
  },
  englishOnlyNameFormat: {
    id: 'validations.englishOnlyNameFormat',
    defaultMessage: 'Must contain only English characters',
    description:
      'The error message that appears when a non English character is used in an English name'
  },
  range: {
    id: 'validations.range',
    defaultMessage: 'Must be within {min} and {max}',
    description:
      'The error message that appears when an out of range value is used'
  }
})

// @ts-ignore
const fallbackCountry = window.config.COUNTRY

const mobilePhonePatternTable = {
  gbr: {
    pattern: /^07[0-9]{9,10}$/,
    example: '07123456789'
  },
  bgd: {
    pattern: /^01[156789][0-9]{8}$/,
    example: '01741234567'
  }
}

export const isAValidPhoneNumberFormat = (
  value: string,
  country: string
): boolean => {
  const countryMobileTable =
    mobilePhonePatternTable[country] || mobilePhonePatternTable[fallbackCountry]
  const { pattern } = countryMobileTable
  return pattern.test(value)
}
export const isAValidEmailAddressFormat = (value: string): boolean => {
  return validateEmail(value)
}

export const isAValidDateFormat = (value: string): boolean => {
  const dateFormatRegex = '^\\d{4}-(0?[1-9]|1[012])-(0?[1-9]|[12][0-9]|3[01])$'
  const dateRegex = new RegExp(dateFormatRegex)

  if (!dateRegex.test(value)) {
    return false
  }

  const pad = (n: number) => {
    return (str: string) => {
      while (str.length < n) {
        str = '0' + str
      }
      return str
    }
  }

  const valueISOString = value
    .split(/-/g)
    .map(pad(2))
    .join('-')

  const givenDate = new Date(valueISOString)

  return givenDate.toISOString().slice(0, 10) === valueISOString
}

export const requiredSymbol: Validation = (value: string) =>
  value ? undefined : { message: messages.requiredSymbol }

export const required: Validation = (value: string | boolean | string[]) => {
  if (typeof value === 'string') {
    return value !== '' ? undefined : { message: messages.required }
  }
  if (isArray(value)) {
    return value.length > 0 ? undefined : { message: messages.required }
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
  // @ts-ignore
  const country = window.config.COUNTRY
  const countryMobileTable =
    mobilePhonePatternTable[country] || mobilePhonePatternTable[fallbackCountry]
  const { example } = countryMobileTable
  const validationProps = { example }

  const trimmedValue = value === undefined || value === null ? '' : value.trim()

  if (!trimmedValue) {
    return undefined
  }

  return isAValidPhoneNumberFormat(trimmedValue, country)
    ? undefined
    : {
        message: messages.phoneNumberFormat,
        props: validationProps
      }
}

export const emailAddressFormat: Validation = (value: string) => {
  return value && isAValidEmailAddressFormat(value)
    ? undefined
    : {
        message: messages.emailAddressFormat
      }
}

export const dateFormat: Validation = (value: string) => {
  return value && isAValidDateFormat(value)
    ? undefined
    : {
        message: messages.dateFormat
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
 * For now, we are going with simple validation that just prevents entering
 * an English name in the Bengali name field and vice versa.
 */

//
// Each character has to be a part of the Unicode Bengali script or the hyphen.
//
export const isValidBengaliWord = (value: string): boolean => {
  const bengaliRe = XRegExp.cache('^[\\p{Bengali}-]+$')
  const lettersRe = XRegExp.cache('^[\\pL\\pM-]+$')

  return bengaliRe.test(value) && lettersRe.test(value)
}

//
// Simple pattern. Allow only English (Latin) characters and the hyphen.
//
export const isValidEnglishWord = (value: string): boolean => {
  // Still using XRegExp for its caching ability
  const englishRe = XRegExp.cache('^[\\p{Latin}-]+$')

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
  return checkNameWords(value, isValidBengaliWord)
}

export const isValidEnglishName = (value: string): boolean => {
  return checkNameWords(value, isValidEnglishWord)
}

export const isValueWithinRange = (min: number, max: number) => (
  value: number
): boolean => {
  return !isNaN(value) && value >= min && value <= max
}

export const bengaliOnlyNameFormat: Validation = (value: string) => {
  return isValidBengaliName(value)
    ? undefined
    : { message: messages.bengaliOnlyNameFormat }
}

export const englishOnlyNameFormat: Validation = (value: string) => {
  return isValidEnglishName(value)
    ? undefined
    : { message: messages.englishOnlyNameFormat }
}

export const range = (min: number, max: number) => (value: string) => {
  return isValueWithinRange(min, max)(parseFloat(value))
    ? undefined
    : { message: messages.range, props: { min, max } }
}

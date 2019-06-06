import { defineMessages, FormattedMessage, MessageValue } from 'react-intl'

import { IFormFieldValue } from '@opencrvs/register/src/forms'
import {
  REGEXP_BLOCK_ALPHA_NUMERIC_DOT,
  REGEXP_ALPHA_NUMERIC,
  REGEXP_BLOCK_ALPHA_NUMERIC
} from '@register/utils/constants'
import { validate as validateEmail } from 'email-validator'
import * as XRegExp from 'xregexp'
import { isArray } from 'util'
import {
  NATIONAL_ID,
  BIRTH_REGISTRATION_NUMBER,
  DEATH_REGISTRATION_NUMBER,
  PASSPORT
} from '@register/forms/identity'

import { string } from 'joi'

export interface IValidationResult {
  message: FormattedMessage.MessageDescriptor
  props?: { [key: string]: MessageValue }
}

export type RangeValidation = (
  min: number,
  max: number
) => (value: IFormFieldValue) => IValidationResult | undefined

export type MaxLengthValidation = (
  customisation: number
) => (value: IFormFieldValue) => IValidationResult | undefined

export type Validation = (
  value: IFormFieldValue
) => IValidationResult | undefined

export type ValidationInitializer = (...value: any[]) => Validation

export const messages: {
  [key: string]: ReactIntl.FormattedMessage.MessageDescriptor
} = defineMessages({
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
  maxLength: {
    id: 'validations.maxLength',
    defaultMessage: 'Must not be more than {max} characters',
    description:
      'The error message that appears on fields with a maximum length'
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
      'Must be {num} digit valid mobile phone number that stars with {start}',
    description:
      'The error message that appears on phone numbers where the first two characters must be a 01 and length must be 11'
  },
  dateFormat: {
    id: 'validations.dateFormat',
    defaultMessage: 'Must be a valid date',
    description: 'The error message appears when the given date is not valid'
  },
  isValidBirthDate: {
    id: 'validations.isValidBirthDate',
    defaultMessage: 'Must be a valid birth date',
    description:
      'The error message appears when the given birth date is not valid'
  },
  dobEarlierThanDom: {
    id: 'validations.dobEarlierThanDom',
    defaultMessage: 'Must be earlier than marriage date',
    description:
      'The error message appears when the given birth date is later than the given marriage date'
  },
  domLaterThanDob: {
    id: 'validations.domLaterThanDob',
    defaultMessage: 'Must be later than birth date',
    description:
      'The error message appears when the given marriage date is earlier than the given birth date'
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
  },
  validNationalId: {
    id: 'validations.validNationalId',
    defaultMessage:
      'The National ID can only be numeric and must be {validLength} digits long',
    description:
      'The error message that appears when an invalid value is used as nid'
  },
  validBirthRegistrationNumber: {
    id: 'validations.validBirthRegistrationNumber',
    defaultMessage:
      'The Birth Registration Number can only contain block character and number where the length must be within {min} and {max}',
    description:
      'The error message that appears when an invalid value is used as brn'
  },
  validDeathRegistrationNumber: {
    id: 'validations.validDeathRegistrationNumber',
    defaultMessage:
      'The Death Registration Number can only be alpha numeric and must be {validLength} characters long',
    description:
      'The error message that appears when an invalid value is used as drn'
  },
  validPassportNumber: {
    id: 'validations.validPassportNumber',
    defaultMessage:
      'The Passport Number can only be alpha numeric and must be {validLength} characters long',
    description:
      'The error message that appears when an invalid value is used as passport number'
  },
  isValidDateOfDeath: {
    id: 'validations.isValidDateOfDeath',
    defaultMessage: 'Must be a valid date of death',
    description:
      'The error message appears when the given date of death is not valid'
  },
  greaterThanZero: {
    id: 'validations.greaterThanZero',
    defaultMessage: 'Must be a greater than zero',
    description:
      'The error message appears when input is less than or equal to 0'
  },
  blockAlphaNumericDot: {
    id: 'validations.blockAlphaNumericDot',
    defaultMessage:
      'Can contain only block character, number and dot (e.g. C91.5)',
    description: 'The error message that appears when an invalid value is used'
  }
})

const fallbackCountry = window.config.COUNTRY

interface IMobilePhonePattern {
  pattern: RegExp
  example: string
  start: string
  num: string
}

const mobilePhonePatternTable: { [key: string]: IMobilePhonePattern } = {
  gbr: {
    pattern: /^07[0-9]{9,10}$/,
    example: '07123456789',
    start: '07',
    num: '10 or 11'
  },
  bgd: {
    pattern: /^01[1-9][0-9]{8}$/,
    example: '01741234567',
    start: '01',
    num: '11'
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

export const requiredSymbol: Validation = (value: IFormFieldValue) =>
  value ? undefined : { message: messages.requiredSymbol }

export const required: Validation = (value: IFormFieldValue) => {
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

const isLessOrEqual = (value: string, max: number) => {
  return value && value.toString().length <= max
}

export const maxLength: MaxLengthValidation = (max: number) => (
  value: IFormFieldValue
) => {
  return isLessOrEqual(value as string, max)
    ? undefined
    : { message: messages.maxLength, props: { max } }
}

const isNumber = (value: string): boolean => !value || !isNaN(Number(value))

const isRegexpMatched = (value: string, regexp: string): boolean =>
  !value || value.match(regexp) !== null

export const blockAlphaNumericDot: Validation = (value: IFormFieldValue) => {
  const cast = value as string
  return isRegexpMatched(cast, REGEXP_BLOCK_ALPHA_NUMERIC_DOT)
    ? undefined
    : { message: messages.blockAlphaNumericDot }
}

export const numeric: Validation = (value: IFormFieldValue) => {
  const cast = value as string
  return isNumber(cast) ? undefined : { message: messages.numberRequired }
}

export const phoneNumberFormat: Validation = (value: IFormFieldValue) => {
  const country = window.config.COUNTRY
  const countryMobileTable =
    mobilePhonePatternTable[country] || mobilePhonePatternTable[fallbackCountry]
  const { start, num } = countryMobileTable
  const validationProps = { start, num }

  const cast = value as string
  const trimmedValue = cast === undefined || cast === null ? '' : cast.trim()

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

export const emailAddressFormat: Validation = (value: IFormFieldValue) => {
  const cast = value as string
  return cast && isAValidEmailAddressFormat(cast)
    ? undefined
    : {
        message: messages.emailAddressFormat
      }
}

export const dateFormat: Validation = (value: IFormFieldValue) => {
  const cast = value as string
  return cast && isAValidDateFormat(cast)
    ? undefined
    : {
        message: messages.dateFormat
      }
}

export const isDateNotInFuture = (date: string) => {
  return new Date(date) <= new Date(new Date())
}

export const isValidBirthDate: Validation = (value: IFormFieldValue) => {
  const cast = value as string
  return cast && isDateNotInFuture(cast) && isAValidDateFormat(cast)
    ? undefined
    : {
        message: messages.isValidBirthDate
      }
}

export const checkBirthDate: ValidationInitializer = (
  marriageDate: string
): Validation => (value: IFormFieldValue) => {
  const cast = value as string
  if (!isAValidDateFormat(cast)) {
    return {
      message: messages.dateFormat
    }
  }

  const bDate = new Date(cast)
  // didn't call `isDateNotInFuture(value)`, because no need to call `new Date(value)` twice
  if (bDate > new Date()) {
    return {
      message: messages.dateFormat
    }
  }

  if (!marriageDate || !isAValidDateFormat(marriageDate)) {
    return undefined
  }

  return bDate < new Date(marriageDate)
    ? undefined
    : {
        message: messages.dobEarlierThanDom
      }
}

export const checkMarriageDate: ValidationInitializer = (
  birthDate: string
): Validation => (value: IFormFieldValue) => {
  const cast = value as string
  if (!isAValidDateFormat(cast)) {
    return {
      message: messages.dateFormat
    }
  }

  const mDate = new Date(cast)
  // didn't call `isDateNotInFuture(value)`, because no need to call `new Date(value)` twice
  if (mDate > new Date()) {
    return {
      message: messages.dateFormat
    }
  }

  if (!birthDate || !isAValidDateFormat(birthDate)) {
    return undefined
  }

  return mDate > new Date(birthDate)
    ? undefined
    : {
        message: messages.domLaterThanDob
      }
}

export const dateGreaterThan: ValidationInitializer = (
  previousDate: string
): Validation => (value: IFormFieldValue) => {
  const cast = value as string
  if (!previousDate || !isAValidDateFormat(previousDate)) {
    return undefined
  }

  return new Date(cast) > new Date(previousDate)
    ? undefined
    : {
        message: messages.domLaterThanDob
      }
}

export const dateLessThan: ValidationInitializer = (
  laterDate: string
): Validation => (value: IFormFieldValue) => {
  const cast = value as string
  if (!laterDate || !isAValidDateFormat(laterDate)) {
    return undefined
  }

  return new Date(cast) < new Date(laterDate)
    ? undefined
    : {
        message: messages.dobEarlierThanDom
      }
}

export const dateNotInFuture: ValidationInitializer = (): Validation => (
  value: IFormFieldValue
) => {
  const cast = value as string
  if (isDateNotInFuture(cast)) {
    return undefined
  } else {
    return { message: messages.dateFormat }
  }
}

export const dateNotToday = (date: string): boolean => {
  const today = new Date().setHours(0, 0, 0, 0)
  const day = new Date(date).setHours(0, 0, 0, 0)
  return day !== today
}

export const isDateInPast: Validation = (value: IFormFieldValue) => {
  const cast = value as string
  if (isDateNotInFuture(cast) && dateNotToday(cast)) {
    return undefined
  } else {
    return { message: messages.isValidBirthDate } // specific to DOB of parent/applicant
  }
}

export const dateInPast: ValidationInitializer = (): Validation => (
  value: IFormFieldValue
) => isDateInPast(value)

export const dateFormatIsCorrect: ValidationInitializer = (): Validation => (
  value: IFormFieldValue
) => dateFormat(value)

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

const isLengthWithinRange = (value: string, min: number, max: number) =>
  !value || (value.length >= min && value.length <= max)

export const isValueWithinRange = (min: number, max: number) => (
  value: number
): boolean => {
  return !isNaN(value) && value >= min && value <= max
}

export const bengaliOnlyNameFormat: Validation = (value: IFormFieldValue) => {
  const cast = value as string
  return isValidBengaliName(cast)
    ? undefined
    : { message: messages.bengaliOnlyNameFormat }
}

export const englishOnlyNameFormat: Validation = (value: IFormFieldValue) => {
  const cast = value as string
  return isValidEnglishName(cast)
    ? undefined
    : { message: messages.englishOnlyNameFormat }
}

export const range: RangeValidation = (min: number, max: number) => (
  value: IFormFieldValue
) => {
  const cast = value as string
  return isValueWithinRange(min, max)(parseFloat(cast))
    ? undefined
    : { message: messages.range, props: { min, max } }
}

const hasValidLength = (value: string, length: number): boolean =>
  !value || value.length === length

export const validIDNumber: ValidationInitializer = (
  typeOfID: string
): Validation => (value: any) => {
  const validNationalIDLength = 13
  const validBirthRegistrationNumberLength = {
    min: 17,
    max: 18
  }
  const validDeathRegistrationNumberLength = 18
  const validPassportLength = 9
  switch (typeOfID) {
    case NATIONAL_ID:
      return hasValidLength(value.toString(), validNationalIDLength) &&
        isNumber(value.toString())
        ? undefined
        : {
            message: messages.validNationalId,
            props: { validLength: validNationalIDLength }
          }

    case BIRTH_REGISTRATION_NUMBER:
      return isLengthWithinRange(
        value.toString(),
        validBirthRegistrationNumberLength.min,
        validBirthRegistrationNumberLength.max
      ) && isRegexpMatched(value.toString(), REGEXP_BLOCK_ALPHA_NUMERIC)
        ? undefined
        : {
            message: messages.validBirthRegistrationNumber,
            props: validBirthRegistrationNumberLength
          }

    case DEATH_REGISTRATION_NUMBER:
      return hasValidLength(
        value.toString(),
        validDeathRegistrationNumberLength
      ) && isRegexpMatched(value.toString(), REGEXP_BLOCK_ALPHA_NUMERIC)
        ? undefined
        : {
            message: messages.validDeathRegistrationNumber,
            props: { validLength: validDeathRegistrationNumberLength }
          }

    case PASSPORT:
      return hasValidLength(value.toString(), validPassportLength) &&
        isRegexpMatched(value.toString(), REGEXP_ALPHA_NUMERIC)
        ? undefined
        : {
            message: messages.validPassportNumber,
            props: { validLength: validPassportLength }
          }

    default:
      return undefined
  }
}

export const isValidDeathOccurrenceDate: Validation = (
  value: IFormFieldValue
) => {
  const cast = value as string
  return value && isDateNotInFuture(cast) && isAValidDateFormat(cast)
    ? undefined
    : {
        message: messages.isValidDateOfDeath
      }
}

export const greaterThanZero: Validation = (value: IFormFieldValue) => {
  return value && Number(value) > 0
    ? undefined
    : {
        message: messages.greaterThanZero
      }
}

import { MessageDescriptor } from 'react-intl'
import { validationMessages as messages } from '@register/i18n/messages'
import { IFormFieldValue, IFormData } from '@opencrvs/register/src/forms'
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
  PASSPORT,
  DRIVING_LICENSE
} from '@register/forms/identity'

export interface IValidationResult {
  message: MessageDescriptor
  props?: { [key: string]: any }
}

export type RangeValidation = (
  min: number,
  max: number
) => (value: IFormFieldValue) => IValidationResult | undefined

export type MaxLengthValidation = (
  customisation: number
) => (value: IFormFieldValue) => IValidationResult | undefined

export type Validation = (
  value: IFormFieldValue,
  drafts?: IFormData
) => IValidationResult | undefined

export type ValidationInitializer = (...value: any[]) => Validation

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
  },
  zmb: {
    pattern: /^09(5|6|7){1}[0-9]{7}$/,
    example: '0970545855',
    start: '09[5|6|7]',
    num: '10'
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

export const validLength = (length: number) => (value: IFormFieldValue) => {
  return value && value.toString().length === length
    ? undefined
    : {
        message: messages.validNationalId,
        props: { validLength: length }
      }
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

export const isDateNotBeforeBirth = (date: string, drafts: IFormData) => {
  return new Date(date) >= new Date(JSON.stringify(drafts.deceased.birthDate))
}

export const isValidBirthDate: Validation = (value: IFormFieldValue) => {
  const cast = value as string
  return cast && isDateNotInFuture(cast) && isAValidDateFormat(cast)
    ? undefined
    : {
        message: messages.isValidBirthDate
      }
}

export const checkBirthDate = (marriageDate: string): Validation => (
  value: IFormFieldValue
) => {
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

export const checkMarriageDate = (birthDate: string): Validation => (
  value: IFormFieldValue
) => {
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

export const dateGreaterThan = (previousDate: string): Validation => (
  value: IFormFieldValue
) => {
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

export const dateLessThan = (laterDate: string): Validation => (
  value: IFormFieldValue
) => {
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

export const dateNotInFuture = (): Validation => (value: IFormFieldValue) => {
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

export const dateInPast = (): Validation => (value: IFormFieldValue) =>
  isDateInPast(value)

export const dateFormatIsCorrect = (): Validation => (value: IFormFieldValue) =>
  dateFormat(value)

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

// Each character has to be a part of the Unicode Bengali script or the hyphen.

export const isValidBengaliWord = (value: string): boolean => {
  const bengaliRe = XRegExp.cache('^[\\p{Bengali}-.]+$')
  const lettersRe = XRegExp.cache('^[\\pL\\pM-.]+$')

  return bengaliRe.test(value) && lettersRe.test(value)
}

//
// Simple pattern. Allow only English (Latin) characters and the hyphen.
//
export const isValidEnglishWord = (value: string): boolean => {
  // Still using XRegExp for its caching ability
  const englishRe = XRegExp.cache('^[\\p{Latin}-.]+$')

  return englishRe.test(value)
}

type Checker = (value: string) => boolean

// Utility 2nd order function. Does a little common task then passes on to
// the callback.

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

export const validIDNumber = (typeOfID: string): Validation => (value: any) => {
  const validNationalIDLength = 13
  const validBirthRegistrationNumberLength = {
    min: 17,
    max: 18
  }
  const validDeathRegistrationNumberLength = 18
  const validPassportLength = 9
  const validDrivingLicenseLength = 15
  value = (value && value.toString()) || ''
  switch (typeOfID) {
    case NATIONAL_ID:
      return hasValidLength(value, validNationalIDLength) &&
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
      ) && isRegexpMatched(value, REGEXP_BLOCK_ALPHA_NUMERIC)
        ? undefined
        : {
            message: messages.validBirthRegistrationNumber,
            props: validBirthRegistrationNumberLength
          }

    case DEATH_REGISTRATION_NUMBER:
      return hasValidLength(
        value.toString(),
        validDeathRegistrationNumberLength
      ) && isRegexpMatched(value, REGEXP_BLOCK_ALPHA_NUMERIC)
        ? undefined
        : {
            message: messages.validDeathRegistrationNumber,
            props: { validLength: validDeathRegistrationNumberLength }
          }

    case PASSPORT:
      return hasValidLength(value.toString(), validPassportLength) &&
        isRegexpMatched(value, REGEXP_ALPHA_NUMERIC)
        ? undefined
        : {
            message: messages.validPassportNumber,
            props: { validLength: validPassportLength }
          }
    case DRIVING_LICENSE:
      return hasValidLength(value, validDrivingLicenseLength) &&
        isRegexpMatched(value, REGEXP_ALPHA_NUMERIC)
        ? undefined
        : {
            message: messages.validDrivingLicenseNumber,
            props: { validLength: validDrivingLicenseLength }
          }
    default:
      return undefined
  }
}

export const isValidDeathOccurrenceDate: Validation = (
  value: IFormFieldValue,
  drafts
) => {
  const cast = value as string
  return value &&
    isDateNotInFuture(cast) &&
    isAValidDateFormat(cast) &&
    isDateNotBeforeBirth(cast, drafts as IFormData)
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

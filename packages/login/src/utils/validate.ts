import { defineMessages } from 'react-intl'
import { Validation } from '../type/fields'
import { IIntlDynamicProps } from '@opencrvs/components/lib/utils/intlUtils'
import { config } from '../config'

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
      'Must be a valid {locale} mobile phone number. Starting with 0. {min} digits.  E.G. {format}',
    description:
      'The error message that appears on phone numbers where the first character must be a 0'
  }
})

export const dynamicValidationProps: IIntlDynamicProps = {
  minLength: {
    min: 11
  },
  phoneNumberFormat: {
    locale: config.LOCALE.toUpperCase(),
    min: 11,
    format: '07012345678'
  }
}

const isAValidPhoneNumberFormat = (value: string): boolean => {
  console.log(value)
  const numberRexExp = new RegExp('0[0-9]{10}')
  return numberRexExp.test(value)
}

export const required: Validation = (value: any) =>
  value || typeof value === 'number' ? undefined : messages.required

export const minLength = (min: number) => (value: any) =>
  value && value.length < min ? messages.minLength : undefined

export const isNumber: Validation = (value: any) =>
  value && isNaN(Number(value)) ? messages.numberRequired : undefined

export const phoneNumberFormat: Validation = (value: any) => {
  return value && isAValidPhoneNumberFormat(value)
    ? undefined
    : messages.phoneNumberFormat
}

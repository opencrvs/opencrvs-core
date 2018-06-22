import * as Joi from 'joi'
import { callingCountries } from 'country-data'

export const localPhoneNumberSchema = Joi.string().regex(
  /^0\d{9,10}$/,
  'Not a valid local phone number. Accepted formats: 0845553344'
)

export const msisdnSchema = Joi.string().regex(
  /^\+\d{11,12}$/,
  'Not a valid msisdn. Accepted formats: +27112223333'
)

export const validate = Joi.validate

export function convertToMSISDN(localPhoneNumber: string, countryCode: string) {
  countryCode = countryCode.toUpperCase()

  if (localPhoneNumber.charAt(0) === '0') {
    return `${
      callingCountries[countryCode].countryCallingCodes[0]
    }${localPhoneNumber.substring(1)}`
  }

  if (
    localPhoneNumber.startsWith(
      callingCountries[countryCode].countryCallingCodes[0]
    )
  ) {
    return localPhoneNumber
  }

  throw new Error('Not a valid local phone number')
}

export function convertToLocalPhoneNumber(msisdn: string, countryCode: string) {
  countryCode = countryCode.toUpperCase()

  if (msisdn.startsWith(callingCountries[countryCode].countryCallingCodes[0])) {
    return msisdn.replace(
      callingCountries[countryCode].countryCallingCodes[0],
      '0'
    )
  }

  throw new Error('Not valid MSISDN for this country')
}

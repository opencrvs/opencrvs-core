import { callingCountries } from 'country-data'

export const convertToMSISDN = (
  localPhoneNumber: string,
  countryCode: string
) => {
  countryCode = countryCode.toUpperCase()
  return `${
    callingCountries[countryCode].countryCallingCodes[0]
  }${localPhoneNumber.substring(1)}`
}

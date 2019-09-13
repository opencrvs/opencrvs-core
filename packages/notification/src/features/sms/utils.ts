import { callingCountries } from 'country-data'
import { COUNTRY } from '@notification/constants'

export const convertToMSISDN = (phone: string) => {
  const countryCode =
    callingCountries[COUNTRY.toUpperCase()].countryCallingCodes[0]
  return phone.startsWith(countryCode)
    ? phone
    : phone.startsWith('0')
    ? `${countryCode}${phone.substring(1)}`
    : `${countryCode}${phone}`
}

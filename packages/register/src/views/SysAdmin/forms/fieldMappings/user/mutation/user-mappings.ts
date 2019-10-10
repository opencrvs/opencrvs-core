import { TransformedData, IFormData, IFormField } from '@register/forms'
import { callingCountries } from 'country-data'

const convertToMSISDN = (phoneWithoutCountryCode: string) => {
  const countryCode =
    callingCountries[window.config.COUNTRY.toUpperCase()].countryCallingCodes[0]

  return phoneWithoutCountryCode.startsWith('0')
    ? `${countryCode}${phoneWithoutCountryCode.substring(1)}`
    : `${countryCode}${phoneWithoutCountryCode}`
}

export const msisdnTransformer = (transformedFieldName?: string) => (
  transformedData: TransformedData,
  draftData: IFormData,
  sectionId: string,
  field: IFormField
) => {
  const fieldName = transformedFieldName ? transformedFieldName : field.name

  transformedData[sectionId][fieldName] = convertToMSISDN(draftData[sectionId][
    field.name
  ] as string)

  return transformedData
}

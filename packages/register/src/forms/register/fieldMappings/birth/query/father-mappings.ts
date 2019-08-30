import { IFormData } from '@register/forms'

export function emptyFatherSectionTransformer(
  transformedData: IFormData,
  queryData: any,
  sectionId: string
) {
  if (!queryData[sectionId]) {
    transformedData[sectionId] = {
      fathersDetailsExist: false,
      permanentAddressSameAsMother: true,
      addressSameAsMother: true
    }
  } else {
    transformedData[sectionId] = {
      fathersDetailsExist: true,
      ...transformedData[sectionId]
    }
  }
  return transformedData
}

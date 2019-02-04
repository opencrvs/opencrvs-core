import { IFormData } from 'src/forms'

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
  }
  return transformedData
}

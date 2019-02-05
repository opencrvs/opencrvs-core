import { IFormField, IFormData } from 'src/forms'

export const addressToPlaceOfBirthTransformer = (
  lineNumber: number = 0,
  transformedFieldName?: string
) => (
  transformedData: any,
  draftData: IFormData,
  sectionId: string,
  field: IFormField
) => {
  if (!transformedData.placeOfBirth) {
    transformedData.placeOfBirth = {
      type: draftData[sectionId].placeOfBirth
        ? draftData[sectionId].placeOfBirth
        : '',
      partOf: draftData[sectionId].addressLine4
        ? draftData[sectionId].addressLine4
        : '',
      address: {
        type: `BIRTH_PLACE`,
        country: '',
        state: '',
        district: '',
        postalCode: '',
        line: ['', '', '', '', '', '']
      }
    }
  }
  if (lineNumber > 0) {
    transformedData.placeOfBirth.address.line[lineNumber - 1] =
      draftData[sectionId][field.name]
  } else {
    transformedData.placeOfBirth.address[
      !transformedFieldName ? field.name : transformedFieldName
    ] = draftData[sectionId][field.name]
  }
  return transformedData
}

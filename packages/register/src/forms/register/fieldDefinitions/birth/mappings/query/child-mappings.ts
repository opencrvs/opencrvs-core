import { IFormField, IFormData } from 'src/forms'

export const placeOfBirthToAddressTransformer = (
  lineNumber: number = 0,
  transformedFieldName?: string
) => (
  transformedData: IFormData,
  queryData: any,
  sectionId: string,
  field: IFormField
) => {
  if (!queryData.placeOfBirth || !queryData.placeOfBirth.address) {
    return transformedData
  }
  if (lineNumber > 0) {
    transformedData[sectionId][field.name] =
      queryData.placeOfBirth.address.line[lineNumber - 1]
  } else if (
    queryData.placeOfBirth.address[
      transformedFieldName ? transformedFieldName : field.name
    ]
  ) {
    transformedData[sectionId][field.name] =
      queryData.placeOfBirth.address[
        transformedFieldName ? transformedFieldName : field.name
      ]
  }
  return transformedData
}

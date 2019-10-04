import { TransformedData, IFormData, IFormField } from '@register/forms'

export const fieldToReasonsArrayTransformer = (
  transformedArrayName: string,
  transformedFieldName: string,
  extraField: string,
  extraValue: string
) => (
  transformedData: TransformedData,
  draftData: IFormData,
  sectionId: string,
  field: IFormField
) => {
  const fieldvalue = draftData[sectionId][field.name]

  if (!fieldvalue) {
    return
  } else {
    if (!transformedData[sectionId][transformedArrayName]) {
      transformedData[sectionId][transformedArrayName] = []
    }

    const transformedArray = transformedData[sectionId][transformedArrayName]

    // @ts-ignore
    let transformedField = transformedArray.find(field => {
      return field[extraField] && field[extraField] === extraValue
    })

    if (!transformedField) {
      transformedField = {}
      transformedField[extraField] = extraValue
      transformedField[transformedFieldName] = fieldvalue
      transformedArray.push(transformedField)
    } else {
      transformedField[transformedFieldName] = fieldvalue
    }

    return transformedData
  }
}

import { TransformedData, IFormData, IFormField } from '@register/forms'

export const fieldToReasonsArrayTransformer = (
  transformedArrayName: string,
  transformedFieldName?: string,
  extraField?: string
) => (
  transformedData: TransformedData,
  draftData: IFormData,
  sectionId: string,
  field: IFormField
) => {
  const fieldValue = draftData[sectionId][field.name]
  const transFieldName = transformedFieldName
    ? transformedFieldName
    : field.name

  if (!fieldValue) {
    return
  } else {
    if (!transformedData[sectionId][transformedArrayName]) {
      transformedData[sectionId][transformedArrayName] = []
    }

    const transformedArray = transformedData[sectionId][transformedArrayName]

    // @ts-ignore
    let transformedField = transformedArray.find(transField => {
      if (extraField) {
        return (
          transField[extraField] && transField[extraField] === field.extraValue
        )
      }
      return (
        transField[transFieldName] && transField[transFieldName] === fieldValue
      )
    })

    if (!transformedField) {
      transformedField = {}
      transformedField[transFieldName] = fieldValue

      if (extraField) {
        transformedField[extraField] = field.extraValue
      }

      transformedArray.push(transformedField)
    } else {
      transformedField[transFieldName] = fieldValue
    }

    console.log(transformedData)

    return transformedData
  }
}

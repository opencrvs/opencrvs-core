import { IFormField, IFormData } from 'src/forms'

export function hasCaseOfDeathSectionTransformer(
  transformedData: IFormData,
  queryData: any,
  sectionId: string,
  field: IFormField
) {
  if (queryData.causeOfDeathMethod || queryData.causeOfDeath) {
    transformedData[sectionId][field.name] = true
  } else {
    transformedData[sectionId][field.name] = false
  }
  return transformedData
}

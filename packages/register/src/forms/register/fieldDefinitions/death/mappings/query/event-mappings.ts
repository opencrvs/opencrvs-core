import { IFormField, IFormData } from 'src/forms'

export const deceasedDateToFieldTransformation = (
  alternativeSectionId?: string
) => (
  transformedData: IFormData,
  queryData: any,
  sectionId: string,
  field: IFormField
) => {
  const fromSectionId = alternativeSectionId ? alternativeSectionId : sectionId
  if (!queryData[fromSectionId] || !queryData[fromSectionId].deceased) {
    return transformedData
  }
  transformedData[sectionId][field.name] =
    queryData[fromSectionId].deceased.deathDate
  return transformedData
}

export const deathPlaceToFieldTransformer = (
  transformedData: IFormData,
  queryData: any,
  sectionId: string,
  field: IFormField
) => {
  if (!queryData.eventLocation || !queryData.eventLocation.type) {
    return transformedData
  }
  transformedData[sectionId][field.name] = queryData.eventLocation.type
  return transformedData
}

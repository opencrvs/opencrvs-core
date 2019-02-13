import { IFormField, IFormData } from 'src/forms'

export const deceasedDateTransformation = (alternativeSectionId?: string) => (
  transformedData: any,
  draftData: IFormData,
  sectionId: string,
  field: IFormField
) => {
  if (!draftData[sectionId] || !draftData[sectionId][field.name]) {
    return transformedData
  }
  transformedData[
    alternativeSectionId ? alternativeSectionId : sectionId
  ].deceased = {
    deceased: false,
    deathDate: draftData[sectionId][field.name]
  }
  return transformedData
}

import { IFormField, IFormData } from 'src/forms'

export const phoneNumberTransformer = (dependentFieldName: string) => (
  transformedData: any,
  draftData: IFormData,
  sectionId: string,
  field: IFormField
) => {
  let toSectionID
  if (draftData[sectionId][dependentFieldName] === 'MOTHER') {
    toSectionID = 'mother'
  } else if (draftData[sectionId][dependentFieldName] === 'FATHER') {
    toSectionID = 'father'
  } else {
    toSectionID = undefined
  }
  if (toSectionID) {
    transformedData[toSectionID].telecom = [
      { system: 'phone', value: draftData[sectionId][field.name] }
    ]
  }
  return transformedData
}

export function registrationSectionTransformer(
  transformedData: any,
  draftData: IFormData,
  sectionId: string
) {
  if (draftData[sectionId].trackingId) {
    transformedData[sectionId].trackingId = draftData[sectionId].trackingId
  }

  if (draftData[sectionId].registrationNumber) {
    transformedData[sectionId].registrationNumber =
      draftData[sectionId].registrationNumber
  }

  if (!transformedData[sectionId].status) {
    transformedData[sectionId].status = [
      {
        timestamp: new Date()
      }
    ]
  }
}

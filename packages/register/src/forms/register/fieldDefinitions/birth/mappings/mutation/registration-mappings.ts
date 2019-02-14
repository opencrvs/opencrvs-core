import { IFormField, IFormData } from 'src/forms'
import { fieldToPhoneNumberTransformer } from 'src/forms/mappings/mutation/field-mappings'

export const fieldToBirthPhoneNumberTransformer = (
  dependentFieldName: string
) => (
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
    fieldToPhoneNumberTransformer(toSectionID)(
      transformedData,
      draftData,
      sectionId,
      field
    )
  }
  return transformedData
}

export function setRegistrationSectionTransformer(
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

import { IFormField, IFormData, Event } from '@register/forms'
import { REGISTRATION_SECTION } from '@register/forms/register/fieldDefinitions/death/mappings/query/documents-mappings'

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

export function getRegistrationSectionTransformer(
  transformedData: IFormData,
  queryData: any,
  sectionId: string
) {
  if (!transformedData[REGISTRATION_SECTION]) {
    transformedData[REGISTRATION_SECTION] = {}
  }

  if (queryData[REGISTRATION_SECTION].id) {
    transformedData[REGISTRATION_SECTION]._fhirID =
      queryData[REGISTRATION_SECTION].id
  }
  if (queryData[REGISTRATION_SECTION].trackingId) {
    transformedData[REGISTRATION_SECTION].trackingId =
      queryData[REGISTRATION_SECTION].trackingId
  }

  if (queryData[REGISTRATION_SECTION].registrationNumber) {
    transformedData[REGISTRATION_SECTION].registrationNumber =
      queryData[REGISTRATION_SECTION].registrationNumber
  }

  if (
    queryData[REGISTRATION_SECTION].type &&
    queryData[REGISTRATION_SECTION].type === 'DEATH'
  ) {
    transformedData[REGISTRATION_SECTION].type = Event.DEATH
  }
}

import { IFormData, Event } from '@register/forms'

export function getRegistrationSectionTransformer(
  transformedData: IFormData,
  queryData: any,
  sectionId: string
) {
  if (queryData[sectionId].trackingId) {
    transformedData[sectionId].trackingId = queryData[sectionId].trackingId
  }

  if (queryData[sectionId].registrationNumber) {
    transformedData[sectionId].registrationNumber =
      queryData[sectionId].registrationNumber
  }

  if (queryData[sectionId].type && queryData[sectionId].type === 'BIRTH') {
    transformedData[sectionId].type = Event.BIRTH
  }
}

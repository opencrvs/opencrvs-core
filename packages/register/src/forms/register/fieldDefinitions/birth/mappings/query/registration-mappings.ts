import { IFormField, IFormData, Event } from 'src/forms'
import { GQLContactPoint } from '@opencrvs/gateway/src/graphql/schema'

export const phoneNumberToFieldTransformer = (dependentFieldName: string) => (
  transformedData: IFormData,
  queryData: any,
  sectionId: string,
  field: IFormField
) => {
  let toSectionID
  if (queryData[sectionId][dependentFieldName] === 'MOTHER') {
    toSectionID = 'mother'
  } else if (queryData[sectionId][dependentFieldName] === 'FATHER') {
    toSectionID = 'father'
  } else {
    toSectionID = undefined
  }
  if (toSectionID && queryData[toSectionID] && queryData[toSectionID].telecom) {
    ;(queryData[toSectionID].telecom as GQLContactPoint[]).map(tel => {
      if (tel.system === 'phone' && tel.value) {
        transformedData[sectionId][field.name] = tel.value
      }
    })
  }
  return transformedData
}

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

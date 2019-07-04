import { IFormField, IFormData } from '@register/forms'
import { GQLContactPoint } from '@opencrvs/gateway/src/graphql/schema'

export const phoneNumberToFieldTransformer = (
  transformedData: IFormData,
  queryData: any,
  sectionId: string,
  field: IFormField
) => {
  if (queryData[sectionId] && queryData[sectionId].telecom) {
    ;(queryData[sectionId].telecom as GQLContactPoint[]).map(tel => {
      if (tel.system === 'phone' && tel.value) {
        transformedData[sectionId][field.name] = tel.value
      }
      return tel
    })
  }
  return transformedData
}
export function getInformantSectionTransformer(
  transformedData: IFormData,
  queryData: any,
  sectionId: string
) {
  if (
    queryData[sectionId].id &&
    queryData[sectionId].individual &&
    queryData[sectionId].individual.id
  ) {
    transformedData[sectionId]._fhirIDMap = {
      // @ts-ignore
      relatedPerson: queryData[sectionId].id,
      individual: queryData[sectionId].individual.id
    }
  }
  return transformedData
}

import { IFormField, IFormData } from 'src/forms'
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
    })
  }
  return transformedData
}

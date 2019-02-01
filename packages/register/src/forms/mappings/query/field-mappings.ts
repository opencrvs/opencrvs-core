import { IFormField, IFormData } from '../..'
import { GQLHumanName } from '@opencrvs/gateway/src/graphql/schema'

export const nameFieldTransformer = (
  language: string,
  transformedFieldName?: string
) => (
  transformedData: IFormData,
  queryData: any,
  sectionId: string,
  field: IFormField
) => {
  const selectedName =
    queryData[sectionId] &&
    queryData[sectionId].name &&
    (queryData[sectionId].name as GQLHumanName[]).find(
      name => name.use === language
    )
  const nameKey = transformedFieldName ? transformedFieldName : field.name
  if (!selectedName || !selectedName[nameKey]) {
    return transformedData
  }
  if (!transformedData[sectionId]) {
    transformedData[sectionId] = {}
  }
  transformedData[sectionId][nameKey] = selectedName[nameKey]
  return transformedData
}

export const fieldValueTransformer = (transformedFieldName: string) => (
  transformedData: IFormData,
  queryData: any,
  sectionId: string,
  field: IFormField
) => {
  if (queryData[sectionId][transformedFieldName]) {
    transformedData[sectionId][field.name] =
      queryData[sectionId][transformedFieldName]
  }
  return transformedData
}

export const bundleFieldToSectionFieldTransformer = (
  transformedFieldName?: string
) => (
  transformedData: IFormData,
  queryData: any,
  sectionId: string,
  field: IFormField
) => {
  if (queryData[transformedFieldName ? transformedFieldName : field.name]) {
    transformedData[sectionId][field.name] =
      queryData[transformedFieldName ? transformedFieldName : field.name]
  }
  return transformedData
}

export function arrayToFieldTransformer(
  transformedData: IFormData,
  queryData: any,
  sectionId: string,
  field: IFormField
) {
  if (queryData[sectionId][field.name] && queryData[sectionId][field.name][0]) {
    transformedData[sectionId][field.name] = queryData[sectionId][field.name][0]
  }
  return transformedData
}

export const identifierToFieldTransformer = (identifierField: string) => (
  transformedData: IFormData,
  queryData: any,
  sectionId: string,
  field: IFormField
) => {
  if (
    !queryData[sectionId].identifier ||
    !queryData[sectionId].identifier[0] ||
    !queryData[sectionId].identifier[0][identifierField]
  ) {
    return transformedData
  }
  transformedData[sectionId][field.name] =
    queryData[sectionId].identifier[0][identifierField]
  return transformedData
}

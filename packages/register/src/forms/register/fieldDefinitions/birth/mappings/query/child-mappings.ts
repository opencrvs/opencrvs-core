import { IFormField, IFormData } from 'src/forms'

export const eventLocationQueryTransformer = (
  lineNumber: number = 0,
  transformedFieldName?: string
) => (
  transformedData: IFormData,
  queryData: any,
  sectionId: string,
  field: IFormField
) => {
  if (!queryData.eventLocation || !queryData.eventLocation.address) {
    return transformedData
  }
  const eventLocation = queryData.eventLocation as fhir.Location
  const address = eventLocation.address as fhir.Address
  const line = address.line as string[]
  if (lineNumber > 0) {
    transformedData[sectionId][field.name] = line[lineNumber - 1]
  } else if (
    address[transformedFieldName ? transformedFieldName : field.name]
  ) {
    transformedData[sectionId][field.name] =
      address[transformedFieldName ? transformedFieldName : field.name]
  }
  return transformedData
}

export const eventLocationTypeQueryTransformer = () => (
  transformedData: IFormData,
  queryData: any,
  sectionId: string,
  field: IFormField
) => {
  if (!queryData.eventLocation) {
    return transformedData
  }
  if (!queryData.eventLocation.type) {
    transformedData[sectionId][field.name] = 'HOSPITAL'
  } else {
    transformedData[sectionId][field.name] = queryData.eventLocation
      .type as string
  }
  return transformedData
}

export const eventLocationIDQueryTransformer = () => (
  transformedData: IFormData,
  queryData: any,
  sectionId: string,
  field: IFormField
) => {
  if (!queryData.eventLocation && !queryData._fhirIDMap.eventLocation) {
    return transformedData
  } else {
    transformedData[sectionId][field.name] = queryData._fhirIDMap
      .eventLocation as string
  }
  return transformedData
}

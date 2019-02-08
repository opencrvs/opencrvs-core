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
  } else if (transformedFieldName === 'placeOfBirth') {
    transformedData[sectionId][field.name] = eventLocation.type as string
  } else if (transformedFieldName === 'birthLocation') {
    transformedData[sectionId][field.name] = eventLocation.id as string
  } else if (
    address[transformedFieldName ? transformedFieldName : field.name]
  ) {
    transformedData[sectionId][field.name] =
      address[transformedFieldName ? transformedFieldName : field.name]
  }
  return transformedData
}

import { IFormField, IFormData, Event } from 'src/forms'
import { attachmentToFieldTransformer } from 'src/forms/mappings/query/field-mappings'
import {
  documentForWhomFhirMapping,
  documentTypeFhirMapping
} from '../mutation/documents-mappings'
const REGISTRATION_SECTION = 'registration'

export function deathAttachmentToFieldTransformer(
  transformedData: IFormData,
  queryData: any,
  sectionId: string,
  field: IFormField
) {
  return attachmentToFieldTransformer(
    transformedData,
    queryData,
    sectionId,
    field,
    REGISTRATION_SECTION,
    documentForWhomFhirMapping,
    documentTypeFhirMapping
  )
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

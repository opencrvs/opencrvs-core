import { IFormField, IFormData } from 'src/forms'
import { attachmentToFieldTransformer } from 'src/forms/mappings/query/field-mappings'
import {
  documentForWhomFhirMapping,
  documentTypeFhirMapping
} from '../mutation/documents-mappings'
export const REGISTRATION_SECTION = 'registration'

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

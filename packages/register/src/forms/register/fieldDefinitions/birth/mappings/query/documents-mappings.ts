import { IFormField, IFormData } from 'forms'
import { attachmentToFieldTransformer } from 'forms/mappings/query/field-mappings'
import {
  documentForWhomFhirMapping,
  documentTypeFhirMapping
} from '../mutation/documents-mappings'

export function birthAttachmentToFieldTransformer(
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
    'registration',
    documentForWhomFhirMapping,
    documentTypeFhirMapping
  )
}

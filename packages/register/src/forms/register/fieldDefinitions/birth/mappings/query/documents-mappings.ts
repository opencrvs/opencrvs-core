import { IFormField, IFormData } from '@register/forms'
import { attachmentToFieldTransformer } from '@register/forms/mappings/query/field-mappings'
import {
  documentForWhomFhirMapping,
  documentTypeFhirMapping
} from '@register/forms/register/fieldDefinitions/birth/mappings/mutation/documents-mappings'

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

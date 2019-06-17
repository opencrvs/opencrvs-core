import { IFormField, IFormData } from '@register/forms'
import { attachmentToFieldTransformer } from '@register/forms/mappings/query/field-mappings'
import {
  documentForWhomFhirMapping,
  documentTypeFhirMapping
} from '@register/forms/register/fieldDefinitions/death/mappings/mutation/documents-mappings'

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

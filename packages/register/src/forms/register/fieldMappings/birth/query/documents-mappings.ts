import { IFormField, IFormData } from '@register/forms'
import { attachmentToFieldTransformer } from '@register/forms/mappings/query/field-mappings'
import {
  birthDocumentForWhomFhirMapping,
  birthDocumentTypeFhirMapping
} from '@register/forms/register/fieldMappings/birth/mutation/documents-mappings'

const fieldNameMapping = {
  [birthDocumentForWhomFhirMapping.Mother]: 'uploadDocForMother',
  [birthDocumentForWhomFhirMapping.Father]: 'uploadDocForFather',
  [birthDocumentForWhomFhirMapping.Parent]:
    'uploadDocForParentPermanentAddress',
  [birthDocumentForWhomFhirMapping.Child]: 'uploadDocForChildDOB',
  [birthDocumentForWhomFhirMapping.ChildAge]: 'uploadDocForChildAge'
}

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
    birthDocumentForWhomFhirMapping,
    birthDocumentTypeFhirMapping,
    fieldNameMapping
  )
}

import { IFormField, IFormData } from '@register/forms'
import { attachmentToFieldTransformer } from '@register/forms/mappings/query/field-mappings'
import {
  birthDocumentForWhomFhirMapping,
  birthDocumentTypeFhirMapping
} from '@register/forms/register/fieldMappings/birth/mutation/documents-mappings'

const fieldNameMapping = {
  [birthDocumentForWhomFhirMapping.Mother]: 'uploadDocForMother',
  [birthDocumentForWhomFhirMapping.Father]: 'uploadDocForFather',
  [birthDocumentForWhomFhirMapping.Child]: 'uploadDocForChildDOB',
  [birthDocumentForWhomFhirMapping.Parent]:
    'uploadDocForParentPermanentAddress',
  [birthDocumentForWhomFhirMapping.Applicant]: 'uploadDocForApplicant',
  [birthDocumentForWhomFhirMapping.ChildAge]: 'uploadDocForChildAge',
  [birthDocumentForWhomFhirMapping.AssignedResponsibilityProof]:
    'uploadDocForProofOfAssignedResponsibility',
  [birthDocumentForWhomFhirMapping.LegalGuardianProof]:
    'uploadDocForProofOfLegarGuardian'
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

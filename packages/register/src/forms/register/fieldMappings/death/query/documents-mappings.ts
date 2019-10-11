import { IFormField, IFormData } from '@register/forms'
import { attachmentToFieldTransformer } from '@register/forms/mappings/query/field-mappings'
import {
  deathDocumentForWhomFhirMapping,
  deathDocumentTypeFhirMapping
} from '@register/forms/register/fieldMappings/death/mutation/documents-mappings'

export const REGISTRATION_SECTION = 'registration'

const fieldNameMapping = {
  [deathDocumentForWhomFhirMapping["Proof of Deceased's ID"]]:
    'uploadDocForDeceased',
  [deathDocumentForWhomFhirMapping["Proof of Applicant's ID"]]:
    'uploadDocForApplicant',
  [deathDocumentForWhomFhirMapping["Proof of applicant's authority to apply"]]:
    'uploadDocForApplicantAthorityToApply',
  [deathDocumentForWhomFhirMapping['Proof Deceased Permanent Address']]:
    'uploadDocForDeceasedPermanentAddress',
  [deathDocumentForWhomFhirMapping['Proof of Date of Birth of Deceased']]:
    'uploadDocForDeceasedDOB',
  [deathDocumentForWhomFhirMapping['Proof of Death of Deceased']]:
    'uploadDocForDeceasedDeath'
}

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
    deathDocumentForWhomFhirMapping,
    deathDocumentTypeFhirMapping,
    fieldNameMapping
  )
}

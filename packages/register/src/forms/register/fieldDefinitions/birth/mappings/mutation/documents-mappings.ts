import { IFormField, IFormData } from 'src/forms'
import { fieldToAttachmentTransformer } from 'src/forms/mappings/mutation/field-mappings'

export const documentForWhomFhirMapping = {
  Child: 'CHILD',
  Father: 'FATHER',
  Mother: 'MOTHER',
  Other: 'OTHER'
}

export const documentTypeFhirMapping = {
  'Birth Registration': 'BIRTH_REGISTRATION',
  NID: 'NATIONAL_ID',
  Passport: 'PASSPORT',
  'School Certificate': 'SCHOOL_CERTIFICATE',
  Other: 'OTHER',
  'EPI Card': 'EPI_CARD',
  'Doctor Certificate': 'DOCTOR_CERTIFICATE',
  'Proof of Place and Date of Birth': 'BIRTH_PLACE_DATE_PROOF'
}

export function birthFieldToAttachmentTransformer(
  transformedData: any,
  draftData: IFormData,
  sectionId: string,
  field: IFormField
) {
  return fieldToAttachmentTransformer(
    transformedData,
    draftData,
    sectionId,
    field,
    'registration',
    documentForWhomFhirMapping,
    documentTypeFhirMapping
  )
}

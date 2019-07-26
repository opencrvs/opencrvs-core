import { IFormField, IFormData } from '@register/forms'
import { fieldToAttachmentTransformer } from '@register/forms/mappings/mutation/field-mappings'
import { childSection } from '@register/forms/register/fieldDefinitions/birth/child-section'
import { motherSection } from '@register/forms/register/fieldDefinitions/birth/mother-section'
import { fatherSection } from '@register/forms/register/fieldDefinitions/birth/father-section'

export const documentForWhomFhirMapping = {
  Child: 'CHILD',
  Father: 'FATHER',
  Mother: 'MOTHER',
  Parent: 'PARENT',
  Other: 'OTHER',
  ChildAge: 'CHILD_AGE'
}

export const sectionMapping = {
  [childSection.id]: [
    documentForWhomFhirMapping.Child,
    documentForWhomFhirMapping.ChildAge
  ],
  [motherSection.id]: [
    documentForWhomFhirMapping.Mother,
    documentForWhomFhirMapping.Parent
  ],
  [fatherSection.id]: [
    documentForWhomFhirMapping.Father,
    documentForWhomFhirMapping
  ]
}

export const sectionTitle = {
  [childSection.id]: 'Child',
  [motherSection.id]: 'Mother',
  [fatherSection.id]: 'Father'
}

export const documentTypeFhirMapping = {
  'Birth Registration': 'BIRTH_REGISTRATION',
  'National ID (front)': 'NATIONAL_ID_FRONT',
  'National ID (back)': 'NATIONAL_ID_BACK',
  Passport: 'PASSPORT',
  'School Certificate': 'SCHOOL_CERTIFICATE',
  Other: 'OTHER',
  'EPI Card': 'EPI_CARD',
  'EPI Staff Certificate': 'EPI_STAFF_CERTIFICATE',
  'Doctor Certificate': 'DOCTOR_CERTIFICATE',
  'Proof of Place and Date of Birth': 'BIRTH_PLACE_DATE_PROOF',
  'Discharge Certificate': 'DISCHARGE_CERTIFICATE',
  'Proof of birth from medical institution': 'MEDICAL_INSTITUTION',
  'Proof of birth from birth attendant': 'BIRTH_ATTENDANT',
  'Tax Payment Receipt': 'TAX_RECEIPT'
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

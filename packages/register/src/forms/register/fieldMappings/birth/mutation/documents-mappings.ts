import { fieldToAttachmentTransformer } from '@register/forms/mappings/mutation/field-mappings'
import {
  TransformedData,
  IFormData,
  IFormField,
  BirthSection
} from '@register/forms'

export const birthDocumentForWhomFhirMapping = {
  Child: 'CHILD',
  Father: 'FATHER',
  Mother: 'MOTHER',
  Parent: 'PARENT',
  Other: 'OTHER',
  ChildAge: 'CHILD_AGE'
}

export const birthSectionMapping = {
  [BirthSection.Child]: [
    birthDocumentForWhomFhirMapping.Child,
    birthDocumentForWhomFhirMapping.ChildAge
  ],
  [BirthSection.Mother]: [
    birthDocumentForWhomFhirMapping.Mother,
    birthDocumentForWhomFhirMapping.Parent
  ],
  [BirthSection.Father]: [
    birthDocumentForWhomFhirMapping.Father,
    birthDocumentForWhomFhirMapping
  ]
}

export const birthSectionTitle = {
  [BirthSection.Child]: 'Child',
  [BirthSection.Mother]: 'Mother',
  [BirthSection.Father]: 'Father'
}

export const birthDocumentTypeFhirMapping = {
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
  transformedData: TransformedData,
  draftData: IFormData,
  sectionId: BirthSection,
  field: IFormField
) {
  return fieldToAttachmentTransformer(
    transformedData,
    draftData,
    sectionId,
    field,
    'registration',
    birthDocumentForWhomFhirMapping,
    birthDocumentTypeFhirMapping
  )
}

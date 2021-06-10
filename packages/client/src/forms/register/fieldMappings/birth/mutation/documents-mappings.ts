/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import { fieldToAttachmentTransformer } from '@client/forms/mappings/mutation/field-mappings'
import {
  TransformedData,
  IFormData,
  IFormField,
  BirthSection
} from '@client/forms'

export const birthDocumentForWhomFhirMapping = {
  Child: 'CHILD',
  Father: 'FATHER',
  Mother: 'MOTHER',
  Parent: 'PARENT',
  Other: 'OTHER',
  ChildAge: 'CHILD_AGE',
  Applicant: 'APPLICANT_ID_PROOF',
  AssignedResponsibilityProof: 'ASSIGNED_RESPONSIBILITY_PROOF',
  LegalGuardianProof: 'LEGAL_GUARDIAN_PROOF',
  WardCouncillorProof: 'WARD_COUNCILLOR_PROOF'
}

export const birthSectionMapping = {
  [BirthSection.Child]: [
    birthDocumentForWhomFhirMapping.Child,
    birthDocumentForWhomFhirMapping.ChildAge,
    birthDocumentForWhomFhirMapping.WardCouncillorProof
  ],
  [BirthSection.Mother]: [birthDocumentForWhomFhirMapping.Mother],
  [BirthSection.Father]: [birthDocumentForWhomFhirMapping.Father],
  [BirthSection.Applicant]: [birthDocumentForWhomFhirMapping.Applicant],
  [BirthSection.Parent]: [
    birthDocumentForWhomFhirMapping.Parent,
    birthDocumentForWhomFhirMapping.AssignedResponsibilityProof,
    birthDocumentForWhomFhirMapping.LegalGuardianProof
  ]
}

export const birthSectionTitle = {
  [BirthSection.Child]: 'Child',
  [BirthSection.Mother]: 'Mother',
  [BirthSection.Father]: 'Father',
  [BirthSection.Applicant]: 'Applicant',
  [BirthSection.Parent]: 'Parent'
}

export const birthDocumentTypeFhirMapping = {
  'Birth Registration': 'BIRTH_REGISTRATION',
  'National ID (front)': 'NATIONAL_ID_FRONT',
  'National ID (back)': 'NATIONAL_ID_BACK',
  'Notification of birth': 'NOTIFICATION_OF_BIRTH',
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
  'Tax Payment Receipt': 'TAX_RECEIPT',
  'Original Birth Record': 'ORIGINAL_BIRTH_RECORD',
  'Under Five Card': 'UNDER_FIVE_CARD',
  'Proof of legal guardianship': 'PROOF_OF_LEGAL_GUARDIANSHIP',
  'Proof of assigned responsibility': 'PROOF_OF_ASSIGNED_RESPONSIBILITY',
  'Letter from ward councillor': 'LETTER_FROM_COUNCILLOR'
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

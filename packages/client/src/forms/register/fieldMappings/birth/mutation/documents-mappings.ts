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
  Informant: 'INFORMANT_ID_PROOF',
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
  [BirthSection.Informant]: [birthDocumentForWhomFhirMapping.Informant],
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
  [BirthSection.Informant]: 'Informant',
  [BirthSection.Parent]: 'Parent'
}

export const birthDocumentTypeFhirMapping = {
  BIRTH_CERTIFICATE: 'BIRTH_CERTIFICATE',
  NATIONAL_ID: 'NATIONAL_ID',
  PASSPORT: 'PASSPORT',
  OTHER: 'OTHER',
  NOTIFICATION_OF_BIRTH: 'NOTIFICATION_OF_BIRTH',
  PROOF_OF_LEGAL_GUARDIANSHIP: 'PROOF_OF_LEGAL_GUARDIANSHIP',
  PROOF_OF_ASSIGNED_RESPONSIBILITY: 'PROOF_OF_ASSIGNED_RESPONSIBILITY'
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

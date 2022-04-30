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
import {
  IFormField,
  IFormData,
  TransformedData,
  DeathSection
} from '@client/forms'
import { fieldToAttachmentTransformer } from '@client/forms/mappings/mutation/field-mappings'

export const deathDocumentForWhomFhirMapping = {
  DECEASED_ID_PROOF: 'DECEASED_ID_PROOF',
  DECEASED_DEATH_PROOF: 'DECEASED_DEATH_PROOF',
  DECEASED_DEATH_CAUSE_PROOF: 'DECEASED_DEATH_CAUSE_PROOF',
  INFORMANT_ID_PROOF: 'INFORMANT_ID_PROOF'
}

export const deathSectionMapping = {
  [DeathSection.Deceased]: [
    deathDocumentForWhomFhirMapping.DECEASED_ID_PROOF,
    deathDocumentForWhomFhirMapping.DECEASED_DEATH_PROOF,
    deathDocumentForWhomFhirMapping.DECEASED_DEATH_CAUSE_PROOF
  ],
  [DeathSection.Informants]: [
    deathDocumentForWhomFhirMapping.INFORMANT_ID_PROOF
  ]
}

export const deathSectionTitle = {
  [DeathSection.Deceased]: 'Deceased',
  [DeathSection.Informants]: 'Informant'
}

export const deathDocumentTypeFhirMapping = {
  HOSPITAL_CERTIFICATE_OF_DEATH: 'HOSPITAL_CERTIFICATE_OF_DEATH',
  ATTESTED_LETTER_OF_DEATH: 'ATTESTED_LETTER_OF_DEATH',
  BURIAL_RECEIPT: 'BURIAL_RECEIPT',
  POLICE_CERTIFICATE_OF_DEATH: 'POLICE_CERTIFICATE_OF_DEATH',
  MEDICALLY_CERTIFIED_CAUSE_OF_DEATH: 'MEDICALLY_CERTIFIED_CAUSE_OF_DEATH',
  VERBAL_AUTOPSY_REPORT: 'VERBAL_AUTOPSY_REPORT',
  CORONERS_REPORT: 'CORONERS_REPORT',
  BIRTH_CERTIFICATE: 'BIRTH_CERTIFICATE',
  NATIONAL_ID: 'NATIONAL_ID',
  PASSPORT: 'PASSPORT',
  OTHER: 'OTHER'
}

export function deathFieldToAttachmentTransformer(
  transformedData: TransformedData,
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
    deathDocumentForWhomFhirMapping,
    deathDocumentTypeFhirMapping
  )
}

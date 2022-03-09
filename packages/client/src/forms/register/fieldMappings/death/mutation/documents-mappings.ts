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
  "Proof of Deceased's ID": 'DECEASED_ID_PROOF',
  'Proof Deceased Permanent Address': 'DECEASED_PARMANENT_ADDRESS_PROOF',
  'Proof of Death of Deceased': 'DECEASED_DEATH_PROOF',
  'Proof of Date of Birth of Deceased': 'DECEASED_BIRTH_PROOF',
  'Cuase of Death': 'CAUSE_OF_DEATH',
  "Proof of Informant's ID": 'INFORMANT_ID_PROOF',
  "Proof of informant's authority to apply":
    'INFORMANT_ATHORITY_TO_APPLY_PROOF',
  'Letter from ward councillor': 'WARD_COUNCILLOR_PROOF',
  'Coroner Report': 'CORONERS_REPORT'
}

export const deathSectionMapping = {
  [DeathSection.Deceased]: [
    deathDocumentForWhomFhirMapping['Cuase of Death'],
    deathDocumentForWhomFhirMapping["Proof of Deceased's ID"],
    deathDocumentForWhomFhirMapping['Proof Deceased Permanent Address'],
    deathDocumentForWhomFhirMapping['Proof of Death of Deceased'],
    deathDocumentForWhomFhirMapping['Proof of Date of Birth of Deceased'],
    deathDocumentForWhomFhirMapping['Letter from ward councillor'],
    deathDocumentForWhomFhirMapping['Coroner Report']
  ],
  [DeathSection.Informants]: [
    deathDocumentForWhomFhirMapping["Proof of Informant's ID"],
    deathDocumentForWhomFhirMapping["Proof of informant's authority to apply"]
  ]
}

export const deathSectionTitle = {
  [DeathSection.Deceased]: 'Deceased',
  [DeathSection.Informants]: 'Informant'
}

export const deathDocumentTypeFhirMapping = {
  'Birth Registration': 'BIRTH_REGISTRATION',
  'National ID (front)': 'NATIONAL_ID_FRONT',
  'National ID (back)': 'NATIONAL_ID_BACK',
  'Cuase of Death': 'CAUSE_OF_DEATH',
  'Proof of Death of Deceased': 'DECEASED_DEATH_PROOF',
  'Certified Post Mortem Report': 'POST_MORTEM_CERTIFICATE',
  'Hospital Discharge Certificate': 'HOSPITAL_DISCHARGE_CERTIFICATE',
  'Attested Letter of Death': 'ATTESTED_DEATH_LETTER',
  'Attested Certificate of Death': 'ATTESTED_DEATH_CERTIFICATE',
  'Certified Copy of Burial Receipt': 'BURIAL_RECEIPT',
  'Certified Copy of Funeral Receipt': 'FUNERAL_RECEIPT',
  Passport: 'PASSPORT',
  'Police Brought In Dead Certificate': 'BROUGHT_IN_DEAD_CERTIFICATE',
  'Coroner Report': 'CORONERS_REPORT',
  'Signed Affidavit': 'SIGNED_AFFIDAVIT',
  'Proof of Date of Birth of Deceased': 'DECEASED_BIRTH_PROOF_PAPER',
  'Letter from ward councillor': 'LETTER_FROM_COUNCILLOR',
  Other: 'OTHER'
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

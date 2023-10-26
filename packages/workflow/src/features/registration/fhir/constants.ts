/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
export const OPENCRVS_SPECIFICATION_URL = 'http://opencrvs.org/specs/'
export const MOTHER_SECTION_CODE = 'mother-details'
export const FATHER_SECTION_CODE = 'father-details'
export const CHILD_SECTION_CODE = 'child-details'
export const INFORMANT_SECTION_CODE = 'informant-details'
export const DECEASED_SECTION_CODE = 'deceased-details'
export const BIRTH_REG_NUMBER_SYSTEM = 'BIRTH_REGISTRATION_NUMBER'
export const DEATH_REG_NUMBER_SYSTEM = 'DEATH_REGISTRATION_NUMBER'
export const GROOM_SECTION_CODE = 'groom-details'
export const BRIDE_SECTION_CODE = 'bride-details'
export const MARRIAGE_REG_NUMBER_SYSTEM = 'MARRIAGE_REGISTRATION_NUMBER'
export enum RegStatus {
  ARCHIVED = 'ARCHIVED',
  IN_PROGRESS = 'IN_PROGRESS',
  DECLARED = 'DECLARED',
  VALIDATED = 'VALIDATED',
  DECLARATION_UPDATED = 'DECLARATION_UPDATED',
  WAITING_VALIDATION = 'WAITING_VALIDATION',
  REGISTERED = 'REGISTERED',
  CERTIFIED = 'CERTIFIED',
  REJECTED = 'REJECTED',
  REQUESTED_CORRECTION = 'REQUESTED_CORRECTION',
  ISSUED = 'ISSUED'
}
export const DOWNLOADED = 'DOWNLOADED'
export enum EVENT_TYPE {
  BIRTH = 'BIRTH',
  DEATH = 'DEATH',
  MARRIAGE = 'MARRIAGE'
}

export const BIRTH_REG_NUMBER_GENERATION_FAILED =
  'Birth registration number generation failed'

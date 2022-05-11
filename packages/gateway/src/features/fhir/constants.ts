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
export const ORIGINAL_FILE_NAME_SYSTEM =
  'http://opencrvs.org/specs/id/original-file-name'
export const SYSTEM_FILE_NAME_SYSTEM =
  'http://opencrvs.org/specs/id/system-file-name'
export const FHIR_SPECIFICATION_URL = 'http://hl7.org/fhir/StructureDefinition/'
export const OPENCRVS_SPECIFICATION_URL = 'http://opencrvs.org/specs/'
export const FHIR_OBSERVATION_CATEGORY_URL =
  'http://hl7.org/fhir/observation-category'
export enum EVENT_TYPE {
  BIRTH = 'BIRTH',
  DEATH = 'DEATH'
}

export const DOWNLOADED_EXTENSION_URL = `${OPENCRVS_SPECIFICATION_URL}extension/regDownloaded`
export const REINSTATED_EXTENSION_URL = `${OPENCRVS_SPECIFICATION_URL}extension/regReinstated`
export const ASSIGNED_EXTENSION_URL = `${OPENCRVS_SPECIFICATION_URL}extension/regAssigned`

export const BIRTH_REG_NO = 'birth-registration-number'
export const DEATH_REG_NO = 'death-registration-number'

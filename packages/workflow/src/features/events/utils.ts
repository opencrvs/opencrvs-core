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

import {
  EVENT_TYPE,
  CHILD_SECTION_CODE,
  DECEASED_SECTION_CODE,
  GROOM_SECTION_CODE,
  BRIDE_SECTION_CODE,
  BIRTH_REG_NUMBER_SYSTEM,
  DEATH_REG_NUMBER_SYSTEM,
  MARRIAGE_REG_NUMBER_SYSTEM
} from '@workflow/features/registration/fhir/constants'

export const SECTION_CODE: Record<EVENT_TYPE, string[]> = {
  [EVENT_TYPE.BIRTH]: [CHILD_SECTION_CODE],
  [EVENT_TYPE.DEATH]: [DECEASED_SECTION_CODE],
  [EVENT_TYPE.MARRIAGE]: [GROOM_SECTION_CODE, BRIDE_SECTION_CODE]
}

export const REG_NUMBER_SYSTEM: Record<EVENT_TYPE, string> = {
  [EVENT_TYPE.BIRTH]: BIRTH_REG_NUMBER_SYSTEM,
  [EVENT_TYPE.DEATH]: DEATH_REG_NUMBER_SYSTEM,
  [EVENT_TYPE.MARRIAGE]: MARRIAGE_REG_NUMBER_SYSTEM
}

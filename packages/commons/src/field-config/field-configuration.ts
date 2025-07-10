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

import { FieldConditional, TranslationConfig } from 'src/events'
import { ValidationConfig } from 'src/events/FieldConfig'
import { createSearchConfig } from '../searchConfigs'

/**
 * Returns configuration options for the field.
 */
export function createFieldConfig(
  fieldId: string,
  options: {
    alternateFieldIds?: string[]
    conditionals?: FieldConditional[]
    validations?: ValidationConfig[]
    searchCriteriaLabelPrefix?: TranslationConfig
  }
) {
  const baseField = {
    fieldId,
    fieldType: 'field' as const,
    ...options
  }

  return createSearchConfig(baseField)
}

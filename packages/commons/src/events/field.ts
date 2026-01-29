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

import { createFieldConditionals } from '../conditionals/conditionals'
import { createFieldConfig } from '../field-config/field-configuration'
import { FieldConditional } from './Conditional'
import { TranslationConfig } from './TranslationConfig'
import { SelectOption, ValidationConfig } from './FieldConfig'

/**
 * @deprecated
 * This function is deprecated and will be removed in future releases.
 * Please use `event.declarationField` instead.
 */
export function field(
  fieldId: string,
  options: {
    options?: SelectOption[]
    conditionals?: FieldConditional[]
    validations?: ValidationConfig[]
    searchCriteriaLabelPrefix?: TranslationConfig
  } = {}
) {
  return {
    ...createFieldConditionals(fieldId),
    ...createFieldConfig(fieldId, options)
  }
}

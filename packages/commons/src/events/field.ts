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
import { createFieldConfigs } from '../field-config/field-configuration'
import { FieldConditional } from './Conditional'

/**
 * Entry point for defining conditional logic or configuration for a form field.
 * @param fieldId - The ID of the field to define rules or config for.
 * @returns An object combining conditional methods and configuration builders.
 */
export function field(
  fieldId: string,
  options: {
    conditionals?: FieldConditional[]
  } = {}
) {
  return {
    /**
     * @private Internal property used for field reference tracking.
     */
    _fieldId: fieldId,
    ...createFieldConditionals(fieldId),
    ...createFieldConfigs(fieldId, options)
  }
}

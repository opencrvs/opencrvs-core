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
  createFieldConditionals,
  FormConditionalParameters
} from '../conditionals/conditionals'
import { createFieldConfig } from '../field-config/field-configuration'
import { FieldConditional } from './Conditional'
import { TranslationConfig } from './TranslationConfig'
import {
  ComputedDefaultValue,
  SelectOption,
  ValidationConfig
} from './FieldConfig'

/**
 * Creates a {@link ComputedDefaultValue} descriptor for use in a field's `defaultValue`.
 *
 * Unlike `field(id).customClientEvaluation(fn)`, this builder is **not tied to any
 * specific field**. Use it when the initial value should be derived purely from
 * context variables (`$now`, `$online`, system variables such as `$user`) rather
 * than from another field's current value.
 *
 * The serialised function receives `(undefined, context)` at runtime, where
 * `context` is a {@link FormConditionalParameters} object.
 *
 * External references (e.g. lodash) are **not** available inside the function body —
 * all logic must be self-contained so the code survives serialisation.
 *
 * @example
 * // Default a date field to today
 * defaultValue: evaluate((_, ctx) => ctx.$now)
 *
 * @example
 * // Default to the current user's role
 * defaultValue: evaluate((_, ctx) => ctx.user.role)
 */
export function evaluate(
  computationFn: (
    fieldValue: undefined,
    context: FormConditionalParameters
  ) => unknown
): ComputedDefaultValue {
  return { $$code: computationFn.toString() }
}

/**
 * Entry point for defining conditional logic or configuration for a form field.
 * @param fieldId - The ID of the field to define rules or config for.
 * @returns An object combining conditional methods and configuration builders.
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

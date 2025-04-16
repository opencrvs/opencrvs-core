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
  EventState,
  FieldConfig,
  Inferred,
  FieldValue,
  SystemVariables,
  isFieldConfigDefaultValue
} from '@opencrvs/commons/client'
import { DependencyInfo } from '@client/forms'
import { replacePlaceholders } from '@client/v2-events/utils'

/*
 * Formik has a feature that automatically nests all form keys that have a dot in them.
 * Because our form field ids can have dots in them, we temporarily transform those dots
 * to a different character before passing the data to Formik. This function unflattens
 */
export const FIELD_SEPARATOR = '____'

export function makeFormFieldIdFormikCompatible(fieldId: string) {
  return fieldId.replaceAll('.', FIELD_SEPARATOR)
}

export function evalExpressionInFieldDefinition(
  expression: string,
  /*
   * These are used in the eval expression
   */
  { $form }: { $form: EventState }
) {
  // eslint-disable-next-line no-eval
  return eval(expression) as FieldValue
}

export function hasDefaultValueDependencyInfo(
  value: Inferred['defaultValue']
): value is DependencyInfo {
  return Boolean(value && typeof value === 'object' && 'dependsOn' in value)
}

export function handleDefaultValue({
  field,
  declaration,
  systemVariables
}: {
  field: FieldConfig
  declaration: EventState
  systemVariables: SystemVariables
}) {
  const defaultValue = field.defaultValue

  if (hasDefaultValueDependencyInfo(defaultValue)) {
    return evalExpressionInFieldDefinition(defaultValue.expression, {
      $form: declaration
    })
  }

  if (isFieldConfigDefaultValue(defaultValue)) {
    return replacePlaceholders({
      fieldType: field.type,
      defaultValue,
      systemVariables
    })
  }

  return defaultValue
}

export function getDependentFields(
  fields: FieldConfig[],
  fieldId: string
): FieldConfig[] {
  return fields.filter((field) => {
    if (!field.defaultValue) {
      return false
    }
    if (!hasDefaultValueDependencyInfo(field.defaultValue)) {
      return false
    }
    return field.defaultValue.dependsOn.includes(fieldId)
  })
}

export interface Stringifiable {
  toString(): string
}

export function formatDateFieldValue(value: string) {
  return value
    .split('-')
    .map((d: string) => d.padStart(2, '0'))
    .join('-')
}

/**
 *
 * @param fields field config in OpenCRVS format (separated with `.`)
 * @param values form values in formik format (separated with `FIELD_SEPARATOR`)
 * @returns adds 0 before single digit days and months to make them 2 digit
 * because ajv's `formatMaximum` and `formatMinimum` does not allow single digit day or months
 */
export function makeDatesFormatted<T extends Record<string, FieldValue>>(
  fields: FieldConfig[],
  values: T
): T {
  return fields.reduce((acc, field) => {
    const fieldId = field.id.replaceAll('.', FIELD_SEPARATOR)

    if (field.type === 'DATE' && fieldId in values) {
      const value = values[fieldId as keyof typeof values]
      if (typeof value === 'string') {
        const formattedDate = formatDateFieldValue(value)
        return { ...acc, [fieldId]: formattedDate }
      }
    }
    return acc
  }, values)
}

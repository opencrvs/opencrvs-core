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
  ActionFormData,
  BaseField,
  ConditionalParameters,
  FieldConfig,
  FieldValue,
  validate,
  FieldType
} from '@opencrvs/commons/client'
import { DependencyInfo, IFormFieldValue } from '@client/forms'
import {
  dateToString,
  INITIAL_DATE_VALUE,
  INITIAL_PARAGRAPH_VALUE,
  INITIAL_RADIO_GROUP_VALUE,
  INITIAL_TEXT_VALUE,
  paragraphToString,
  radioGroupToString,
  textToString
} from '@client/v2-events/features/events/registered-fields'
function isRecord<V>(value: unknown): value is Record<string, V> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function handleInitialValue(
  field: FieldConfig,
  formData: ActionFormData
) {
  const initialValue = field.initialValue

  if (hasInitialValueDependencyInfo(initialValue)) {
    return evalExpressionInFieldDefinition(initialValue.expression, {
      $form: formData
    })
  }

  return initialValue
}

export function getConditionalActionsForField(
  field: FieldConfig,
  values: ConditionalParameters
) {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!field.conditionals) {
    return []
  }
  return field.conditionals
    .filter((conditional) => validate(conditional.conditional, values))
    .map((conditional) => conditional.type)
}

export function evalExpressionInFieldDefinition(
  expression: string,
  /*
   * These are used in the eval expression
   */
  { $form }: { $form: ActionFormData }
) {
  // eslint-disable-next-line no-eval
  return eval(expression) as FieldValue
}

export function hasInitialValueDependencyInfo(
  value: BaseField['initialValue']
): value is DependencyInfo {
  return typeof value === 'object' && value !== null && 'dependsOn' in value
}

export function getDependentFields(
  fields: FieldConfig[],
  fieldName: string
): FieldConfig[] {
  return fields.filter((field) => {
    if (!field.initialValue) {
      return false
    }
    if (!hasInitialValueDependencyInfo(field.initialValue)) {
      return false
    }
    return field.initialValue.dependsOn.includes(fieldName)
  })
}

export function flatten<T>(
  obj: Record<string, T>,
  parentKey = '',
  separator = '.'
): Record<string, T> {
  const result: Record<string, T> = {}

  for (const [key, value] of Object.entries(obj)) {
    const newKey = parentKey ? `${parentKey}${separator}${key}` : key

    if (isRecord(value)) {
      Object.assign(
        result,
        flatten(value as Record<string, T>, newKey, separator)
      )
    } else {
      result[newKey] = value
    }
  }

  return result
}

export function unflatten<T>(
  obj: Record<string, T>,
  separator = '.'
): Record<string, T | Record<string, T>> {
  const result: Record<string, T | Record<string, T>> = {}

  for (const [key, value] of Object.entries(obj)) {
    const keys = key.split(separator)
    let current: Record<string, T | Record<string, T>> = result

    keys.forEach((part, index) => {
      if (!current[part] || typeof current[part] !== 'object') {
        current[part] = index === keys.length - 1 ? value : {}
      }
      current = current[part] as Record<string, T | Record<string, T>>
    })
  }

  return result
}

const initialValueMapping: Record<FieldType, IFormFieldValue | null> = {
  [FieldType.TEXT]: INITIAL_TEXT_VALUE,
  [FieldType.DATE]: INITIAL_DATE_VALUE,
  [FieldType.RADIO_GROUP]: INITIAL_RADIO_GROUP_VALUE,
  [FieldType.PARAGRAPH]: INITIAL_PARAGRAPH_VALUE,
  [FieldType.FILE]: null,
  [FieldType.HIDDEN]: null
}

export function getInitialValues(fields: FieldConfig[]) {
  const initialValues: Record<string, IFormFieldValue | null> = {}

  fields.forEach((field) => {
    initialValues[field.id] = initialValueMapping[field.type]
  })
  return initialValues
}

export function fieldValueToString(field: FieldType, value: IFormFieldValue) {
  switch (field) {
    case FieldType.DATE:
      return dateToString(value)
    case FieldType.TEXT:
      return textToString(value)
    case FieldType.PARAGRAPH:
      return paragraphToString(value)
    case FieldType.RADIO_GROUP:
      return radioGroupToString(value)
    default:
      return ''
  }
}

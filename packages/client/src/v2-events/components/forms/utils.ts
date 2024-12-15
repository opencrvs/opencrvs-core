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
  DependencyInfo,
  IFormFieldValue,
  IFormSectionData
} from '@client/forms'

import { BaseField, FieldConfig, validate } from '@opencrvs/commons/client'

export function handleInitialValue(
  field: FieldConfig,
  formData: IFormSectionData
) {
  const initialValue = field.initialValue

  if (hasInitialValueDependencyInfo(initialValue)) {
    return evalExpressionInFieldDefinition(initialValue.expression, {
      $form: formData
    })
  }

  return initialValue
}

export type FlatFormData = Record<string, IFormFieldValue>

export const getConditionalActionsForField = (
  field: FieldConfig,
  values: FlatFormData
) => {
  if (!field.conditionals) {
    return []
  }
  return field.conditionals
    .filter((conditional) =>
      validate(conditional.conditional, {
        $form: values,
        $now: new Date().toISOString().split('T')[0]
      })
    )
    .map((conditional) => conditional.type)
}

export const evalExpressionInFieldDefinition = (
  expression: string,
  /*
   * These are used in the eval expression
   */
  { $form }: { $form: FlatFormData }
) => {
  // eslint-disable-next-line no-eval
  return eval(expression) as IFormFieldValue
}

function isRecord<V>(value: unknown): value is Record<string, V> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
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

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
import { formatISO } from 'date-fns'
import {
  ActionFormData,
  FieldConfig,
  Inferred,
  FieldValue,
  isFieldHidden
} from '@opencrvs/commons/client'
import { DependencyInfo } from '@client/forms'
import { FIELD_SEPARATOR } from './FormFieldGenerator'

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

export function isFormFieldVisible(field: FieldConfig, form: ActionFormData) {
  return !isFieldHidden(field, {
    $form: form,
    $now: formatISO(new Date(), {
      representation: 'date'
    })
  })
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
  value: Inferred['initialValue']
): value is DependencyInfo {
  return typeof value === 'object' && 'dependsOn' in value
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

/**
 * Used for ensuring that the object has all the properties. For example, intl expects object with well defined properties for translations.
 * For setting default fields for form values @see setFormValueToOutputFormat
 *
 * @returns object based on the fields given with null values.
 */
export function setEmptyValuesForFields(fields: FieldConfig[]) {
  return fields.reduce((initialValues: Record<string, null>, field) => {
    return {
      ...initialValues,
      [field.id]: null
    }
  }, {})
}

export interface Stringifiable {
  toString(): string
}

/**
 *
 * @param fields field config in OpenCRVS format (separated with `.`)
 * @param values form values in formik format (separated with `FIELD_SEPARATOR`)
 * @returns adds 0 before single digit days and months to make them 2 digit
 * because ajv's `formatMaximum` and `formatMinimum` does not allow single digit day or months
 */
export function makeDatesFormatted(
  fields: FieldConfig[],
  values: Record<string, FieldValue>
) {
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

export function formatDateFieldValue(value: string) {
  return value
    .split('-')
    .map((d: string) => d.padStart(2, '0'))
    .join('-')
}

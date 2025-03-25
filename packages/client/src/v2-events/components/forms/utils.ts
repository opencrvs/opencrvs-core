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
  MetaFields,
  isFieldConfigDefaultValue,
  DataEntry,
  FieldType
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

export function handleDefaultValue(
  field: FieldConfig,
  formData: EventState,
  meta: MetaFields
) {
  const defaultValue = field.defaultValue

  if (hasDefaultValueDependencyInfo(defaultValue)) {
    return evalExpressionInFieldDefinition(defaultValue.expression, {
      $form: formData
    })
  }

  if (isFieldConfigDefaultValue(defaultValue)) {
    return replacePlaceholders({
      fieldType: field.type,
      defaultValue,
      meta: meta
    })
  }
  return defaultValue
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

export function getDependentFields(
  fields: FieldConfig[],
  fieldName: string
): FieldConfig[] {
  return fields.filter((field) => {
    if (!field.defaultValue) {
      return false
    }
    if (!hasDefaultValueDependencyInfo(field.defaultValue)) {
      return false
    }
    return field.defaultValue.dependsOn.includes(fieldName)
  })
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

export function getFieldFromDataEntry({
  formData,
  dataEntry,
  declareFormFields
}: {
  formData: EventState
  dataEntry: DataEntry
  declareFormFields: Inferred[]
}): { value: FieldValue; config?: Inferred } {
  const { customValue, fieldId } = dataEntry
  if (!customValue) {
    return {
      value: formData[fieldId],
      config: declareFormFields.find((f) => f.id === fieldId)
    }
  }
  const template = customValue.value
  let resolvedValue = customValue.value
  const keys = template.match(/{([^}]+)}/g)
  if (keys) {
    keys.forEach((key) => {
      const val = formData[key.replace(/{|}/g, '')]
      if (!val) {
        throw new Error(`Could not resolve ${key}`)
      }
      resolvedValue = resolvedValue.replace(key, val.toString())
    })
  }

  return {
    value: resolvedValue,
    config: {
      type: FieldType.TEXT,
      id: fieldId,
      label: customValue.label
    }
  }
}

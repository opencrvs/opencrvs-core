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
  FieldConfig,
  FieldType,
  EventState,
  SystemVariables,
  isFieldConfigDefaultValue
} from '@opencrvs/commons/client'
import { replacePlaceholders } from '@client/v2-events/utils'

/*
 * Formik has a feature that automatically nests all form keys that have a dot in them.
 * Because our form field ids can have dots in them, we temporarily transform those dots
 * to a different character before passing the data to Formik. This function unflattens
 */
export const FIELD_SEPARATOR = '____'
const DOT_SEPARATOR = '.'

export function makeFormFieldIdFormikCompatible(fieldId: string) {
  return fieldId.replaceAll(DOT_SEPARATOR, FIELD_SEPARATOR)
}

export function makeFormikFieldIdOpenCRVSCompatible(fieldId: string): string {
  return fieldId.replaceAll(FIELD_SEPARATOR, DOT_SEPARATOR)
}

export function handleDefaultValue({
  field,
  systemVariables
}: {
  field: FieldConfig
  systemVariables: SystemVariables
}) {
  const defaultValue = field.defaultValue

  if (isFieldConfigDefaultValue(field.defaultValue)) {
    return replacePlaceholders({
      fieldType: field.type,
      defaultValue,
      systemVariables
    })
  }

  return defaultValue
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
export function makeDatesFormatted<T extends EventState>(
  fields: FieldConfig[],
  values: T
): T {
  return fields.reduce((acc, field) => {
    const fieldId = field.id.replaceAll(DOT_SEPARATOR, FIELD_SEPARATOR)

    if (field.type === FieldType.DATE && fieldId in values) {
      const value = values[fieldId as keyof typeof values]
      if (typeof value === 'string') {
        const formattedDate = formatDateFieldValue(value)
        return { ...acc, [fieldId]: formattedDate }
      }
    }
    return acc
  }, values)
}

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
import { get } from 'lodash'
import { formatISO } from 'date-fns'
import {
  FieldReference,
  FieldValue,
  HttpField,
  isFieldReference,
  CodeToEvaluate,
  isCodeToEvaluate
} from '@opencrvs/commons/client'
import { IndexMap } from '@client/utils'
import {
  makeFormFieldIdFormikCompatible,
  makeFormikFieldIdOpenCRVSCompatible
} from '@client/v2-events/components/forms/utils'

/**
 * Formik has a feature that automatically nests all form keys that have a dot in them.
 * Because our form field ids can have dots in them, we temporarily transform those dots
 * to a different character before passing the data to Formik. This function unflattens
 *
 * @example {'foo.bar.baz': 'quix' } => {'foo____bar____baz': 'quix' }
 */
export function makeFormFieldIdsFormikCompatible<T>(
  data: Record<string, T>
): IndexMap<T> {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [
      makeFormFieldIdFormikCompatible(key),
      value
    ])
  )
}

export function makeFormikFieldIdsOpenCRVSCompatible<T>(
  data: Record<string, T>
): IndexMap<T> {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [
      makeFormikFieldIdOpenCRVSCompatible(key),
      value
    ])
  )
}

export function parseFieldReferenceToValue(
  fieldReference: FieldReference,
  fieldValues: Record<string, FieldValue>
) {
  return fieldReference.$$subfield && fieldReference.$$subfield.length > 0
    ? get(fieldValues[fieldReference.$$field], fieldReference.$$subfield)
    : fieldValues[fieldReference.$$field]
}

/**
 * Evaluates a CodeToEvaluate by deserializing and executing the function.
 * The function receives the field value and a context object containing $form and other contextual data.
 *
 * @param codeToEvaluate - The CodeToEvaluate object with serialized function string
 * @param fieldValue - The current value of the field
 * @param fieldValues - All form field values for context
 * @returns The computed value, or undefined if evaluation fails
 */
export function evaluateCode(
  codeToEvaluate: CodeToEvaluate,
  fieldValue: FieldValue | undefined,
  fieldValues: Record<string, FieldValue>
): any {
  try {
    const computationFn = new Function(
      'value',
      'context',
      `return (${codeToEvaluate.$$code})(value, context)`
    )

    const context = {
      $form: fieldValues,
      $now: formatISO(new Date(), { representation: 'date' }),
      $online: typeof navigator !== 'undefined' ? navigator.onLine : true
    }

    const result = computationFn(fieldValue, context)
    return result
  } catch (error) {
    // Gracefully handle errors - return undefined
    return undefined
  }
}

/**
 * Unified resolver for FieldReference and CodeToEvaluate.
 * This function abstracts the resolution logic for both types.
 *
 * @param value - The value to resolve (could be FieldReference, CodeToEvaluate, or plain value)
 * @param fieldValues - All form field values
 * @param currentFieldValue - The current field's value (used for CodeToEvaluate)
 * @returns Resolved value
 */
export function resolveValue(
  value: unknown,
  fieldValues: Record<string, FieldValue>,
  currentFieldValue?: FieldValue
): any {
  if (isFieldReference(value)) {
    return parseFieldReferenceToValue(value, fieldValues)
  }
  
  if (isCodeToEvaluate(value)) {
    return evaluateCode(value, currentFieldValue, fieldValues)
  }
  
  return value
}

export function parseFieldReferencesInConfiguration(
  configuration: HttpField['configuration'],
  form: Record<string, FieldValue>
) {
  const result = {
    ...configuration,
    params: configuration.params
      ? Object.fromEntries(
          Object.entries(configuration.params).map(([key, value]) => [
            key,
            resolveValue(value, form)
          ])
        )
      : undefined
  }

  return result
}

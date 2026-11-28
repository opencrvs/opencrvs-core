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
// @TODO: REREAD
import { get, pick } from 'lodash'
import {
  ActionUpdate,
  EventState,
  FieldConfig,
  FieldValue,
  buildClientFunctionContext,
  flattenFieldReference,
  isCodeToEvaluate,
  isFieldVisible,
  runClientFunction,
  FieldType
} from '@opencrvs/commons/client'
import { resolveSyncedFieldValue } from '@client/v2-events/components/forms/FormFieldGenerator/utils'
import {
  formForConditionals,
  mergeFormValues
} from '@client/v2-events/components/forms/formValues'
import {
  FormConditionalContext,
  toActionFormConditionalContext
} from '@client/v2-events/components/forms/formConditionalContext'
import { useDefaultValue } from './useDefaultValue'

type GetDefaultValue = (
  field: FieldConfig,
  form: EventState | ActionUpdate
) => FieldValue | undefined

/**
 * Returns the value of a visible field: the form value, else the synced value, else the default value.
 * A form value can be `null`. The function keeps it.
 *
 * @param resolvedValues the values of the page that are resolved before this field.
 * @param annotates see `formForConditionals`.
 * @param siblingValues the other values of the form, e.g. the other pages.
 */
function resolveFieldValue(
  field: FieldConfig,
  resolvedValues: EventState,
  annotates: ActionUpdate | null,
  siblingValues: ActionUpdate,
  getDefaultValue: GetDefaultValue
): FieldValue | undefined {
  if (resolvedValues[field.id] !== undefined) {
    return resolvedValues[field.id]
  }

  const syncedValue = resolveSyncedFieldValue(field, (syncRef) => {
    const key = flattenFieldReference(syncRef)
    const referenced =
      get(resolvedValues, key) ??
      get(
        mergeFormValues(formForConditionals({}, annotates, siblingValues)),
        key
      )

    // A computed reference stores the result of its function, not the value that it reads.
    return isCodeToEvaluate(syncRef)
      ? (runClientFunction(
          syncRef.$$code,
          referenced,
          buildClientFunctionContext({
            form: mergeFormValues(
              formForConditionals(resolvedValues, annotates, siblingValues)
            )
          })
        ) as FieldValue | undefined)
      : referenced
  })

  return (
    syncedValue ??
    getDefaultValue(
      field,
      mergeFormValues(
        formForConditionals(resolvedValues, annotates, siblingValues)
      )
    )
  )
}

/**
 * Resolves the values of a page. The function does not change its arguments.
 *
 * Each field sees the values that are resolved before it on the page.
 * A hidden field keeps its value. A field group resolves the values of its subfields in the same way.
 *
 * @param values the values of the page, before they are resolved.
 * @param annotates see `formForConditionals`.
 * @param siblingValues the other values of the form, e.g. the other pages.
 */
export function computeInitialValues(
  fields: FieldConfig[],
  values: EventState,
  annotates: ActionUpdate | null,
  siblingValues: ActionUpdate,
  conditionalContext: FormConditionalContext,
  getDefaultValue: GetDefaultValue
): EventState {
  return fields.reduce((resolvedValues, field) => {
    if (field.type === FieldType.FIELD_GROUP) {
      const groupValues = computeInitialValues(
        field.fields,
        (resolvedValues[field.id] as EventState | undefined) ?? {},
        annotates,
        { ...siblingValues, ...resolvedValues },
        conditionalContext,
        getDefaultValue
      )

      return { ...resolvedValues, [field.id]: groupValues }
    }

    if (
      !isFieldVisible(
        field,
        formForConditionals(resolvedValues, annotates, siblingValues),
        toActionFormConditionalContext(conditionalContext)
      )
    ) {
      return resolvedValues
    }

    return {
      ...resolvedValues,
      [field.id]: resolveFieldValue(
        field,
        resolvedValues,
        annotates,
        siblingValues,
        getDefaultValue
      )
    }
  }, values)
}

export function useFormInitialValues() {
  const getDefaultValue = useDefaultValue()

  return {
    /**
     * @param editedValues all the values that the form edits. The values of the page are taken from it.
     * @param annotates see `formForConditionals`.
     * @param siblingValues see `formForConditionals`.
     */
    getInitialValues: (
      pageFields: FieldConfig[],
      editedValues: EventState,
      annotates: ActionUpdate | null,
      siblingValues: ActionUpdate | undefined,
      conditionalContext: FormConditionalContext
    ) =>
      computeInitialValues(
        pageFields,
        pick(
          editedValues,
          pageFields.map((field) => field.id)
        ),
        annotates,
        { ...siblingValues, ...editedValues },
        conditionalContext,
        getDefaultValue
      )
  }
}

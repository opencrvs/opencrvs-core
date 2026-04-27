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
import {
  EventState,
  FieldConfig,
  FieldValue,
  flattenFieldReference,
  isFieldVisible,
  FieldType,
  ValidatorContext
} from '@opencrvs/commons/client'
import { resolveSyncedFieldValue } from '@client/v2-events/components/forms/FormFieldGenerator/utils'
import { useDefaultValue } from './useDefaultValue'

export function computeInitialValues(
  fields: FieldConfig[],
  context: ValidatorContext,
  getDefaultValue: (field: FieldConfig) => FieldValue | undefined
): EventState {
  const values: EventState = {}

  for (const field of fields) {
    if (field.type === FieldType.FIELD_GROUP) {
      // Recurse cumulatively — sub-fields see accumulated top-level state
      const subValues = computeInitialValues(
        field.fields,
        { ...context, baseFormState: { ...context.baseFormState, ...values } },
        getDefaultValue
      )
      values[field.id] = subValues
      continue
    }

    if (!isFieldVisible(field, values, context)) {
      continue
    }

    /*
    /* Visible simple field: formValue ?? resolveSyncedFieldValue ?? getDefaultValue
     * where a formValue can be null
     */
    const effectiveValue =
      context.baseFormState?.[field.id] !== undefined
        ? context.baseFormState[field.id]
        : (resolveSyncedFieldValue(field, (syncRef) => {
            const key = flattenFieldReference(syncRef)
            return get(values, key) ?? get(context.baseFormState, key)
          }) ?? getDefaultValue(field))

    values[field.id] = effectiveValue
  }

  return values
}

export function useFormInitialValues() {
  const getDefaultValue = useDefaultValue()

  return {
    getInitialValues: (
      fields: FieldConfig[],
      formValues: EventState,
      context: ValidatorContext
    ) =>
      computeInitialValues(
        fields,
        {
          ...context,
          baseFormState: { ...context.baseFormState, ...formValues }
        },
        getDefaultValue
      )
  }
}

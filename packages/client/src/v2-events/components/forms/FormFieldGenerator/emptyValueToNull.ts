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
import { FieldConfig, FieldValue } from '@opencrvs/commons/client'
import { isEmptyValue } from '@client/v2-events/features/events/components/Output'

function isDeeplyEmpty(value: unknown): boolean {
  if (value === undefined || value === null || value === '') {
    return true
  }

  if (Array.isArray(value)) {
    return value.every(isDeeplyEmpty)
  }

  if (typeof value === 'object') {
    return Object.values(value).every(isDeeplyEmpty)
  }

  return false
}

function isCleared(field: FieldConfig, value: FieldValue | undefined): boolean {
  return isDeeplyEmpty(value) || isEmptyValue(field, value)
}

/**
 * Converts a value that was previously filled but has now been cleared to `null`.
 * This signals to data model mechanisms that the field should be removed or unset,
 * as opposed to being left as an empty string or object. If the field was previously
 * unfilled, or the new value is not cleared, the new value is returned unchanged.
 *
 * @param field - The field configuration object.
 * @param previousValue - The previous value of the field before the change.
 * @param newValue - The new value of the field after the change.
 * @returns {FieldValue | null | undefined}
 *   - Returns `null` if the field was previously filled and is now cleared.
 *   - Returns the new value otherwise.
 */
export function emptyValueToNull(
  field: FieldConfig,
  previousValue: FieldValue | undefined,
  newValue: FieldValue | undefined
): FieldValue | null | undefined {
  if (!isCleared(field, previousValue) && isCleared(field, newValue)) {
    return null
  }

  return newValue
}

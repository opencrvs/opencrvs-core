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
import { IDateRangePickerValue, IFormFieldValue } from '@client/forms'
import { isInvalidDate } from '@client/forms/advancedSearch/fieldDefinitions/utils'
import { validationMessages as messages } from '@client/i18n/messages'

// Type guard to check if the value is IDateRangePickerValue
function isIDateRangePickerValue(
  value: IFormFieldValue
): value is IDateRangePickerValue {
  return (value as IDateRangePickerValue).exact !== undefined
}

export const isValidDate = (value: IFormFieldValue) => {
  if (!isIDateRangePickerValue(value)) {
    return undefined
  }

  // if date range is active date field is not needed to be validated
  if (value.isDateRangeActive) return undefined

  const dateString = value.exact

  return isInvalidDate(dateString)
    ? { message: messages.invalidDate }
    : undefined
}

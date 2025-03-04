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

import { EventConfig, FieldValue } from '@opencrvs/commons/client'
import { getAllUniqueFields } from '@client/v2-events/utils'
import { getValidationErrorsForForm } from '@client/v2-events/components/forms/validation'

export const getAdvancedSearchFieldErrors = (
  currentEvent: EventConfig,
  formValues: Record<string, FieldValue>
) => {
  const allUniqueFields = getAllUniqueFields(currentEvent)
  return currentEvent.advancedSearch.reduce(
    (errorsOnFields, currentSection) => {
      const advancedSearchFieldIds = currentSection.fields.map((f) => f.fieldId)
      const advancedSearchFields = allUniqueFields.filter((field) =>
        advancedSearchFieldIds.includes(field.id)
      )

      const modifiedFields = advancedSearchFields.map((f) => ({
        ...f,
        required: false // advanced search fields need not be required
      }))

      const err = getValidationErrorsForForm(modifiedFields, formValues)

      return {
        ...errorsOnFields,
        ...err
      }
    },
    {}
  )
}

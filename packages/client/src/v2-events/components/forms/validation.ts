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
import { FieldConfig, getFieldValidationErrors } from '@opencrvs/commons/client'
import { ActionFormData } from '@opencrvs/commons'
import { IValidationResult } from '@client/utils/validate'

interface IFieldErrors {
  errors: IValidationResult[]
}

export interface Errors {
  [fieldName: string]: IFieldErrors
}

export function getValidationErrorsForForm(
  fields: FieldConfig[],
  values: ActionFormData,
  checkValidationErrorsOnly?: boolean
) {
  return fields.reduce(
    (errorsForAllFields: Errors, field) =>
      // eslint-disable-next-line
      errorsForAllFields[field.id] &&
      errorsForAllFields[field.id].errors.length > 0
        ? errorsForAllFields
        : {
            ...errorsForAllFields,
            [field.id]: getFieldValidationErrors({
              field: {
                ...field,
                required: field.required && !checkValidationErrorsOnly
              },
              values
            })
          },
    {}
  )
}

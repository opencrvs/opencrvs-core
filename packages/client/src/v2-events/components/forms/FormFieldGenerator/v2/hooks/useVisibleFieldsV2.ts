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
  isFieldVisible,
  omitHiddenFields
} from '@opencrvs/commons/client'
import { useFormState } from './useFormState'
import { useCompleteForm } from './useCompleteForm'

export function useVisibleFieldsV2(fields: FieldConfig[]) {
  const { formFields, validatorContext } = useFormState()

  const completeForm = useCompleteForm()

  const visibleFieldValues = omitHiddenFields(
    formFields,
    completeForm,
    validatorContext
  )
  return fields.filter((field) =>
    isFieldVisible(field, visibleFieldValues, validatorContext)
  )
}

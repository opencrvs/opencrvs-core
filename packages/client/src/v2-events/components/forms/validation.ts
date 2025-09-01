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
import { MessageDescriptor } from 'react-intl'
import {
  FieldConfig,
  EventState,
  omitHiddenPaginatedFields,
  isPageVisible,
  FormConfig,
  omitHiddenFields,
  runFieldValidations,
  runStructuralValidations,
  Location
} from '@opencrvs/commons/client'

interface FieldErrors {
  errors: {
    message: MessageDescriptor
  }[]
}

export interface Errors {
  [fieldName: string]: FieldErrors
}

export function getValidationErrorsForForm(
  fields: FieldConfig[],
  values: EventState,
  locations: Location[]
) {
  return fields.reduce((errorsForAllFields: Errors, field) => {
    if (
      // eslint-disable-next-line
      errorsForAllFields[field.id] &&
      errorsForAllFields[field.id].errors.length > 0
    ) {
      return errorsForAllFields
    }

    return {
      ...errorsForAllFields,
      [field.id]: runFieldValidations({
        field,
        values,
        context: { locations }
      })
    }
  }, {})
}

export function getStructuralValidationErrorsForForm(
  fields: FieldConfig[],
  values: EventState,
  locations: Location[]
) {
  return fields.reduce((errorsForAllFields: Errors, field) => {
    if (
      // eslint-disable-next-line
      errorsForAllFields[field.id] &&
      errorsForAllFields[field.id].errors.length > 0
    ) {
      return errorsForAllFields
    }

    return {
      ...errorsForAllFields,
      [field.id]: runStructuralValidations({
        field,
        values,
        context: { locations }
      })
    }
  }, {})
}

export function validationErrorsInActionFormExist({
  formConfig,
  form,
  annotation,
  reviewFields = [],
  locations = []
}: {
  formConfig: FormConfig
  form: EventState
  annotation?: EventState
  reviewFields?: FieldConfig[]
  locations?: Location[]
}): boolean {
  // We don't want to validate hidden fields
  const formWithoutHiddenFields = omitHiddenPaginatedFields(formConfig, form, {
    locations
  })

  const visibleAnnotationFields = omitHiddenFields(
    reviewFields,
    annotation ?? {},
    { locations }
  )

  const hasValidationErrors = formConfig.pages
    .filter((page) => isPageVisible(page, form, { locations }))
    .some((page) => {
      const fieldErrors = getValidationErrorsForForm(
        page.fields,
        formWithoutHiddenFields,
        locations
      )
      return Object.values(fieldErrors).some((field) => field.errors.length > 0)
    })

  const hasAnnotationValidationErrors = Object.values(
    getValidationErrorsForForm(reviewFields, visibleAnnotationFields, locations)
  ).some((field) => field.errors.length > 0)

  return hasValidationErrors || hasAnnotationValidationErrors
}

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
  isPageVisible,
  FormConfig,
  IndexMap,
  runStructuralValidations,
  ValidatorContext,
  runFieldValidations,
  omitHiddenFields,
  omitHiddenPaginatedFields
} from '@opencrvs/commons/client'

interface FieldError {
  message: MessageDescriptor
}

export type IntlErrors = IndexMap<FieldError[]>

export function getValidationErrorsForForm(
  fields: FieldConfig[],
  values: EventState,
  context: ValidatorContext
) {
  return fields.reduce((errorsForAllFields: IntlErrors, field) => {
    if ((errorsForAllFields[field.id] ?? []).length > 0) {
      return errorsForAllFields
    }

    return {
      ...errorsForAllFields,
      [field.id]: runFieldValidations({
        field,
        values,
        context
      })
    }
  }, {})
}

export function getStructuralValidationErrorsForForm(
  fields: FieldConfig[],
  values: EventState,
  context: ValidatorContext
) {
  return fields.reduce((errorsForAllFields: IntlErrors, field) => {
    if ((errorsForAllFields[field.id] ?? []).length > 0) {
      return errorsForAllFields
    }

    return {
      ...errorsForAllFields,
      [field.id]: runStructuralValidations({
        field,
        values,
        context
      })
    }
  }, {})
}

export function validationErrorsInActionFormExist({
  formConfig,
  form,
  context,
  annotation,
  reviewFields = []
}: {
  formConfig: FormConfig
  form: EventState
  context: ValidatorContext
  annotation?: EventState
  reviewFields?: FieldConfig[]
}): boolean {
  // We don't want to validate hidden fields
  const formWithoutHiddenFields = omitHiddenPaginatedFields(
    formConfig,
    form,
    context
  )

  const visibleAnnotationFields = omitHiddenFields(
    reviewFields,
    annotation ?? {},
    context
  )

  const hasValidationErrors = formConfig.pages
    .filter((page) => isPageVisible(page, form, context))
    .some((page) => {
      const formErrors = getValidationErrorsForForm(
        page.fields,
        formWithoutHiddenFields,
        context
      )

      return Object.values(formErrors).some(
        (fieldErrors) => (fieldErrors ?? []).length > 0
      )
    })

  const hasAnnotationValidationErrors = Object.values(
    getValidationErrorsForForm(reviewFields, visibleAnnotationFields, context)
  ).some((fieldErrors) => (fieldErrors ?? []).length > 0)

  return hasValidationErrors || hasAnnotationValidationErrors
}

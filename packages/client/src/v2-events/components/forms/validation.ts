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
import { MessageDescriptor } from 'react-intl'
import {
  FieldConfig,
  EventState,
  isPageVisible,
  FormConfig,
  runStructuralValidations,
  runFieldValidations,
  omitHiddenFields,
  omitHiddenPaginatedFields,
  FormState,
  flattenFormState,
  IndexMap,
  ActionUpdate
} from '@opencrvs/commons/client'
import { formForConditionals } from './formValues'
import {
  FormConditionalContext,
  toActionFormConditionalContext
} from './formConditionalContext'

interface ErrorMessage {
  message: MessageDescriptor
}

export type IntlErrors = IndexMap<FormState<ErrorMessage[]>>

/** Returns the declaration without the values of hidden fields. */
export function omitHiddenFieldsFromDeclaration(
  fields: FieldConfig[],
  declaration: EventState,
  conditionalContext: FormConditionalContext
): EventState {
  const form = omitHiddenFields(
    fields,
    { declaration },
    toActionFormConditionalContext(conditionalContext)
  )
  // omitHiddenFields only removes values, so the values keep their type
  return form.declaration as EventState
}

/** Returns the declaration without the values of hidden pages and hidden fields. */
export function omitHiddenPaginatedFieldsFromDeclaration(
  formConfig: FormConfig,
  declaration: EventState,
  conditionalContext: FormConditionalContext
): EventState {
  const form = omitHiddenPaginatedFields(
    formConfig,
    { declaration },
    toActionFormConditionalContext(conditionalContext)
  )
  // omitHiddenPaginatedFields only removes values, so the values keep their type
  return form.declaration as EventState
}

/**
 * @param values the values that the form edits.
 * @param annotates see `formForConditionals`.
 * @param siblingValues see `formForConditionals`.
 */
export function getValidationErrorsForForm(
  fields: FieldConfig[],
  values: EventState,
  annotates: ActionUpdate | null,
  conditionalContext: FormConditionalContext,
  siblingValues?: ActionUpdate
) {
  const form = formForConditionals(values, annotates, siblingValues)
  const actionFormContext = toActionFormConditionalContext(conditionalContext)

  return fields.reduce((errorsForAllFields: IntlErrors, field) => {
    if (flattenFormState(errorsForAllFields[field.id] ?? []).length > 0) {
      return errorsForAllFields
    }

    return {
      ...errorsForAllFields,
      [field.id]: runFieldValidations({
        field,
        value: values[field.id],
        form,
        context: actionFormContext
      })
    }
  }, {})
}

export function getStructuralValidationErrorsForForm(
  fields: FieldConfig[],
  values: EventState,
  conditionalContext: FormConditionalContext
) {
  const actionFormContext = toActionFormConditionalContext(conditionalContext)

  return fields.reduce((errorsForAllFields: IntlErrors, field) => {
    if (flattenFormState(errorsForAllFields[field.id] ?? []).length > 0) {
      return errorsForAllFields
    }

    return {
      ...errorsForAllFields,
      [field.id]: runStructuralValidations({
        field,
        form: { declaration: values },
        context: actionFormContext
      })
    }
  }, {})
}

export function validationErrorsInActionFormExist({
  formConfig,
  form,
  annotates = null,
  conditionalContext,
  annotation,
  reviewFields = []
}: {
  formConfig: FormConfig
  form: EventState
  /** The declaration that `form` annotates. Leave it out when `form` is a declaration. */
  annotates?: EventState | null
  conditionalContext: FormConditionalContext
  annotation?: EventState
  reviewFields?: FieldConfig[]
}): boolean {
  const actionFormContext = toActionFormConditionalContext(conditionalContext)
  const formValues = formForConditionals(form, annotates)

  // Do not validate hidden fields
  const visibleFormValues = omitHiddenPaginatedFields(
    formConfig,
    formValues,
    actionFormContext
  )
  // The function only removes values, so the values keep the type of `form`.
  const formWithoutHiddenFields = ((annotates
    ? visibleFormValues.annotation
    : visibleFormValues.declaration) ?? {}) as EventState

  // The function only removes values, so the values keep the type of `annotation`.
  const visibleAnnotationFields = (omitHiddenFields(
    reviewFields,
    { declaration: formWithoutHiddenFields, annotation: annotation ?? {} },
    actionFormContext
  ).annotation ?? {}) as EventState

  const hasValidationErrors = formConfig.pages
    .filter((page) => isPageVisible(page, formValues, actionFormContext))
    .some((page) => {
      const formErrors = getValidationErrorsForForm(
        page.fields,
        formWithoutHiddenFields,
        annotates,
        conditionalContext
      )

      return Object.values(formErrors).some(
        (fieldErrors) => flattenFormState(fieldErrors ?? []).length > 0
      )
    })

  const hasAnnotationValidationErrors = Object.values(
    getValidationErrorsForForm(
      reviewFields,
      { ...formWithoutHiddenFields, ...visibleAnnotationFields },
      null,
      conditionalContext
    )
  ).some((fieldErrors) => flattenFormState(fieldErrors ?? []).length > 0)

  return hasValidationErrors || hasAnnotationValidationErrors
}

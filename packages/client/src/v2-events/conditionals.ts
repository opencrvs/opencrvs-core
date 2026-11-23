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

/**
 * TODO: Temporary adapter. Remove it when the client passes `FormValues` and the conditional contexts itself.  https://github.com/opencrvs/opencrvs-core/issues/14485
 *
 * The client still passes the old `ValidatorContext`. These functions keep the old signatures,
 * convert the values with `toFormValues` and `getFormConditionalContext`, and call commons.
 *
 */
import {
  ActionConfig,
  ActionType,
  ActionUpdate,
  EventConfig,
  EventIndex,
  EventState,
  FieldConditional,
  FieldConfig,
  FieldUpdateValue,
  FormConfig,
  FormValues,
  getActionAnnotationFields,
  JSONSchema,
  PageConfig,
  ValidatorContext,
  areConditionsMet as areConditionsMetV2,
  dropSecuredDeclarationFields as dropSecuredDeclarationFieldsV2,
  isActionAvailable as isActionAvailableV2,
  isActionEnabled as isActionEnabledV2,
  isActionVisible as isActionVisibleV2,
  isConditionMet as isConditionMetV2,
  isFieldDisplayedOnReview as isFieldDisplayedOnReviewV2,
  isFieldEnabled as isFieldEnabledV2,
  isFieldSecured as isFieldSecuredV2,
  isFieldVisible as isFieldVisibleV2,
  isPageVisible as isPageVisibleV2,
  omitHiddenFields as omitHiddenFieldsV2,
  omitHiddenPaginatedFields as omitHiddenPaginatedFieldsV2,
  runFieldValidations as runFieldValidationsV2,
  runStructuralValidations as runStructuralValidationsV2
} from '@opencrvs/commons/client'
import {
  getFormConditionalContext,
  toFormValues
} from '@client/v2-events/hooks/useValidatorContext'

/** Returns the values that the form edits from a form that commons returns. */
function fromFormValues(form: FormValues, context: ValidatorContext) {
  return context.baseFormState === undefined
    ? form.declaration
    : form.annotation
}

export function isFieldVisible(
  field: FieldConfig,
  form: ActionUpdate,
  context: ValidatorContext
) {
  return isFieldVisibleV2(
    field,
    toFormValues(form, context),
    getFormConditionalContext(context)
  )
}

export function isFieldEnabled(
  field: FieldConfig,
  form: ActionUpdate,
  context: ValidatorContext
) {
  return isFieldEnabledV2(
    field,
    toFormValues(form, context),
    getFormConditionalContext(context)
  )
}

export function isFieldDisplayedOnReview(
  field: FieldConfig,
  form: ActionUpdate,
  context: ValidatorContext
) {
  return isFieldDisplayedOnReviewV2(
    field,
    toFormValues(form, context),
    getFormConditionalContext(context)
  )
}

export function isPageVisible(
  page: PageConfig,
  formValues: ActionUpdate,
  context: ValidatorContext
) {
  return isPageVisibleV2(
    page,
    toFormValues(formValues, context),
    getFormConditionalContext(context)
  )
}

export function isConditionMet(
  conditional: JSONSchema,
  values: ActionUpdate,
  context: ValidatorContext
) {
  return isConditionMetV2(
    conditional,
    toFormValues(values, context),
    getFormConditionalContext(context)
  )
}

export function areConditionsMet(
  conditions: FieldConditional[],
  values: ActionUpdate,
  context: ValidatorContext,
  event: EventIndex
) {
  return areConditionsMetV2(
    conditions,
    toFormValues(values, context),
    getFormConditionalContext(context, event)
  )
}

export function runFieldValidations({
  field,
  value,
  form,
  context
}: {
  field: FieldConfig
  value: FieldUpdateValue
  form: ActionUpdate
  context: ValidatorContext
}) {
  return runFieldValidationsV2({
    field,
    value,
    form: toFormValues(form, context),
    context: getFormConditionalContext(context)
  })
}

export function runStructuralValidations({
  field,
  values,
  context,
  actionType
}: {
  field: FieldConfig
  values: ActionUpdate
  context: ValidatorContext
  actionType?: ActionType
}) {
  return runStructuralValidationsV2({
    field,
    form: toFormValues(values, context),
    context: getFormConditionalContext(context),
    actionType
  })
}

export function omitHiddenFields<T extends EventState | ActionUpdate>(
  fields: FieldConfig[],
  formValues: T,
  context: ValidatorContext,
  includeHiddenFieldsWithNullValues = false
) {
  const form = omitHiddenFieldsV2(
    fields,
    toFormValues(formValues, context),
    getFormConditionalContext(context),
    includeHiddenFieldsWithNullValues
  )

  return fromFormValues(form, context) as Partial<T>
}

export function omitHiddenPaginatedFields<T extends EventState | ActionUpdate>(
  formConfig: FormConfig,
  values: T,
  context: ValidatorContext,
  includeHiddenFieldsWithNullValues = false
) {
  const form = omitHiddenPaginatedFieldsV2(
    formConfig,
    toFormValues(values, context),
    getFormConditionalContext(context),
    includeHiddenFieldsWithNullValues
  )

  return fromFormValues(form, context) as Partial<T>
}

export function omitHiddenAnnotationFields(
  actionConfig: ActionConfig,
  declaration: EventState,
  annotation: ActionUpdate,
  context: ValidatorContext
) {
  return omitHiddenFields(getActionAnnotationFields(actionConfig), annotation, {
    ...context,
    baseFormState: declaration
  })
}

export function isActionVisible(
  actionConfig: ActionConfig,
  event: EventIndex,
  context: ValidatorContext
) {
  return isActionVisibleV2(
    actionConfig,
    toFormValues(event.declaration, context),
    getFormConditionalContext(context, event)
  )
}

export function isActionEnabled(
  actionConfig: ActionConfig,
  event: EventIndex,
  context: ValidatorContext
) {
  return isActionEnabledV2(
    actionConfig,
    toFormValues(event.declaration, context),
    getFormConditionalContext(context, event)
  )
}

export function isActionAvailable(
  actionConfig: ActionConfig,
  event: EventIndex,
  context: ValidatorContext
) {
  return isActionAvailableV2(
    actionConfig,
    toFormValues(event.declaration, context),
    getFormConditionalContext(context, event)
  )
}

export function isFieldSecured(
  field: Pick<FieldConfig, 'secured'>,
  event: EventIndex,
  context: ValidatorContext
) {
  return isFieldSecuredV2(field, toFormValues(event.declaration, context), {
    eventIndex: event
  })
}

export function dropSecuredDeclarationFields(
  eventConfig: EventConfig,
  eventIndex: EventIndex,
  _context: ValidatorContext
) {
  return dropSecuredDeclarationFieldsV2(eventConfig, eventIndex, { eventIndex })
}

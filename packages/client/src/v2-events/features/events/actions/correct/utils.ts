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
import * as _ from 'lodash'
import {
  FieldConfig,
  EventState,
  isFieldVisible,
  isMetaAction,
  EventDocument,
  ActionType,
  FieldValue,
  ValidatorContext,
  deepMerge,
  omitHiddenFields,
  getDeclarationFields,
  EventConfig
} from '@opencrvs/commons/client'
import {
  EventHistoryActionDocument,
  EventHistoryDocument
} from './useActionForHistory'

/**
 * Function we use for checking whether a field value has changed.
 * For objects we need to ignore undefined values since the form might create them.
 * @returns whether the two field values are equal when ignoring undefined values
 */
export function isEqualFieldValue<T extends FieldValue>(a: T, b: T) {
  if (typeof a === 'object' && typeof b === 'object') {
    return _.isEqual(_.omitBy(a, _.isUndefined), _.omitBy(b, _.isUndefined))
  }

  return _.isEqual(a, b)
}

export function hasFieldChanged(
  f: FieldConfig,
  form: EventState,
  previousFormValues: EventState,
  context: ValidatorContext
) {
  const isVisible = isFieldVisible(f, form, context)

  const prevValue = previousFormValues[f.id]
  const currValue = form[f.id]

  // Ensure that if previous value is 'undefined' and current value is 'null'
  // it doesn't get detected as a value change
  const bothNil = _.isNil(prevValue) && _.isNil(currValue)
  const valueHasChanged = !isEqualFieldValue(prevValue, currValue) && !bothNil

  return isVisible && valueHasChanged
}

export function hasDeclarationFieldChanged(
  f: FieldConfig,
  form: EventState,
  previousFormValues: EventState,
  eventConfiguration: EventConfig,
  validatorContext: ValidatorContext
) {
  const fields = getDeclarationFields(eventConfiguration)
  const formWithoutHiddenFields = omitHiddenFields(
    fields,
    form,
    validatorContext
  )
  return hasFieldChanged(
    f,
    formWithoutHiddenFields,
    previousFormValues,
    validatorContext
  )
}

export function isLastActionCorrectionRequest(event: EventDocument) {
  const writeActions = event.actions.filter((a) => !isMetaAction(a.type))
  const lastWriteAction = writeActions[writeActions.length - 1]
  return lastWriteAction.type === ActionType.REQUEST_CORRECTION
}

function aggregateAnnotations(actions: EventHistoryActionDocument[]) {
  return actions.reduce((ann, sortedAction) => {
    return deepMerge(ann, sortedAction.annotation ?? {})
  }, {} as EventState)
}

/**
 * Compares annotations of a given field between the current action and the previous state.
 *
 * @param field Field configuration of a review form field
 * @param fullEvent Extended EventDocument with a possible synthetic `UPDATE` action
 * @param currentActionIndex Index of the action from the actions array of fullEvent to evaluate
 * @returns An object containing:
 *  - currentAnnotations: aggregated annotations including the current action
 *  - previousAnnotations: aggregated annotations up to (but not including) the current action
 *  - valueHasChanged: boolean indicating whether the field's value changed between the two states
 */
export function getAnnotationComparison(
  field: FieldConfig,
  fullEvent: EventHistoryDocument,
  currentActionIndex: number,
  context: ValidatorContext
) {
  if (currentActionIndex < 0) {
    return {
      currentAnnotations: {},
      previousAnnotations: {},
      valueHasChanged: false
    }
  }

  const eventUpToCurrentAction = fullEvent.actions.slice(
    0,
    currentActionIndex + 1
  )
  const eventUpToPreviousAction = fullEvent.actions.slice(0, currentActionIndex)

  const currentAnnotations = aggregateAnnotations(eventUpToCurrentAction)
  const previousAnnotations = aggregateAnnotations(eventUpToPreviousAction)

  const valueHasChanged = hasFieldChanged(
    field,
    currentAnnotations,
    previousAnnotations,
    context
  )

  return { currentAnnotations, previousAnnotations, valueHasChanged }
}

function getReviewForm(configuration: EventConfig) {
  return configuration.actions
    .filter((action) => 'review' in action)
    .map((action) => action.review)
}

export function getReviewFormFields(configuration: EventConfig) {
  const reviewForms = getReviewForm(configuration)
  return _.uniqBy(
    reviewForms.flatMap((form) => form.fields),
    (field) => field.id
  )
}

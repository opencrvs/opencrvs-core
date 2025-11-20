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
  EventConfig,
  getDeclaration,
  isFieldDisplayedOnReview,
  getCurrentEventState,
  ActionDocument,
  getAcceptedActions,
  FieldUpdateValue
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
export function isEqualFieldValue<T extends FieldValue | FieldUpdateValue>(
  a: T,
  b: T
) {
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
 * @param acceptedActions Array of accepted actions from the event history
 * @param currentActionIndex Index of the action from the acceptedActions array to compare.
 * @returns An object containing:
 *  - currentAnnotations: aggregated annotations including the current action
 *  - previousAnnotations: aggregated annotations up to (but not including) the current action
 *  - valueHasChanged: boolean indicating whether the field's value changed between the two states
 */
export function getAnnotationComparisonForField(
  field: FieldConfig,
  acceptedActions: EventHistoryActionDocument[],
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

  const eventUpToCurrentAction = acceptedActions.slice(
    0,
    currentActionIndex + 1
  )
  const eventUpToPreviousAction = acceptedActions.slice(0, currentActionIndex)

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

function isFirstDeclareOrNotifyAction(
  action: ActionDocument,
  fullEvent: EventDocument
) {
  if (action.type !== ActionType.DECLARE && action.type !== ActionType.NOTIFY) {
    return false
  }
  const acceptedActions = getAcceptedActions(fullEvent)
  const firstDeclareOrNotifyAction = acceptedActions.find(
    (a) => a.type === ActionType.DECLARE || a.type === ActionType.NOTIFY
  )
  return firstDeclareOrNotifyAction?.id === action.id
}

export function getDeclarationComparison(
  fullEvent: EventDocument,
  currentAction: ActionDocument,
  validatorContext: ValidatorContext,
  eventConfiguration: EventConfig
) {
  const acceptedActions = getAcceptedActions(fullEvent)
  const currentActionIndex = acceptedActions.findIndex(
    (a) => a.id === currentAction.id
  )

  const eventUpToCurrentAction = acceptedActions.slice(
    0,
    currentActionIndex + 1
  )
  const eventUpToPreviousAction = acceptedActions.slice(0, currentActionIndex)

  if (
    currentActionIndex < 0 ||
    isFirstDeclareOrNotifyAction(currentAction, fullEvent)
  ) {
    return {
      updatedValues: {},
      oldValues: {},
      valueHasChanged: false
    }
  }

  const declarationConfig = getDeclaration(eventConfiguration)

  const latestDeclaration = getCurrentEventState(
    { ...fullEvent, actions: eventUpToCurrentAction },
    eventConfiguration
  ).declaration

  const previousDeclaration = getCurrentEventState(
    { ...fullEvent, actions: eventUpToPreviousAction },
    eventConfiguration
  ).declaration

  const { updatedValues, oldValues } = declarationConfig.pages
    .flatMap((page) =>
      page.fields.filter((field) =>
        isFieldDisplayedOnReview(field, latestDeclaration, validatorContext)
      )
    )
    .reduce<{
      updatedValues: Record<string, unknown>
      oldValues: Record<string, unknown>
    }>(
      (acc, f) => {
        if (
          hasFieldChanged(
            f,
            latestDeclaration,
            previousDeclaration,
            validatorContext
          )
        ) {
          acc.updatedValues[f.id] = latestDeclaration[f.id]
          acc.oldValues[f.id] = previousDeclaration[f.id]
        }
        return acc
      },
      { updatedValues: {}, oldValues: {} }
    )

  return {
    valueHasChanged: !_.isEmpty(updatedValues),
    updatedValues,
    oldValues
  }
}

export function hasAnnotationChanged(
  fullEvent: EventDocument,
  currentAction: ActionDocument,
  validatorContext: ValidatorContext,
  eventConfiguration: EventConfig
) {
  if (isFirstDeclareOrNotifyAction(currentAction, fullEvent)) {
    return false
  }

  const acceptedActions = getAcceptedActions(fullEvent)

  const reviewFormFields = getReviewFormFields(eventConfiguration)

  const index = acceptedActions.findIndex((a) => a.id === currentAction.id)

  const changedAnnotationFields = reviewFormFields.filter(
    (f) =>
      getAnnotationComparisonForField(
        f,
        acceptedActions,
        index,
        validatorContext
      ).valueHasChanged
  )

  return changedAnnotationFields.length > 0
}

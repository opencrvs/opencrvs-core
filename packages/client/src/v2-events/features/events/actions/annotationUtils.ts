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
  ValidatorContext,
  deepMerge,
  EventConfig,
  ActionDocument
} from '@opencrvs/commons/client'
import { hasFieldChanged } from '@client/v2-events/features/events/useEvents/procedures/actions/declarationDiff'

export function aggregateAnnotations(actions: ActionDocument[]) {
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
  acceptedActions: ActionDocument[],
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

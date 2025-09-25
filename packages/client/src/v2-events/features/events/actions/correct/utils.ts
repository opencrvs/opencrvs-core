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
  UserContext
} from '@opencrvs/commons/client'

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
  context: UserContext
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

export function isLastActionCorrectionRequest(event: EventDocument) {
  const writeActions = event.actions.filter((a) => !isMetaAction(a.type))
  const lastWriteAction = writeActions[writeActions.length - 1]
  return lastWriteAction.type === ActionType.REQUEST_CORRECTION
}

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
import { isEqual } from 'lodash'
import {
  FieldConfig,
  EventState,
  isFieldVisible,
  isMetaAction,
  EventDocument,
  ActionType
} from '@opencrvs/commons/client'

export function hasFieldChanged(
  f: FieldConfig,
  form: EventState,
  previousFormValues: EventState
) {
  const isVisible = isFieldVisible(f, form)
  const valueHasChanged = !isEqual(previousFormValues[f.id], form[f.id])

  return isVisible && valueHasChanged
}

export function isLastActionCorrectionRequest(event: EventDocument) {
  const writeActions = event.actions.filter((a) => !isMetaAction(a.type))
  const lastWriteAction = writeActions[writeActions.length - 1]
  return lastWriteAction.type === ActionType.REQUEST_CORRECTION
}

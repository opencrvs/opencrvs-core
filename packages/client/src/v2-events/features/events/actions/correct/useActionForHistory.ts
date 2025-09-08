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

import { isEqual, take } from 'lodash'
import {
  Action,
  ActionDocument,
  ActionType,
  DeclarationActions,
  DeclarationActionType
} from '@opencrvs/commons/client'

import { getPreviousDeclarationActionType } from '../../components/Action/utils'

/**
 * Indicates that declaration action changed declaration content. Satisfies V1 spec.
 */
const DECLARATION_ACTION_UPDATE = 'UPDATE'

function getPreviousActions(arr: ActionDocument[], id: string) {
  const index = arr.findIndex((item) => item.id === id)
  return index === -1 ? arr : take(arr, index)
}

function hasDeclarationChanged(
  actions: ActionDocument[],
  action: Extract<Action, { type: DeclarationActionType }>
) {
  const previousActions = getPreviousActions(actions, action.id)
  const previousActionType = getPreviousDeclarationActionType(
    previousActions,
    action.type
  )

  const previousDeclarationAction = previousActionType
    ? actions.find((act) => act.type === previousActionType)
    : undefined

  const currentActionHasUpdates = Object.keys(action.declaration).length > 0
  const previousActionHasDeclaration = !!previousDeclarationAction?.declaration

  const hasUpdatedValues = Object.entries(action.declaration).some(
    ([key, value]) => {
      const prevValue = previousDeclarationAction?.declaration[key]

      return !isEqual(prevValue, value)
    }
  )

  return (
    currentActionHasUpdates && previousActionHasDeclaration && hasUpdatedValues
  )
}

export function useActionForHistory() {
  function getActionTypeForHistory(
    actions: ActionDocument[],
    action: ActionDocument
  ) {
    if (action.type === ActionType.REQUEST_CORRECTION) {
      const approveAction = actions.find(
        (x) =>
          x.type === ActionType.APPROVE_CORRECTION &&
          (x.requestId === action.id ||
            x.requestId === action.originalActionId) &&
          x.annotation?.isImmediateCorrection &&
          x.createdBy === action.createdBy
      )
      if (approveAction) {
        return 'CORRECTED'
      }
    }

    const parsedAction = DeclarationActions.safeParse(action.type)
    if (parsedAction.success) {
      if (
        hasDeclarationChanged(actions, { ...action, type: parsedAction.data })
      ) {
        return DECLARATION_ACTION_UPDATE
      }
    }

    return action.type
  }

  return { getActionTypeForHistory }
}

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
import { intersection } from 'lodash'
import { Scope, SCOPES } from '../scopes'
import { ActionType } from './ActionType'
import { EventIndex } from './EventIndex'
import { EventStatus } from './EventMetadata'

/**
 * Actions that can be performed on an event based on its status, independent of the user scopes.
 *
 */
export function getActionsByStatus(event: EventIndex): ActionType[] {
  switch (event.status) {
    case EventStatus.CREATED: {
      return [
        ActionType.READ,
        ActionType.DECLARE,
        ActionType.DELETE,
        ActionType.ASSIGN,
        ActionType.UNASSIGN
      ]
    }

    case EventStatus.NOTIFIED:
    case EventStatus.DECLARED: {
      return [
        ActionType.READ,
        ActionType.VALIDATE,
        ActionType.ASSIGN,
        ActionType.UNASSIGN
      ]
    }
    case EventStatus.VALIDATED: {
      return [
        ActionType.READ,
        ActionType.REGISTER,
        ActionType.ASSIGN,
        ActionType.UNASSIGN
      ]
    }
    case EventStatus.CERTIFIED:
    case EventStatus.REGISTERED: {
      return [
        ActionType.READ,
        ActionType.PRINT_CERTIFICATE,
        ActionType.REQUEST_CORRECTION,
        ActionType.ASSIGN,
        ActionType.UNASSIGN
      ]
    }
    case EventStatus.REJECTED: {
      return [
        ActionType.READ,
        ActionType.DECLARE,
        ActionType.VALIDATE,
        ActionType.ASSIGN,
        ActionType.UNASSIGN
      ]
    }
    case EventStatus.ARCHIVED:
    default:
      return [ActionType.READ]
  }
}

function hasAnyOfScopes(a: Scope[], b: Scope[]) {
  return intersection(a, b).length > 0
}

type RequiresNoScope = null
type NotAvailableAsAction = [] // pseudo actions
type RequiresAnyOfScopes = [Scope, ...Scope[]]
type RequiredScopes =
  | RequiresAnyOfScopes
  | RequiresNoScope
  | NotAvailableAsAction

export function getRequiredScopesForAction(action: ActionType): RequiredScopes {
  switch (action) {
    case ActionType.READ:
    case ActionType.CREATE:
      return [
        SCOPES.RECORD_DECLARE,
        SCOPES.RECORD_READ,
        SCOPES.RECORD_SUBMIT_INCOMPLETE,
        SCOPES.RECORD_SUBMIT_FOR_REVIEW,
        SCOPES.RECORD_REGISTER,
        SCOPES.RECORD_EXPORT_RECORDS
      ]

    case ActionType.NOTIFY:
      return [SCOPES.RECORD_SUBMIT_INCOMPLETE]

    case ActionType.DECLARE:
      return [
        SCOPES.RECORD_DECLARE,
        SCOPES.RECORD_SUBMIT_FOR_APPROVAL,
        SCOPES.RECORD_REGISTER
      ]

    case ActionType.DELETE:
      return [SCOPES.RECORD_DECLARE]

    case ActionType.VALIDATE:
      return [SCOPES.RECORD_SUBMIT_FOR_APPROVAL, SCOPES.RECORD_REGISTER]

    case ActionType.REGISTER:
      return [SCOPES.RECORD_REGISTER]

    case ActionType.PRINT_CERTIFICATE:
      return [SCOPES.RECORD_PRINT_ISSUE_CERTIFIED_COPIES]

    case ActionType.REQUEST_CORRECTION:
      return [SCOPES.RECORD_REGISTRATION_REQUEST_CORRECTION]

    case ActionType.REJECT_CORRECTION:
      return [SCOPES.RECORD_SUBMIT_FOR_UPDATES]

    case ActionType.APPROVE_CORRECTION:
      return [SCOPES.RECORD_REGISTRATION_CORRECT]

    case ActionType.MARKED_AS_DUPLICATE:
    case ActionType.ARCHIVE:
      return [SCOPES.RECORD_DECLARATION_ARCHIVE]

    case ActionType.REJECT:
      return [SCOPES.RECORD_SUBMIT_FOR_UPDATES]

    case ActionType.ASSIGN:
    case ActionType.UNASSIGN:
      return null

    case ActionType.DETECT_DUPLICATE: {
      return [] // pseudo action?
    }
    default: {
      // eslint-disable-next-line no-console
      console.error('Unknown action type:', action)
      return [] // not available
    }
  }
}

export function getAvailableActionsByScopes(
  actions: ActionType[],
  userScopes: Scope[]
): ActionType[] {
  return actions.filter((action) => {
    const requiredScopes = getRequiredScopesForAction(action)

    if (requiredScopes === null) {
      return true
    }

    return hasAnyOfScopes(userScopes, requiredScopes)
  })
}

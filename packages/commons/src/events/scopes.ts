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
import { ConfigurableScopeType, Scope, SCOPES } from '../scopes'
import {
  ClientSpecificAction,
  ActionType,
  DisplayableAction
} from './ActionType'

type RequiresNoScope = null
type NotAvailableAsAction = [] // pseudo actions

type RequiresAnyOfScopes = [Scope, ...Scope[]]
type RequiredScopes =
  | RequiresAnyOfScopes
  | RequiresNoScope
  | NotAvailableAsAction

export const CONFIG_GET_ALLOWED_SCOPES = [
  SCOPES.RECORD_DECLARE,
  SCOPES.RECORD_READ,
  SCOPES.RECORD_SUBMIT_INCOMPLETE,
  SCOPES.RECORD_SUBMIT_FOR_REVIEW,
  SCOPES.RECORD_REGISTER,
  SCOPES.RECORD_EXPORT_RECORDS,
  SCOPES.CONFIG,
  SCOPES.CONFIG_UPDATE_ALL
] satisfies RequiresAnyOfScopes

export const ACTION_ALLOWED_SCOPES = {
  [ActionType.READ]: [
    SCOPES.RECORD_DECLARE,
    SCOPES.RECORD_READ,
    SCOPES.RECORD_SUBMIT_INCOMPLETE,
    SCOPES.RECORD_SUBMIT_FOR_REVIEW,
    SCOPES.RECORD_REGISTER,
    SCOPES.RECORD_EXPORT_RECORDS
  ],
  [ActionType.CREATE]: [
    SCOPES.RECORD_DECLARE,
    SCOPES.RECORD_SUBMIT_INCOMPLETE,
    SCOPES.RECORD_SUBMIT_FOR_REVIEW
  ],
  [ActionType.NOTIFY]: [SCOPES.RECORD_SUBMIT_INCOMPLETE],
  [ActionType.DECLARE]: [
    SCOPES.RECORD_DECLARE,
    SCOPES.RECORD_SUBMIT_FOR_APPROVAL,
    SCOPES.RECORD_REGISTER
  ],
  [ActionType.DELETE]: [SCOPES.RECORD_DECLARE],
  [ActionType.VALIDATE]: [
    SCOPES.RECORD_SUBMIT_FOR_APPROVAL,
    SCOPES.RECORD_REGISTER
  ],
  [ActionType.REGISTER]: [SCOPES.RECORD_REGISTER],
  [ActionType.PRINT_CERTIFICATE]: [SCOPES.RECORD_PRINT_ISSUE_CERTIFIED_COPIES],
  [ActionType.REQUEST_CORRECTION]: [
    SCOPES.RECORD_REGISTRATION_REQUEST_CORRECTION,
    SCOPES.RECORD_REGISTRATION_CORRECT
  ],
  [ClientSpecificAction.REVIEW_CORRECTION_REQUEST]: [
    SCOPES.RECORD_REGISTRATION_CORRECT
  ],
  [ActionType.REJECT_CORRECTION]: [SCOPES.RECORD_REGISTRATION_CORRECT],
  [ActionType.APPROVE_CORRECTION]: [SCOPES.RECORD_REGISTRATION_CORRECT],
  [ActionType.MARK_AS_DUPLICATE]: [SCOPES.RECORD_REVIEW_DUPLICATES],
  [ActionType.MARK_AS_NOT_DUPLICATE]: [SCOPES.RECORD_REVIEW_DUPLICATES],
  [ActionType.ARCHIVE]: [SCOPES.RECORD_DECLARATION_ARCHIVE],
  [ActionType.REJECT]: [SCOPES.RECORD_SUBMIT_FOR_UPDATES],
  [ActionType.ASSIGN]: null,
  [ActionType.UNASSIGN]: null,
  [ActionType.DUPLICATE_DETECTED]: []
} satisfies Record<DisplayableAction, RequiredScopes>

export const ACTION_ALLOWED_CONFIGURABLE_SCOPES = {
  [ActionType.READ]: [],
  [ActionType.CREATE]: ['record.notify'],
  [ActionType.NOTIFY]: ['record.notify'],
  [ActionType.DECLARE]: [],
  [ActionType.DELETE]: [],
  [ActionType.VALIDATE]: [],
  [ActionType.REGISTER]: [],
  [ActionType.PRINT_CERTIFICATE]: [],
  [ActionType.REQUEST_CORRECTION]: [],
  [ActionType.REJECT_CORRECTION]: [],
  [ActionType.APPROVE_CORRECTION]: [],
  [ActionType.MARK_AS_NOT_DUPLICATE]: [],
  [ActionType.MARK_AS_DUPLICATE]: [],
  [ActionType.ARCHIVE]: [],
  [ActionType.REJECT]: [],
  [ActionType.ASSIGN]: [],
  [ActionType.UNASSIGN]: [],
  [ActionType.DUPLICATE_DETECTED]: []
} satisfies Record<ActionType, ConfigurableScopeType[]>

export const WRITE_ACTION_SCOPES = [
  ...ACTION_ALLOWED_SCOPES[ActionType.DECLARE],
  ...ACTION_ALLOWED_SCOPES[ActionType.VALIDATE],
  ...ACTION_ALLOWED_SCOPES[ActionType.REGISTER],
  ...ACTION_ALLOWED_SCOPES[ActionType.PRINT_CERTIFICATE]
]

export function hasAnyOfScopes(a: Scope[], b: Scope[]) {
  return intersection(a, b).length > 0
}

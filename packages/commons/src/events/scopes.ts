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

export const ACTION_ALLOWED_SCOPES = {
  [ActionType.READ]: [
    SCOPES.RECORD_READ,
    // TODO CIHAN: maybe remove submit for review?
    SCOPES.RECORD_SUBMIT_FOR_REVIEW,
    SCOPES.RECORD_REGISTER,
    SCOPES.RECORD_EXPORT_RECORDS
  ],
  [ActionType.CREATE]: [SCOPES.RECORD_SUBMIT_FOR_REVIEW],
  [ActionType.NOTIFY]: [],
  [ActionType.DECLARE]: [SCOPES.RECORD_REGISTER],
  [ActionType.DELETE]: [],
  [ActionType.VALIDATE]: [SCOPES.RECORD_REGISTER],
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
  [ActionType.MARKED_AS_DUPLICATE]: [SCOPES.RECORD_DECLARATION_ARCHIVE],
  [ActionType.ARCHIVE]: [SCOPES.RECORD_DECLARATION_ARCHIVE],
  [ActionType.REJECT]: [SCOPES.RECORD_SUBMIT_FOR_UPDATES],
  [ActionType.ASSIGN]: null,
  [ActionType.UNASSIGN]: null,
  [ActionType.DETECT_DUPLICATE]: []
} satisfies Record<DisplayableAction, RequiredScopes>

// TODO CIHAN: can we merge this with the ACTION_ALLOWED_SCOPES?
// TODO CIHAN: define configurable scopes in a better manner?
export const ACTION_ALLOWED_CONFIGURABLE_SCOPES = {
  [ActionType.READ]: ['record.declare', 'record.notify'],
  [ActionType.CREATE]: ['record.declare', 'record.notify'],
  [ActionType.NOTIFY]: ['record.notify'],
  [ActionType.DECLARE]: ['record.declare', 'record.declared.validate'],
  [ActionType.DELETE]: ['record.declare'],
  [ActionType.VALIDATE]: ['record.declared.validate'],
  [ActionType.REGISTER]: [],
  [ActionType.PRINT_CERTIFICATE]: [],
  [ActionType.REQUEST_CORRECTION]: [],
  [ActionType.REJECT_CORRECTION]: [],
  [ActionType.APPROVE_CORRECTION]: [],
  [ActionType.MARKED_AS_DUPLICATE]: [],
  [ActionType.ARCHIVE]: [],
  [ActionType.REJECT]: [],
  [ActionType.ASSIGN]: [],
  [ActionType.UNASSIGN]: [],
  [ActionType.DETECT_DUPLICATE]: []
} satisfies Record<ActionType, ConfigurableScopeType[]>

export function hasAnyOfScopes(a: Scope[], b: Scope[]) {
  return intersection(a, b).length > 0
}

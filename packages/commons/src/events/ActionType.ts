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

import { z } from 'zod'

/**
 * Actions recognized by the system
 */
export const ActionType = {
  // Pre-declaration actions
  DELETE: 'DELETE',
  CREATE: 'CREATE',
  // Declaration actions
  NOTIFY: 'NOTIFY',
  DECLARE: 'DECLARE',
  VALIDATE: 'VALIDATE',
  REGISTER: 'REGISTER',

  DETECT_DUPLICATE: 'DETECT_DUPLICATE',
  REJECT: 'REJECT', // REJECT_DECLARATION
  MARKED_AS_DUPLICATE: 'MARKED_AS_DUPLICATE', // MARK_AS_DUPLICATE
  ARCHIVE: 'ARCHIVE',
  // Record actions
  PRINT_CERTIFICATE: 'PRINT_CERTIFICATE',
  // ISSUE_CERTIFICATE: 'ISSUE_CERTIFICATE',
  REQUEST_CORRECTION: 'REQUEST_CORRECTION',
  REJECT_CORRECTION: 'REJECT_CORRECTION',
  APPROVE_CORRECTION: 'APPROVE_CORRECTION',

  // General actions
  READ: 'READ',
  ASSIGN: 'ASSIGN',
  UNASSIGN: 'UNASSIGN'
} as const

export const ActionTypes = z.enum([
  'DELETE',
  'CREATE',
  'NOTIFY',
  'DECLARE',
  'VALIDATE',
  'REGISTER',
  'DETECT_DUPLICATE',
  'REJECT',
  'MARKED_AS_DUPLICATE',
  'ARCHIVE',
  'PRINT_CERTIFICATE',
  'REQUEST_CORRECTION',
  'REJECT_CORRECTION',
  'APPROVE_CORRECTION',
  'ISSUE_CERTIFICATE',
  'READ',
  'ASSIGN',
  'UNASSIGN'
])

export const PreDeclarationActions = ActionTypes.extract([
  'DELETE',
  'CREATE',
  'NOTIFY'
])

export const DeclarationActions = ActionTypes.extract([
  'DECLARE',
  'VALIDATE',
  'REGISTER'
])

export type DeclarationAction = z.infer<typeof DeclarationActions>

export const RecordActions = ActionTypes.extract([
  'PRINT_CERTIFICATE',
  'REQUEST_CORRECTION',
  'REJECT_CORRECTION',
  'APPROVE_CORRECTION',
  'ISSUE_CERTIFICATE'
])

export const GeneralActions = ActionTypes.extract([
  'READ',
  'ASSIGN',
  'UNASSIGN'
])

/**
 * Actions that can be attached to an event document
 * even if they are not in event configuration
 */

export const LatentActions = [
  ActionType.ARCHIVE,
  ActionType.REJECT,
  ActionType.NOTIFY
]

export type ActionType = (typeof ActionType)[keyof typeof ActionType]

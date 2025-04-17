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
  NOTIFY: 'NOTIFY',
  // Declaration actions
  DECLARE: 'DECLARE',
  VALIDATE: 'VALIDATE',
  REGISTER: 'REGISTER',
  // Declaration system actions. Non-configurable.
  DETECT_DUPLICATE: 'DETECT_DUPLICATE',
  REJECT: 'REJECT', // REJECT_DECLARATION
  MARKED_AS_DUPLICATE: 'MARKED_AS_DUPLICATE', // MARK_AS_DUPLICATE
  ARCHIVE: 'ARCHIVE',
  // Record actions
  PRINT_CERTIFICATE: 'PRINT_CERTIFICATE',
  REQUEST_CORRECTION: 'REQUEST_CORRECTION',
  REJECT_CORRECTION: 'REJECT_CORRECTION',
  APPROVE_CORRECTION: 'APPROVE_CORRECTION',
  // General actions
  READ: 'READ',
  ASSIGN: 'ASSIGN',
  UNASSIGN: 'UNASSIGN'
} as const
export type ActionType = (typeof ActionType)[keyof typeof ActionType]

export const ConfirmableActions = [
  ActionType.NOTIFY,
  ActionType.DECLARE,
  ActionType.VALIDATE,
  ActionType.REGISTER,
  ActionType.REJECT,
  ActionType.ARCHIVE,
  ActionType.PRINT_CERTIFICATE
] as const

/** Testing building types from enums as an alternative */
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
  'READ',
  'ASSIGN',
  'UNASSIGN'
])

const declarationActionValues = [
  ActionTypes.enum.DECLARE,
  ActionTypes.enum.VALIDATE,
  ActionTypes.enum.REGISTER
] as const

/** Actions which change event data (declaration) before registration / during declaration. */
export const DeclarationActions = ActionTypes.extract(declarationActionValues)
export type DeclarationActionType = z.infer<typeof DeclarationActions>

const declarationUpdateActionValues = [
  ...declarationActionValues,
  ActionTypes.enum.REQUEST_CORRECTION
] as const
/** Actions that can modify declaration data. Request can be corrected after declaring it. */
export const DeclarationUpdateActions = ActionTypes.extract(
  declarationUpdateActionValues
)
export type DeclarationUpdateActionType = z.infer<
  typeof DeclarationUpdateActions
>

/** Actions which update annotation or status of an event. */
export const annotationActions = ActionTypes.exclude(declarationActionValues)
export type AnnotationActionType = z.infer<typeof annotationActions>

export const writeActions = ActionTypes.exclude([
  ActionType.CREATE,
  ActionType.READ
])

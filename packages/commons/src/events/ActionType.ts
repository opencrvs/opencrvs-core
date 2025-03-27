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

/**
 * Actions recognized by the system
 */
export const ActionType = {
  CREATE: 'CREATE',
  ASSIGN: 'ASSIGN',
  UNASSIGN: 'UNASSIGN',
  REGISTER: 'REGISTER',
  VALIDATE: 'VALIDATE',
  REQUEST_CORRECTION: 'REQUEST_CORRECTION',
  REJECT_CORRECTION: 'REJECT_CORRECTION',
  APPROVE_CORRECTION: 'APPROVE_CORRECTION',
  DETECT_DUPLICATE: 'DETECT_DUPLICATE',
  NOTIFY: 'NOTIFY',
  DECLARE: 'DECLARE',
  DELETE: 'DELETE',
  PRINT_CERTIFICATE: 'PRINT_CERTIFICATE',
  CUSTOM: 'CUSTOM',
  REJECT: 'REJECT',
  MARKED_AS_DUPLICATE: 'MARKED_AS_DUPLICATE',
  ARCHIVE: 'ARCHIVE',
  READ: 'READ'
} as const

/**
 * Actions that can be attached to an event document
 * even if they are not in event configuration
 */

export const LatentActions = [ActionType.ARCHIVE, ActionType.REJECT]

export type ActionType = (typeof ActionType)[keyof typeof ActionType]

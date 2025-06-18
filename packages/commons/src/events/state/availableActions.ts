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
import { ActionType } from '../ActionType'
import { EventStatus } from '../EventMetadata'

const AVAILABLE_ACTIONS_BY_STATUS = {
  [EventStatus.enum.CREATED]: [
    ActionType.READ,
    ActionType.DECLARE,
    ActionType.DELETE
  ],
  [EventStatus.enum.NOTIFIED]: [ActionType.READ, ActionType.VALIDATE],
  [EventStatus.enum.DECLARED]: [ActionType.READ, ActionType.VALIDATE],
  [EventStatus.enum.VALIDATED]: [ActionType.READ, ActionType.REGISTER],
  [EventStatus.enum.REJECTED]: [
    ActionType.READ,
    ActionType.DECLARE,
    ActionType.VALIDATE
  ],
  [EventStatus.enum.REGISTERED]: [
    ActionType.READ,
    ActionType.PRINT_CERTIFICATE,
    ActionType.REQUEST_CORRECTION
  ],
  [EventStatus.enum.CERTIFIED]: [
    ActionType.READ,
    ActionType.PRINT_CERTIFICATE,
    ActionType.REQUEST_CORRECTION
  ],
  [EventStatus.enum.ARCHIVED]: [
    ActionType.READ,
    ActionType.ASSIGN,
    ActionType.UNASSIGN
  ]
} satisfies Record<EventStatus, ActionType[]>

export function getAvailableActionsByStatus(status: EventStatus) {
  return AVAILABLE_ACTIONS_BY_STATUS[status]
}

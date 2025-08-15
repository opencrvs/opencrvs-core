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
import { EventIndex } from '../EventIndex'
import { EventStatus, InherentFlags } from '../EventMetadata'

export const AVAILABLE_ACTIONS_BY_EVENT_STATUS = {
  [EventStatus.enum.CREATED]: [
    ActionType.READ,
    ActionType.DECLARE,
    ActionType.NOTIFY,
    ActionType.DELETE
  ],
  [EventStatus.enum.NOTIFIED]: [
    ActionType.READ,
    ActionType.DECLARE,
    ActionType.ARCHIVE,
    ActionType.REJECT
  ],
  [EventStatus.enum.DECLARED]: [
    ActionType.READ,
    ActionType.VALIDATE,
    ActionType.ARCHIVE,
    ActionType.REJECT
  ],
  [EventStatus.enum.VALIDATED]: [
    ActionType.READ,
    ActionType.REGISTER,
    ActionType.ARCHIVE,
    ActionType.REJECT
  ],
  [EventStatus.enum.REGISTERED]: [
    ActionType.READ,
    ActionType.PRINT_CERTIFICATE,
    ActionType.REQUEST_CORRECTION
  ],
  [EventStatus.enum.ARCHIVED]: [
    ActionType.READ,
    ActionType.ASSIGN,
    ActionType.UNASSIGN
  ]
} as const satisfies Record<EventStatus, ActionType[]>

export const getAvailableActionsForEvent = (
  event: EventIndex
): ActionType[] => {
  if (event.flags.includes(InherentFlags.REJECTED)) {
    switch (event.status) {
      case EventStatus.Enum.ARCHIVED:
        return AVAILABLE_ACTIONS_BY_EVENT_STATUS[event.status]
      case EventStatus.Enum.CREATED:
        return AVAILABLE_ACTIONS_BY_EVENT_STATUS[event.status]
      case EventStatus.Enum.NOTIFIED:
        return AVAILABLE_ACTIONS_BY_EVENT_STATUS[EventStatus.Enum.CREATED]
      case EventStatus.Enum.DECLARED:
        return AVAILABLE_ACTIONS_BY_EVENT_STATUS[EventStatus.Enum.NOTIFIED]
      case EventStatus.Enum.VALIDATED:
        return AVAILABLE_ACTIONS_BY_EVENT_STATUS[EventStatus.Enum.NOTIFIED]
      case EventStatus.Enum.REGISTERED:
        return AVAILABLE_ACTIONS_BY_EVENT_STATUS[EventStatus.Enum.VALIDATED]
    }
  }

  return AVAILABLE_ACTIONS_BY_EVENT_STATUS[event.status]
}

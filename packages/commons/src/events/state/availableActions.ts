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
import { ActionType, DisplayableAction, ExclusiveActions } from '../ActionType'
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
    ActionType.REQUEST_CORRECTION,
    ActionType.APPROVE_CORRECTION,
    ActionType.REJECT_CORRECTION,
    ExclusiveActions.REVIEW_CORRECTION_REQUEST
  ],
  [EventStatus.enum.ARCHIVED]: [
    ActionType.READ,
    ActionType.ASSIGN,
    ActionType.UNASSIGN
  ]
} as const satisfies Record<EventStatus, DisplayableAction[]>

export const getAvailableActionsForEvent = (
  event: EventIndex
): DisplayableAction[] => {
  if (event.flags.includes(InherentFlags.POTENTIAL_DUPLICATE)) {
    return [ActionType.READ, ActionType.MARK_AS_DUPLICATE, ActionType.ARCHIVE]
  }

  if (event.flags.includes(InherentFlags.REJECTED)) {
    return [
      ActionType.READ,
      event.status === EventStatus.Enum.VALIDATED
        ? ActionType.VALIDATE
        : ActionType.DECLARE,
      ActionType.ARCHIVE
    ]
  } else if (event.status === EventStatus.enum.NOTIFIED) {
    return [
      ActionType.READ,
      ActionType.VALIDATE,
      ActionType.ARCHIVE,
      ActionType.REJECT
    ]
  }

  return AVAILABLE_ACTIONS_BY_EVENT_STATUS[event.status]
}

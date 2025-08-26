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
import {
  ActionType,
  DisplayableAction,
  ClientSpecificAction
} from '../ActionType'
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
    ClientSpecificAction.REVIEW_CORRECTION_REQUEST
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
  /** Base available actions on previous status if the event is rejected.
   * 1. This is to ensure that the user can still perform actions on the event after rejection.
   * 2. In 1.9 we allow rejecting event in rejected state. No filtering of previous actions needed.
   */
  if (event.flags.includes(InherentFlags.REJECTED)) {
    const createdWithoutDelete = AVAILABLE_ACTIONS_BY_EVENT_STATUS[
      EventStatus.enum.CREATED
    ].filter((action) => action !== ActionType.DELETE)

    const rejectedBeforeValidated = [
      ...createdWithoutDelete,
      ActionType.ARCHIVE
    ]

    switch (event.status) {
      case EventStatus.Enum.ARCHIVED:
        return AVAILABLE_ACTIONS_BY_EVENT_STATUS[event.status]
      case EventStatus.Enum.CREATED:
        return AVAILABLE_ACTIONS_BY_EVENT_STATUS[event.status]
      case EventStatus.Enum.NOTIFIED:
        return rejectedBeforeValidated
      case EventStatus.Enum.DECLARED:
        return rejectedBeforeValidated
      case EventStatus.Enum.VALIDATED:
        return AVAILABLE_ACTIONS_BY_EVENT_STATUS[EventStatus.Enum.DECLARED]
      case EventStatus.Enum.REGISTERED:
        return AVAILABLE_ACTIONS_BY_EVENT_STATUS[EventStatus.Enum.VALIDATED]
    }
  }

  return AVAILABLE_ACTIONS_BY_EVENT_STATUS[event.status]
}

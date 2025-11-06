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
import { EventStatus } from '../EventMetadata'
import { Flag, InherentFlags } from '../Flag'

const AVAILABLE_ACTIONS_BY_EVENT_STATUS = {
  [EventStatus.enum.CREATED]: [
    ActionType.READ,
    ActionType.DECLARE,
    ActionType.NOTIFY,
    ActionType.DELETE
  ],
  [EventStatus.enum.NOTIFIED]: [
    ActionType.READ,
    ActionType.DECLARE,
    ActionType.MARK_AS_DUPLICATE,
    ActionType.ARCHIVE,
    ActionType.REJECT
  ],
  [EventStatus.enum.DECLARED]: [
    ActionType.READ,
    ActionType.VALIDATE,
    ActionType.MARK_AS_DUPLICATE,
    ActionType.ARCHIVE,
    ActionType.REJECT
  ],
  [EventStatus.enum.VALIDATED]: [
    ActionType.READ,
    ActionType.REGISTER,
    ActionType.MARK_AS_DUPLICATE,
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

const ACTION_FILTERS: {
  [K in DisplayableAction]?: (flags: Flag[]) => boolean
} = {
  [ActionType.PRINT_CERTIFICATE]: (flags) =>
    !flags.includes(InherentFlags.CORRECTION_REQUESTED) &&
    !flags.some((flag) => flag.endsWith(':requested')),
  [ActionType.REQUEST_CORRECTION]: (flags) =>
    !flags.includes(InherentFlags.CORRECTION_REQUESTED) &&
    !flags.some((flag) => flag.endsWith(':requested')),
  [ClientSpecificAction.REVIEW_CORRECTION_REQUEST]: (flags) =>
    flags.includes(InherentFlags.CORRECTION_REQUESTED) &&
    !flags.some((flag) => flag.endsWith(':requested')),
  [ActionType.APPROVE_CORRECTION]: (flags) =>
    flags.includes(InherentFlags.CORRECTION_REQUESTED) &&
    !flags.some((flag) => flag.endsWith(':requested')),
  [ActionType.REJECT_CORRECTION]: (flags) =>
    flags.includes(InherentFlags.CORRECTION_REQUESTED) &&
    !flags.some((flag) => flag.endsWith(':requested')),
  [ActionType.MARK_AS_DUPLICATE]: (flags) =>
    flags.includes(InherentFlags.POTENTIAL_DUPLICATE) &&
    !flags.some((flag) => flag.endsWith(':requested')),
  [ActionType.VALIDATE]: (flags) =>
    !flags.includes(InherentFlags.POTENTIAL_DUPLICATE) &&
    !flags.some((flag) => flag.endsWith(':requested')),
  [ActionType.REGISTER]: (flags) =>
    !flags.includes(InherentFlags.POTENTIAL_DUPLICATE) &&
    !flags.some((flag) => flag.endsWith(':requested')),
  [ActionType.REJECT]: (flags) =>
    !flags.includes(InherentFlags.REJECTED) &&
    !flags.some((flag) => flag.endsWith(':requested')),
  [ActionType.ARCHIVE]: (flags) =>
    !flags.some((flag) => flag.endsWith(':requested'))
}

/**
 * Filters actions based on flags
 * Some actions can be performed only if certain flags are
 * present and others only if certain flags are absent
 */
function filterActionsByFlags(
  actions: DisplayableAction[],
  flags: Flag[]
): DisplayableAction[] {
  return actions.filter((action) => ACTION_FILTERS[action]?.(flags) ?? true)
}

/**
 * Bases available actions on previous status without the REJECTED flag if the current flags contain REJECTED.
 * 1. This is to ensure that the user can still perform actions on the event after rejection.
 * 2. In 1.9 we allow rejecting event in rejected state. No filtering of previous actions needed.
 * (NOTIFIED & DECLARED) + REJECTED are an exception to this as we want to allow all the
 * actions available to CREATED minus DELETE plus ARCHIVE
 */
function getAvailableActionsWithoutFlagFilters(
  status: EventStatus,
  flags: Flag[]
): DisplayableAction[] {
  switch (status) {
    case EventStatus.Enum.CREATED: {
      return AVAILABLE_ACTIONS_BY_EVENT_STATUS[status]
    }
    case EventStatus.Enum.NOTIFIED: {
      if (flags.includes(InherentFlags.REJECTED)) {
        return getAvailableActionsWithoutFlagFilters(
          EventStatus.Enum.CREATED,
          flags.filter((flag) => flag !== InherentFlags.REJECTED)
        )
          .filter((action) => action !== ActionType.DELETE)
          .concat(ActionType.ARCHIVE)
      }
      return AVAILABLE_ACTIONS_BY_EVENT_STATUS[status]
    }
    case EventStatus.Enum.DECLARED: {
      if (flags.includes(InherentFlags.REJECTED)) {
        return getAvailableActionsWithoutFlagFilters(
          EventStatus.Enum.CREATED,
          flags.filter((flag) => flag !== InherentFlags.REJECTED)
        )
          .filter((action) => action !== ActionType.DELETE)
          .concat(ActionType.ARCHIVE)
      }
      return AVAILABLE_ACTIONS_BY_EVENT_STATUS[status]
    }
    case EventStatus.Enum.VALIDATED: {
      if (flags.includes(InherentFlags.REJECTED)) {
        return getAvailableActionsWithoutFlagFilters(
          EventStatus.Enum.DECLARED,
          flags.filter((flag) => flag !== InherentFlags.REJECTED)
        )
      }
      return AVAILABLE_ACTIONS_BY_EVENT_STATUS[status]
    }
    case EventStatus.Enum.REGISTERED: {
      return AVAILABLE_ACTIONS_BY_EVENT_STATUS[status]
    }
    case EventStatus.Enum.ARCHIVED: {
      return AVAILABLE_ACTIONS_BY_EVENT_STATUS[status]
    }
  }
}

export function getAvailableActions(
  status: EventStatus,
  flags: Flag[]
): DisplayableAction[] {
  return filterActionsByFlags(
    getAvailableActionsWithoutFlagFilters(status, flags),
    flags
  )
}

export function getAvailableActionsForEvent(
  event: EventIndex
): DisplayableAction[] {
  return filterActionsByFlags(
    getAvailableActionsWithoutFlagFilters(event.status, event.flags),
    event.flags
  )
}

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
import React from 'react'
import { v4 as uuid } from 'uuid'
import {
  ActionType,
  EventDocument,
  getActionFormFields,
  getActionConfig,
  isValidIcon
} from '@opencrvs/commons/client'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import {
  actionIcons,
  actionLabels
} from '@client/v2-events/features/workqueues/Actions/utils'
import { ActionMenuItem } from '../ActionMenuDropdown'
import { ReviewPageActionMenu, ReviewPageState } from '../ReviewPageActionMenu'

/**
 * Notify actions contain actions available on the review page of the notify flow. This can include:
 *   - Notify
 *   - Save and exit
 *   - Delete draft
 */
function getNotificationActions(
  event: EventDocument,
  events: ReturnType<typeof useEvents>,
  {
    eventConfiguration,
    declaration,
    annotation,
    hasValidationErrors,
    isActionAllowed,
    availableActions,
    confirmAction
  }: ReviewPageState
): ActionMenuItem[] {
  const declareActionConfig = getActionConfig({
    eventConfiguration,
    actionType: ActionType.DECLARE
  })

  const notifyActionConfig = getActionConfig({
    eventConfiguration,
    actionType: ActionType.NOTIFY
  })

  const dialogCopy =
    declareActionConfig && 'dialogCopy' in declareActionConfig
      ? declareActionConfig.dialogCopy
      : null

  const canNotify =
    availableActions.includes(ActionType.NOTIFY) &&
    isActionAllowed(ActionType.NOTIFY)

  const notifyAction = {
    icon: isValidIcon(notifyActionConfig?.icon)
      ? notifyActionConfig.icon
      : actionIcons[ActionType.DECLARE],
    label: actionLabels[ActionType.NOTIFY],
    onClick: async () =>
      confirmAction({
        confirmLabel: actionLabels[ActionType.NOTIFY],
        supportingCopy:
          notifyActionConfig?.supportingCopy ?? dialogCopy?.notify,
        fields: getActionFormFields(eventConfiguration, ActionType.NOTIFY),
        title: {
          id: 'review.notify.confirmModal.title',
          defaultMessage: 'Notify the {event}?',
          description: 'The title for review action modal when notifying'
        },
        onConfirm: (values) =>
          events.actions.notify.mutate({
            eventId: event.id,
            declaration,
            annotation: { ...annotation, ...values },
            transactionId: uuid()
          })
      }),
    disabled: hasValidationErrors
  }

  return canNotify ? [notifyAction] : []
}

/**
 * Menu component available on the notify review page.
 * We have tried to contain all logic to which actions are available in the notify in this component.
 * */
export function NotifyActionMenu({ event }: { event: EventDocument }) {
  const events = useEvents()

  return (
    <ReviewPageActionMenu
      actionType={ActionType.NOTIFY}
      event={event}
      getActions={(state) => getNotificationActions(event, events, state)}
    />
  )
}

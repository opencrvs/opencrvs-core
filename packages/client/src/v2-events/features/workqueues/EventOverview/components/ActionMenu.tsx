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

import React, { useMemo } from 'react'
import { useIntl } from 'react-intl'
import { useTypedSearchParams } from 'react-router-typesafe-routes/dom'
import { Icon } from '@opencrvs/components/lib/Icon'
import { CaretDown } from '@opencrvs/components/lib/Icon/all-icons'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { DropdownMenu } from '@opencrvs/components/lib/Dropdown'
import {
  EventConfig,
  getOrThrow,
  ActionType,
  ClientSpecificAction
} from '@opencrvs/commons/client'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { messages } from '@client/i18n/messages/views/action'
import { useAuthentication } from '@client/utils/userUtils'
import { useUsers } from '@client/v2-events/hooks/useUsers'
import { getUsersFullName } from '@client/v2-events/utils'
import { useLocations } from '@client/v2-events/hooks/useLocations'
import { ROUTES } from '@client/v2-events/routes'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import {
  ActionMenuItem,
  useAllowedActionConfigurations
} from './useAllowedActionConfigurations'

/** This is the default order of actions if no actionOrder is defined in event configuration. */
const DEFAULT_ACTION_ORDER = [
  ActionType.ASSIGN,
  ActionType.REGISTER,
  ActionType.DECLARE,
  ActionType.EDIT,
  ActionType.REJECT,
  ActionType.ARCHIVE,
  ActionType.DELETE,
  ActionType.MARK_AS_DUPLICATE,
  ActionType.PRINT_CERTIFICATE,
  ActionType.REQUEST_CORRECTION,
  ClientSpecificAction.REVIEW_CORRECTION_REQUEST,
  ActionType.CUSTOM,
  ActionType.UNASSIGN
]

export function sortActions(
  actionMenuItems: ActionMenuItem[],
  eventConfiguration: EventConfig
) {
  const sortedByDefault = actionMenuItems.sort(
    (a, b) =>
      DEFAULT_ACTION_ORDER.indexOf(a.type) -
      DEFAULT_ACTION_ORDER.indexOf(b.type)
  )

  const actionOrder = eventConfiguration.actionOrder

  if (!actionOrder) {
    return sortedByDefault
  }

  return sortedByDefault.sort((a, b) => {
    const aIndex =
      'customActionType' in a && a.customActionType
        ? actionOrder.indexOf(a.customActionType)
        : actionOrder.indexOf(a.type)

    const bIndex =
      'customActionType' in b && b.customActionType
        ? actionOrder.indexOf(b.customActionType)
        : actionOrder.indexOf(b.type)

    return aIndex - bIndex
  })
}

export function ActionMenu({
  eventId,
  onAction
}: {
  eventId: string
  onAction?: () => void
}) {
  const intl = useIntl()
  const [{ workqueue }] = useTypedSearchParams(ROUTES.V2.EVENTS.EVENT)
  const { getUser } = useUsers()
  const { getLocations } = useLocations()
  const locations = getLocations.useSuspenseQuery()
  const { searchEventById } = useEvents()

  const maybeAuth = useAuthentication()
  const auth = getOrThrow(
    maybeAuth,
    'Authentication is not available but is required'
  )

  const getEventQuery = searchEventById.useSuspenseQuery(eventId)

  const eventResults = getEventQuery

  if (eventResults.total === 0) {
    throw new Error(`Event ${eventId} not found`)
  }
  const eventState = eventResults.results[0]

  const assignedToUser = getUser.useQuery(eventState.assignedTo || '', {
    enabled: !!eventState.assignedTo
  }).data
  const assignedUserFullName = assignedToUser
    ? getUsersFullName(assignedToUser.name, intl.locale)
    : ''
  const assignedOffice = assignedToUser?.primaryOfficeId
  const assignedOfficeName =
    (assignedOffice && locations.get(assignedOffice)?.name) || ''

  const [modals, actionMenuItems] = useAllowedActionConfigurations(
    eventState,
    auth
  )

  const { eventConfiguration } = useEventConfiguration(eventState.type)

  const assignedToOther =
    eventState.assignedTo && eventState.assignedTo !== auth.sub

  function ActionMenuItems() {
    const sortedActions = sortActions(actionMenuItems, eventConfiguration)
    if (sortedActions.length === 0) {
      return (
        <DropdownMenu.Label>
          <i>{intl.formatMessage(messages.noActionsAvailable)}</i>
        </DropdownMenu.Label>
      )
    }

    return sortedActions.map((action) => {
      return (
        <DropdownMenu.Item
          key={
            'customActionType' in action ? action.customActionType : action.type
          }
          disabled={'disabled' in action ? action.disabled : false}
          onClick={async () => {
            await action.onClick(workqueue)
            onAction?.()
          }}
        >
          <Icon color="currentColor" name={action.icon} size="small" />
          {intl.formatMessage(action.label)}
        </DropdownMenu.Item>
      )
    })
  }

  return (
    <>
      <DropdownMenu id="action">
        <DropdownMenu.Trigger asChild>
          <PrimaryButton
            data-testid="action-dropdownMenu"
            icon={() => <CaretDown />}
            size="medium"
          >
            {intl.formatMessage(messages.action)}
          </PrimaryButton>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          {assignedToOther && (
            <>
              <DropdownMenu.Label>
                {intl.formatMessage(messages.assignedTo, {
                  name: assignedUserFullName,
                  officeName: assignedOfficeName
                })}
              </DropdownMenu.Label>
              <DropdownMenu.Separator />
            </>
          )}
          <ActionMenuItems />
        </DropdownMenu.Content>
      </DropdownMenu>
      {modals}
    </>
  )
}

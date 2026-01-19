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
import { useIntl } from 'react-intl'
import { useTypedSearchParams } from 'react-router-typesafe-routes/dom'
import { Icon } from '@opencrvs/components/lib/Icon'
import { Button } from '@opencrvs/components/lib/Button'
import { DropdownMenu } from '@opencrvs/components/lib/Dropdown'
import { getOrThrow } from '@opencrvs/commons/client'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { messages } from '@client/i18n/messages/views/action'
import { useAuthentication } from '@client/utils/userUtils'
import { useUsers } from '@client/v2-events/hooks/useUsers'
import { getUsersFullName } from '@client/v2-events/utils'
import { useLocations } from '@client/v2-events/hooks/useLocations'
import { ROUTES } from '@client/v2-events/routes'
import { useAllowedActionConfigurations } from './useAllowedActionConfigurations'

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

  const assignedToOther =
    eventState.assignedTo && eventState.assignedTo !== auth.sub

  return (
    <>
      <DropdownMenu id="action">
        <DropdownMenu.Trigger>
          <Button data-testid="action-dropdownMenu" size="small" type="action">
            {intl.formatMessage(messages.action)}
            <Icon name="CaretDown" size="small" />
          </Button>
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
          {!actionMenuItems.length && (
            <DropdownMenu.Label>
              <i>{intl.formatMessage(messages.noActionsAvailable)}</i>
            </DropdownMenu.Label>
          )}
          {actionMenuItems.map((action) => {
            return (
              <DropdownMenu.Item
                key={action.type}
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
          })}
        </DropdownMenu.Content>
      </DropdownMenu>
      {modals}
    </>
  )
}

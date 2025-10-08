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

import { Icon } from '@opencrvs/components/lib/Icon'
import { CaretDown } from '@opencrvs/components/lib/Icon/all-icons'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { DropdownMenu } from '@opencrvs/components/lib/Dropdown'
import { getOrThrow } from '@opencrvs/commons/client'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { messages } from '@client/i18n/messages/views/action'
import { useAuthentication } from '@client/utils/userUtils'
import { useUsers } from '@client/v2-events/hooks/useUsers'
import { getUsersFullName } from '@client/v2-events/utils'
import { useLocations } from '@client/v2-events/hooks/useLocations'
import { useAllowedActionConfigurations } from './useAllowedActionConfigurations'

export function ActionMenu({
  eventId,
  onAction
}: {
  eventId: string
  onAction?: () => void
}) {
  const intl = useIntl()

  const { getUser } = useUsers()
  const { getLocations } = useLocations()
  const [locations] = getLocations.useSuspenseQuery()
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
  const assignedOffice = assignedToUser?.primaryOfficeId || ''
  const assignedOfficeName =
    locations.find((l) => l.id === assignedOffice)?.name || ''

  const [modal, actionMenuItems] = useAllowedActionConfigurations(
    eventState,
    auth
  )

  const assignedToOther =
    eventState.assignedTo && eventState.assignedTo !== auth.sub

  return (
    <>
      <DropdownMenu id="action">
        <DropdownMenu.Trigger asChild>
          <PrimaryButton
            data-testid="action-dropdownMenu"
            icon={() => <CaretDown />}
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
          {actionMenuItems.map((action) => {
            return (
              <DropdownMenu.Item
                key={action.type}
                disabled={'disabled' in action ? action.disabled : false}
                onClick={async () => {
                  await action.onClick()
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
      {modal}
    </>
  )
}

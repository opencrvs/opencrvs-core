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
import { DropdownMenu } from '@opencrvs/components/lib/Dropdown'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { CaretDown } from '@opencrvs/components/lib/Icon/all-icons'
import { useIntl } from 'react-intl'

import { messages } from '@client/i18n/messages/views/action'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@client/v2-events/routes'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { validate } from '@opencrvs/commons/client'
import { type ActionConfig } from '@opencrvs/commons'
import { useAuthentication } from '@client/utils/userUtils'

export const ActionMenu = ({ eventId }: { eventId: string }) => {
  const intl = useIntl()
  const events = useEvents()
  const navigate = useNavigate()
  const authentication = useAuthentication()
  const [event] = events.getEvent(eventId)

  const { eventConfiguration: configuration } = useEventConfiguration(
    event.type
  )

  const isActionVisible = (action: ActionConfig) => {
    if (!action?.allowedWhen) {
      return true
    }
    const params = {
      $event: event,
      $user: authentication,
      $now: new Date().toISOString().split('T')[0]
    }

    return validate(action.allowedWhen, params)
  }

  return (
    <>
      <DropdownMenu id="action">
        <DropdownMenu.Trigger>
          <PrimaryButton icon={() => <CaretDown />}>
            {intl.formatMessage(messages.action)}
          </PrimaryButton>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          {configuration?.actions.filter(isActionVisible).map((action) => (
            <DropdownMenu.Item
              key={action.type}
              onClick={() => {
                if (action.type === 'CREATE' || action.type === 'CUSTOM') {
                  alert(`Action ${action.type} is not implemented yet.`)
                  return
                }

                navigate(ROUTES.V2.EVENTS[action.type].buildPath({ eventId }))
              }}
            >
              {intl.formatMessage(action.label)}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu>
    </>
  )
}

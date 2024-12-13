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
import { Icon } from '@opencrvs/components'
import { useIntl } from 'react-intl'

import { messages } from '@client/i18n/messages/views/action'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@client/v2-events/routes'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { validate } from '@opencrvs/commons/client'

export const ActionMenu = ({ eventId }: { eventId: string }) => {
  const intl = useIntl()
  const events = useEvents()
  const [event] = events.getEvent(eventId)

  const { eventConfiguration: configuration } = useEventConfiguration(
    event.type
  )

  const registerActionConfiguration = configuration?.actions.find(
    (action) => action.type === 'REGISTER'
  )

  const registerActionShouldBeVisible =
    !registerActionConfiguration?.allowedWhen
      ? true
      : validate(registerActionConfiguration.allowedWhen, {
          $event: event
        })

  return (
    <>
      <DropdownMenu id="action">
        <DropdownMenu.Trigger>
          <PrimaryButton icon={() => <CaretDown />}>
            {intl.formatMessage(messages.action)}
          </PrimaryButton>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          {registerActionShouldBeVisible && (
            <RegisterAction eventId={eventId} />
          )}
        </DropdownMenu.Content>
      </DropdownMenu>
    </>
  )
}

const RegisterAction = ({ eventId }: { eventId: string }) => {
  const navigate = useNavigate()

  return (
    <DropdownMenu.Item
      onClick={() => {
        navigate(ROUTES.V2.EVENTS.REGISTER.EVENT.buildPath({ eventId }))
      }}
    >
      <Icon name="CheckSquare" color="currentColor" size="large" />
      Register
    </DropdownMenu.Item>
  )
}

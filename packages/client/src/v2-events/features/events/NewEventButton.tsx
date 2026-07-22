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
import { defineMessages, useIntl } from 'react-intl'
import { Button, DropdownMenu } from '@opencrvs/components'
import { FloatingActionButton } from '@opencrvs/components/lib/buttons'
import { PlusTransparentWhite } from '@opencrvs/components/lib/icons'
import { Plus } from '@opencrvs/components/src/icons'
import { useCreatableEventConfigurations } from './useEventConfiguration'
import { useCreateEvent } from './useCreateEvent'

const messages = defineMessages({
  menuHeader: {
    id: 'v2.events.newEvent.menuHeader',
    defaultMessage: 'Declare an event',
    description: 'Header label shown at the top of the New event dropdown menu'
  },
  buttonLabel: {
    id: 'v2.events.newEvent.buttonLabel',
    defaultMessage: 'New event',
    description: 'Accessible label for the icon-only New event button'
  }
})

type NewEventButtonVariant = 'header' | 'fab'

/**
 * The "New event" control shown in the workqueue header (desktop) and as the
 * floating action button (mobile).
 *
 * - When the user may create more than one event type, it opens a `DropdownMenu`
 *   of those types; selecting one creates the event and navigates to its
 *   declaration form.
 * - When the user may create exactly one type, it creates that event directly
 *   without opening a menu.
 * - When the user may not create any event, it renders nothing.
 */
export function NewEventButton({ variant }: { variant: NewEventButtonVariant }) {
  const intl = useIntl()
  const createEvent = useCreateEvent()
  const eventConfigurations = useCreatableEventConfigurations()

  if (eventConfigurations.length === 0) {
    return null
  }

  const label = intl.formatMessage(messages.buttonLabel)

  const trigger: React.ReactElement =
    variant === 'fab' ? (
      <FloatingActionButton
        aria-label={label}
        icon={() => <PlusTransparentWhite />}
        id="new_event_declaration"
      />
    ) : (
      <Button aria-label={label} id="header-new-event" type="iconPrimary">
        <Plus />
      </Button>
    )

  // A single creatable type needs no menu — create it straight away.
  if (eventConfigurations.length === 1) {
    return React.cloneElement(trigger, {
      onClick: () => createEvent(eventConfigurations[0].id)
    })
  }

  return (
    <DropdownMenu id="new-event">
      <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
      <DropdownMenu.Content
        position={variant === 'fab' ? 'top span-left' : 'bottom span-right'}
      >
        <DropdownMenu.Label>
          {intl.formatMessage(messages.menuHeader)}
        </DropdownMenu.Label>
        <DropdownMenu.Separator />
        {eventConfigurations.map((eventConfiguration) => (
          <DropdownMenu.Item
            key={eventConfiguration.id}
            onClick={() => createEvent(eventConfiguration.id)}
          >
            {intl.formatMessage(eventConfiguration.label)}
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu>
  )
}

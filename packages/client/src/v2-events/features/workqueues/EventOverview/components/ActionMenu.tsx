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
import { useSelector } from 'react-redux'
import { getCurrentEventStateWithDrafts } from '@opencrvs/commons/client'
import { CaretDown } from '@opencrvs/components/lib/Icon/all-icons'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { DropdownMenu } from '@opencrvs/components/lib/Dropdown'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { messages } from '@client/i18n/messages/views/action'
import { useDrafts } from '@client/v2-events/features/drafts/useDrafts'
import { getScope } from '@client/profile/profileSelectors'
import { useGetActionMenuItems } from './utils'

export function ActionMenu({ eventId }: { eventId: string }) {
  const intl = useIntl()
  const events = useEvents()

  const scopes = useSelector(getScope)

  const [event] = events.getEvent.useSuspenseQuery(eventId)

  const { getRemoteDrafts } = useDrafts()
  const drafts = getRemoteDrafts()
  const eventStateWithDrafts = useMemo(
    () => getCurrentEventStateWithDrafts(event, drafts),
    [drafts, event]
  )

  const actionMenuItems = useGetActionMenuItems({
    event: eventStateWithDrafts,
    scopes: scopes ?? []
  })

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
          {actionMenuItems.map((action) => {
            return (
              <DropdownMenu.Item
                key={action.type}
                onClick={() => action.onClick(event.id)}
              >
                {intl.formatMessage(action.label)}
              </DropdownMenu.Item>
            )
          })}
        </DropdownMenu.Content>
      </DropdownMenu>
    </>
  )
}

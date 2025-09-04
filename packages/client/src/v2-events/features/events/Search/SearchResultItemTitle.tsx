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
import { useTheme } from 'styled-components'
import { EventIndex } from '@opencrvs/commons/client'
import { useWindowSize } from '@opencrvs/components/src/hooks'
import { Link as TextButton } from '@opencrvs/components'
import { IconWithName } from '@client/v2-events/components/IconWithName'
import { IconWithNameEvent } from '@client/v2-events/components/IconWithNameEvent'

export function SearchResultItemTitle({
  event,
  isInOutbox,
  isInDrafts,
  status,
  onClick,
  type
}: {
  event: EventIndex & {
    title: string | null
    useFallbackTitle: boolean
    meta?: Record<string, unknown>
  }
  type: string
  isInOutbox?: boolean
  isInDrafts?: boolean
  status: React.ComponentProps<typeof IconWithName>['status']
  onClick: () => void
}) {
  const theme = useTheme()
  const { width } = useWindowSize()
  const isWideScreen = width > theme.grid.breakpoints.lg
  const renderIconWithName = () =>
    isWideScreen ? (
      <IconWithName flags={event.flags} name={event.title} status={status} />
    ) : (
      <IconWithNameEvent
        event={type}
        flags={event.flags}
        name={event.title}
        status={status}
      />
    )

  if (isInOutbox && !isInDrafts) {
    return renderIconWithName()
  }

  return (
    <TextButton
      color={event.useFallbackTitle ? 'red' : 'primary'}
      onClick={onClick}
    >
      {renderIconWithName()}
    </TextButton>
  )
}

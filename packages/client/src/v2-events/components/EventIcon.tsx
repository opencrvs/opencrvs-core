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

import * as React from 'react'
import {
  EventConfig,
  EventIndex,
  resolveEventIcon
} from '@opencrvs/commons/client'
import { useValidatorContext } from '@client/v2-events/hooks/useValidatorContext'
import { IconWithName } from './IconWithName'
import { IconWithNameEvent } from './IconWithNameEvent'

/**
 * Resolves and renders the icon for an event (from `EventConfig.icon`,
 * falling back to the default status/flag-based icon) alongside its name.
 */
export function EventIcon({
  eventConfig,
  event,
  name,
  displayEventType = false,
  isArchived,
  isValidatedOnReview
}: {
  eventConfig: EventConfig
  event: EventIndex
  name: React.ReactNode
  /** Renders the event type label underneath the name (`IconWithNameEvent`) instead of the plain `IconWithName`. */
  displayEventType?: boolean
  isArchived?: boolean
  isValidatedOnReview?: boolean
}) {
  const validatorContext = useValidatorContext()
  const iconName = resolveEventIcon(eventConfig.icon, event, validatorContext)

  if (displayEventType) {
    return (
      <IconWithNameEvent
        event={event.type}
        flags={event.flags}
        iconName={iconName}
        isArchived={isArchived}
        isValidatedOnReview={isValidatedOnReview}
        name={name}
        status={event.status}
      />
    )
  }

  return (
    <IconWithName
      flags={event.flags}
      iconName={iconName}
      isArchived={isArchived}
      isValidatedOnReview={isValidatedOnReview}
      name={name}
      status={event.status}
    />
  )
}

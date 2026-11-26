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
  AvailableIcons,
  buildClientFunctionContext,
  EventConfig,
  EventIndex,
  JSONSchema,
  validate,
  ValidatorContext
} from '@opencrvs/commons/client'
import { useValidatorContext } from '@client/v2-events/hooks/useValidatorContext'
import { IconWithName } from './IconWithName'
import { IconWithNameEvent } from './IconWithNameEvent'

/**
 * Given an EventConfig's `icon` map (icon name -> conditional) and a real
 * event, returns the name of the first icon (in definition order) whose
 * conditional matches, or `undefined` if there's no icon config or nothing
 * matches — callers should fall back to a default icon in that case.
 */
function resolveEventIcon(
  iconConfig: EventConfig['icon'],
  event: EventIndex,
  context: ValidatorContext
): AvailableIcons | undefined {
  if (!iconConfig) {
    return undefined
  }

  const clientFunctionContext = {
    ...buildClientFunctionContext({
      form: { ...context.baseFormState, ...event.declaration },
      validatorContext: context
    }),
    $flags: event.flags,
    $status: event.status
  }

  const match = Object.entries(iconConfig).find(([, conditional]) =>
    validate(conditional as JSONSchema, clientFunctionContext)
  )

  return match?.[0] as AvailableIcons | undefined
}

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

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
import { EventIndex } from '@opencrvs/commons/client'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { useIntlFormatMessageWithFlattenedParams } from '@client/v2-events/messages/utils'
import { flattenEventIndex } from '@client/v2-events/utils'

export function useEventTitle(eventType: string, eventIndex: EventIndex) {
  const { eventConfiguration } = useEventConfiguration(eventType)
  const intl = useIntlFormatMessageWithFlattenedParams()

  const formattedTitle = intl.formatMessage(
    eventConfiguration.title,
    flattenEventIndex(eventIndex)
  )

  const fallbackTitle = eventConfiguration.fallbackTitle
    ? intl.formatMessage(eventConfiguration.fallbackTitle)
    : null

  const useFallbackTitle = formattedTitle.trim() === ''
  return {
    useFallbackTitle,
    title: useFallbackTitle ? fallbackTitle : formattedTitle
  }
}

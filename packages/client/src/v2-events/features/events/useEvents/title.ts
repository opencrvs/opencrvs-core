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

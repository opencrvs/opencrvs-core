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

import { useEffect, useState } from 'react'
import { EventIndex, getCurrentEventState } from '@opencrvs/commons/client'
import { queryClient, useTRPC } from '@client/v2-events/trpc'
import { useEventConfigurations } from '../useEventConfiguration'

const mutationCache = queryClient.getMutationCache()

export function useOutbox() {
  const [outbox, setOutbox] = useState<EventIndex[]>([])

  const trpc = useTRPC()
  const eventConfigurations = useEventConfigurations()

  useEffect(() => {
    const getOutboxEvents = () => {
      const pendingMutation = mutationCache
        .getAll()
        .filter((mutation) => mutation.state.status !== 'success')

      const outboxEvents = pendingMutation
        .map((mutation) => {
          const variables = mutation.state.variables
          if (
            variables &&
            typeof variables === 'object' &&
            'eventId' in variables
          ) {
            const { eventId, declaration } = variables as {
              eventId: string
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              declaration: Record<string, any> | undefined | null
            }

            const event = queryClient.getQueryData(
              trpc.event.get.queryKey(eventId)
            )

            if (!event) {
              return event
            }

            const eventConfiguration = eventConfigurations.find(
              (config) => config.id === event.type
            )
            if (!eventConfiguration) {
              return null
            }

            const eventState = getCurrentEventState(event, eventConfiguration)
            if (declaration) {
              return {
                ...eventState,
                declaration: { ...eventState.declaration, ...declaration },
                workqueueMeta: mutation.options.meta
              }
            }
            return eventState
          }
          return null
        })
        .filter((event) => event !== null && event !== undefined)

      setOutbox(outboxEvents)
    }

    getOutboxEvents()
    const unsubscribe = mutationCache.subscribe(() => {
      getOutboxEvents()
    })

    return unsubscribe
  }, [eventConfigurations, trpc.event.get])

  return outbox
}

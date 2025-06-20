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

import { useMutationState } from '@tanstack/react-query'
import { getCurrentEventState } from '@opencrvs/commons/client'
import { queryClient, useTRPC } from '@client/v2-events/trpc'
import { useEventConfigurations } from '../useEventConfiguration'

const mutationCache = queryClient.getMutationCache()

export function useOutbox() {
  const trpc = useTRPC()
  const eventConfigurations = useEventConfigurations()

  const pendingMutations = useMutationState({
    filters: { predicate: (mutation) => mutation.state.status !== 'success' },
    select: (mutation) => mutation
  })

  const outboxEvents = pendingMutations
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

        const event = queryClient.getQueryData(trpc.event.get.queryKey(eventId))

        if (!event) {
          return null
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
            meta: mutation.options.meta
          }
        }
        return eventState
      }
      return null
    })
    .filter((event) => event !== null)

  return outboxEvents
}

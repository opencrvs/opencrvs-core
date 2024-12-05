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

import { storage } from '@client/storage'
import { api, utils } from '@client/v2-events/trpc'
import { EventDocument } from '@events/schema'
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

export function preloadData() {
  utils.config.get.ensureData()
}

utils.event.create.setMutationDefaults(({ canonicalMutationFn }) => ({
  mutationFn: canonicalMutationFn
}))

async function readEventsFromStorage(): Promise<EventDocument[]> {
  const data = await storage
    .getItem('events')
    .then((e) => (e ? JSON.parse(e) : []))

  return data
}

function writeEventToStorage(events: EventDocument[]) {
  return storage.setItem('events', JSON.stringify(events))
}

const EMPTY_ID = '__EMPTY__'

export function useEvents() {
  const queryClient = useQueryClient()

  const createEvent = () => {
    return api.event.create.useMutation({
      retry: 1,
      onMutate: async (newEvent) => {
        const optimisticEvent = {
          id: EMPTY_ID,
          type: newEvent.type,
          transactionId: newEvent.transactionId,
          createdAt: new Date(),
          updatedAt: new Date(),
          actions: []
        }
        // Do this as very first synchronous operation so UI can trust
        // that the event is created when changing view for instance
        queryClient.setQueryData(
          ['persisted-events'],
          (old: EventDocument[]) => [...old, optimisticEvent]
        )
        await queryClient.cancelQueries({ queryKey: ['persisted-events'] })
        const events = await readEventsFromStorage()
        await writeEventToStorage([...events, optimisticEvent])
        return optimisticEvent
      },
      onSettled: async (response, error, parameteres, context) => {
        if (response) {
          await queryClient.cancelQueries({ queryKey: ['persisted-events'] })
          const events = await readEventsFromStorage()
          const eventsWithoutNew = events.filter(
            (e) => e.transactionId !== response.transactionId
          )

          await writeEventToStorage([...eventsWithoutNew, response])
          queryClient.invalidateQueries({ queryKey: ['persisted-events'] })
        }
      },
      onSuccess: (data) => {
        queryClient.setQueryData(['persisted-events'], (old: EventDocument[]) =>
          old.filter((e) => e.transactionId !== data.transactionId).concat(data)
        )
      }
    })
  }

  const events = useSuspenseQuery({
    queryKey: ['persisted-events'],
    queryFn: () => {
      return readEventsFromStorage()
    }
  })

  return {
    createEvent,
    useStoredEvents: () =>
      useSuspenseQuery({
        queryKey: ['persisted-events'],
        queryFn: () => {
          return storage.getItem('events').then((e) => (e ? JSON.parse(e) : []))
        }
      }),
    events,
    getEvent: (id: string) => {
      return (
        events.data.find((e) => e.id === id) ||
        events.data.find((e) => e.transactionId === id)
      )
    },
    actions: {
      declare: api.event.actions.declare
    }
  }
}

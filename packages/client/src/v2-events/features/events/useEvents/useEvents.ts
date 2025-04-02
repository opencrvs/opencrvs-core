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

import { useQuery, useSuspenseQuery } from '@tanstack/react-query'

import { useTRPC } from '@client/v2-events/trpc'
import { useGetEvent, useGetEventState } from './procedures/get'
import { useOutbox } from './outbox'
import { useCreateEvent } from './procedures/create'
import { useDeleteEvent } from './procedures/delete'
import {
  customMutationKeys,
  useEventAction,
  useEventCustomAction
} from './procedures/actions/action'

export function useEvents() {
  const trpc = useTRPC()
  const getEvent = useGetEvent()
  return {
    createEvent: useCreateEvent,
    /** Returns an event with full history. If you only need the state of the event, use getEventState. */
    getEvent,
    getEvents: {
      useQuery: useQuery({
        ...trpc.event.list.queryOptions(),
        queryKey: trpc.event.list.queryKey()
      }),
      useSuspenseQuery: () => [
        useSuspenseQuery({
          ...trpc.event.list.queryOptions(),
          queryKey: trpc.event.list.queryKey()
        }).data
      ]
    },
    /** Returns an event with aggregated history. If you need the history of the event, use getEvent. */
    getEventState: useGetEventState(),
    deleteEvent: {
      useMutation: useDeleteEvent
    },
    getOutbox: useOutbox,
    searchEvent: {
      useQuery: (type: string, searchParams: Record<string, string>) =>
        useQuery({
          ...trpc.event.search.queryOptions({
            ...searchParams,
            type
          }),
          queryKey: trpc.event.search.queryKey({
            ...searchParams,
            type
          })
        }),
      useSuspenseQuery: (type: string, searchParams: Record<string, string>) =>
        useSuspenseQuery({
          ...trpc.event.search.queryOptions({
            ...searchParams,
            type
          }),
          queryKey: trpc.event.search.queryKey({
            ...searchParams,
            type
          })
        }).data
    },
    actions: {
      validate: useEventAction(trpc.event.actions.validate.request),
      reject: useEventAction(trpc.event.actions.reject.request),
      archive: useEventAction(trpc.event.actions.archive.request),
      notify: useEventAction(trpc.event.actions.notify.request),
      declare: useEventAction(trpc.event.actions.declare.request),
      register: useEventAction(trpc.event.actions.register.request),
      correction: {
        request: useEventAction(trpc.event.actions.correction.request),
        approve: useEventAction(trpc.event.actions.correction.approve),
        reject: useEventAction(trpc.event.actions.correction.reject)
      }
    },
    onlineActions: {
      printCertificate: useEventAction(
        trpc.event.actions.printCertificate.request
      )
    },
    customActions: {
      registerOnDeclare: useEventCustomAction([
        ...customMutationKeys.registerOnDeclare
      ]),
      validateOnDeclare: useEventCustomAction([
        ...customMutationKeys.validateOnDeclare
      ])
    }
  }
}

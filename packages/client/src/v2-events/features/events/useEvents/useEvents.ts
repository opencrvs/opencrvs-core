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
import { useGetEvent } from './procedures/get'
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
  return {
    createEvent: useCreateEvent,
    getEvent: useGetEvent(),
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
    deleteEvent: {
      useMutation: useDeleteEvent
    },
    getOutbox: useOutbox,
    actions: {
      validate: useEventAction(trpc.event.actions.validate),
      notify: useEventAction(trpc.event.actions.notify),
      declare: useEventAction(trpc.event.actions.declare),
      register: useEventAction(trpc.event.actions.register),
      printCertificate: useEventAction(trpc.event.actions.printCertificate),
      correction: {
        request: useEventAction(trpc.event.actions.correction.request),
        approve: useEventAction(trpc.event.actions.correction.approve),
        reject: useEventAction(trpc.event.actions.correction.reject)
      }
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

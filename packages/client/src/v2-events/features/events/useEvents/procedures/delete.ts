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

import { useMutation } from '@tanstack/react-query'
import {
  invalidateEventsList,
  setEventListData
} from '@client/v2-events/features/events/useEvents/api'
import { trpcOptionsProxy } from '@client/v2-events/trpc'
import { setMutationDefaults, waitUntilEventIsCreated } from './utils'

setMutationDefaults(trpcOptionsProxy.event.delete, {
  retry: (_, error) => {
    if (error.data?.httpStatus === 404 || error.data?.httpStatus === 400) {
      return false
    }
    return true
  },
  retryDelay: 10000,
  onSuccess: () => {
    void invalidateEventsList()
  },
  /*
   * This ensures that when the application is reloaded with pending mutations in IndexedDB, the
   * temporary event IDs in the requests get properly replaced with canonical IDs.
   * Also check utils.event.create.onSuccess for the same logic but for when even is created.
   */
  mutationFn: async (variables) => {
    setEventListData((oldData = []) => {
      return oldData.filter((event) => event.id !== variables.eventId)
    })

    const originalMutationFn =
      trpcOptionsProxy.event.delete.mutationOptions().mutationFn

    if (typeof originalMutationFn !== 'function') {
      throw new Error('Mutation function is not defined')
    }
    return waitUntilEventIsCreated(originalMutationFn)(variables)
  }
})

export const useDeleteEvent = () => {
  // mutationFn will be removed at this stage to ensure it has been specified in a serializable manner under /procedures. This ensures early error detection
  // without explicitly testing offline functionality.
  const { retry, retryDelay, onSuccess, mutationFn, ...options } =
    trpcOptionsProxy.event.delete.mutationOptions()
  return useMutation({
    ...options
  })
}

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
  setEventListData,
  setMutationDefaults
} from '@client/v2-events/features/events/useEvents/api'
import { utils } from '@client/v2-events/trpc'
import { waitUntilEventIsCreated } from './create'

setMutationDefaults(utils.event.delete, {
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

    const originalMutationFn = utils.event.delete.mutationOptions().mutationFn

    if (typeof originalMutationFn !== 'function') {
      throw new Error('Mutation function is not defined')
    }
    return waitUntilEventIsCreated(originalMutationFn)(variables)
  }
})

export const useDeleteEvent = () => {
  const { retry, retryDelay, onSuccess, mutationFn, ...options } =
    utils.event.delete.mutationOptions()
  return useMutation({
    ...options
  })
}

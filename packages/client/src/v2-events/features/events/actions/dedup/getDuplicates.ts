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

import {
  isExpectedAccessError,
  queryClient,
  trpcClient
} from '@client/v2-events/trpc'
import { cacheFiles } from '@client/v2-events/features/files/cache'
import { cacheUsersFromEventDocument } from '@client/v2-events/features/users/cache'
import { setEventData } from '../../useEvents/api'

export function potentialDuplicatesQueryKey(eventId: string) {
  return ['event', 'potentialDuplicates', eventId] as const
}

async function fetchPotentialDuplicates(eventId: string) {
  return trpcClient.event.getDuplicates.query({ eventId })
}

type PotentialDuplicates = Awaited<ReturnType<typeof fetchPotentialDuplicates>>

async function cachePotentialDuplicates(
  potentialDuplicates: PotentialDuplicates
) {
  for (const eventDocument of potentialDuplicates) {
    await Promise.all([
      cacheFiles(eventDocument),
      cacheUsersFromEventDocument(eventDocument)
    ])
    setEventData(eventDocument.id, eventDocument)
  }
}

/**
 * Fetches the potential duplicate records for `eventId` and populates the
 * cache for each one (files, users, event document), so downstream code
 * (e.g. duplicate review) can read them from cache.
 */
export async function fetchAndCachePotentialDuplicates(eventId: string) {
  const potentialDuplicates = await fetchPotentialDuplicates(eventId)
  await cachePotentialDuplicates(potentialDuplicates)
  return potentialDuplicates
}

export async function prefetchPotentialDuplicates(eventId: string) {
  try {
    await queryClient.fetchQuery({
      queryKey: potentialDuplicatesQueryKey(eventId),
      queryFn: () => fetchAndCachePotentialDuplicates(eventId)
    })
  } catch (error) {
    // The user is not authorized to see duplicates — otherwise, rethrow.
    if (!isExpectedAccessError(error)) {
      throw error
    }
  }
}

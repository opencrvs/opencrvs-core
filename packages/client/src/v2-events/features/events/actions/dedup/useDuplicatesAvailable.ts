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

import { useQuery } from '@tanstack/react-query'
import {
  AssignmentStatus,
  EventIndex,
  getAssignmentStatus
} from '@opencrvs/commons/client'
import { useAuthentication } from '@client/utils/userUtils'
import { isExpectedAccessError, isForbiddenError } from '@client/v2-events/trpc'
import {
  fetchAndCachePotentialDuplicates,
  potentialDuplicatesQueryKey
} from './getDuplicates'

export const DuplicatesAvailability = {
  /** No answer and none coming: we never asked, or the asking failed. */
  UNDETERMINED: 'UNDETERMINED',
  CHECKING: 'CHECKING',
  /** Every match can be opened by this user. */
  AVAILABLE: 'AVAILABLE',
  /** At least one match is beyond this user's reach. */
  UNAVAILABLE: 'UNAVAILABLE'
} as const

export type DuplicatesAvailability =
  (typeof DuplicatesAvailability)[keyof typeof DuplicatesAvailability]

/**
 * How far we have got in establishing whether the potential duplicates of
 * `event` can be reviewed by the current user. Asks only once assigned and
 * scoped, as the server demands both.
 */
export function useDuplicatesAvailable(
  event: EventIndex,
  canReviewDuplicates: boolean
): DuplicatesAvailability {
  const authentication = useAuthentication()
  const isAssignedToSelf =
    getAssignmentStatus(event, authentication?.sub ?? '') ===
    AssignmentStatus.ASSIGNED_TO_SELF

  const shouldAsk =
    canReviewDuplicates &&
    isAssignedToSelf &&
    event.potentialDuplicates.length > 0

  const duplicatesQuery = useQuery({
    queryKey: potentialDuplicatesQueryKey(event.id),
    queryFn: async () => fetchAndCachePotentialDuplicates(event.id),
    enabled: shouldAsk,
    // A refusal is the answer, not a failure — retrying only delays it.
    retry: (failureCount, error) =>
      !isExpectedAccessError(error) && failureCount < 1
  })

  if (!shouldAsk) {
    return DuplicatesAvailability.UNDETERMINED
  }

  // `isFetched` rather than `isLoading`, so re-running a settled check does
  // not read as though we never had an answer.
  if (!duplicatesQuery.isFetched) {
    return DuplicatesAvailability.CHECKING
  }

  // The server hands over the matches only if the user may see all of them,
  // so a result needs no further vetting and a refusal is the whole answer.
  if (duplicatesQuery.data) {
    return DuplicatesAvailability.AVAILABLE
  }

  // Only an outright refusal speaks to jurisdiction; a lapsed session or a
  // missing record says nothing, so anything else leaves us none the wiser.
  if (isForbiddenError(duplicatesQuery.error)) {
    return DuplicatesAvailability.UNAVAILABLE
  }

  return DuplicatesAvailability.UNDETERMINED
}

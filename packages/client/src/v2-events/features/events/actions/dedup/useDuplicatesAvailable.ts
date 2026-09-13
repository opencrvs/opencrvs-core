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
import { EventIndex } from '@opencrvs/commons/client'
import {
  fetchAndCachePotentialDuplicates,
  potentialDuplicatesQueryKey
} from './getDuplicates'

/**
 * Whether every potential duplicate of `event` is available to the current
 * user.
 *
 * Only asks once the record is downloaded and the user holds
 * `record.review-duplicates` — the server requires an assignment and that
 * scope, so a call made any earlier is refused whatever the jurisdiction.
 * Until an answer has settled, reports `true`, so that an unanswered question
 * is never mistaken for a denial.
 */
export function useDuplicatesAvailable(
  event: EventIndex,
  canReviewDuplicates: boolean,
  isDownloaded: boolean
) {
  const duplicatesQuery = useQuery({
    queryKey: potentialDuplicatesQueryKey(event.id),
    queryFn: async () => fetchAndCachePotentialDuplicates(event.id),
    enabled:
      canReviewDuplicates &&
      isDownloaded &&
      event.potentialDuplicates.length > 0
  })

  /*
   * Deliberately the last settled answer rather than `isLoading`: a refetch of
   * an already-answered question must not momentarily read as unanswered, or
   * the caller flips back and forth as the query is re-run.
   */
  if (!duplicatesQuery.isFetched) {
    return true
  }

  if (!duplicatesQuery.data) {
    return false
  }

  const availableIds = new Set(duplicatesQuery.data.map(({ id }) => id))
  return event.potentialDuplicates.every(({ id }) => availableIds.has(id))
}

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
 * user. Resolves to `true` while still loading, to avoid a false "not
 * available" before the fetch has settled.
 */
export function useDuplicatesAvailable(event: EventIndex) {
  const duplicatesQuery = useQuery({
    queryKey: potentialDuplicatesQueryKey(event.id),
    queryFn: () => fetchAndCachePotentialDuplicates(event.id),
    enabled: event.potentialDuplicates.length > 0
  })

  if (duplicatesQuery.isLoading) {
    return true
  }

  if (!duplicatesQuery.data) {
    return false
  }

  const availableIds = new Set(duplicatesQuery.data.map(({ id }) => id))
  return event.potentialDuplicates.every(({ id }) => availableIds.has(id))
}

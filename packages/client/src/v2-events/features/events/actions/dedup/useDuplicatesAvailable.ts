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

import { useQueries } from '@tanstack/react-query'
import { EventIndex } from '@opencrvs/commons/client'
import { useTRPC } from '@client/v2-events/trpc'

/**
 * Whether every record matched as a potential duplicate of `event` is present in
 * the local cache.
 */
export function useDuplicatesAvailable(event: EventIndex) {
  const trpc = useTRPC()

  const duplicates = useQueries({
    queries: event.potentialDuplicates.map(({ id }) => ({
      ...trpc.event.get.queryOptions({ eventId: id, waitFor: false }),
      enabled: false,
      staleTime: Infinity
    }))
  })

  return duplicates.every(({ data }) => Boolean(data))
}

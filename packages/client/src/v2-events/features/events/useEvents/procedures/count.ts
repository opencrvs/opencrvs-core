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

import { useSuspenseQuery } from '@tanstack/react-query'

import { WorkqueueCountInput } from '@opencrvs/commons/client'
import { useTRPC } from '@client/v2-events/trpc'

export function useGetEventCountsByWorkqueue() {
  const trpc = useTRPC()
  return {
    useSuspenseQuery: (queries: WorkqueueCountInput) =>
      useSuspenseQuery({
        ...trpc.workqueue.count.queryOptions(queries),
        refetchOnMount: 'always',
        staleTime: 0
      }).data
  }
}

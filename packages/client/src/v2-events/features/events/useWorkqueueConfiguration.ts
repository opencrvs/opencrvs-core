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
import { useTRPC } from '@client/v2-events/trpc'

/**
 * @returns a list of workqueue configurations
 */
export function useWorkqueueConfigurations() {
  const trpc = useTRPC()
  const config = useSuspenseQuery(trpc.event.workqueue.get.queryOptions()).data
  return config
}

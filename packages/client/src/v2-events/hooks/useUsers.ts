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

export function useUsers() {
  const trpc = useTRPC()
  return {
    getUser: {
      useQuery: (id: string) => useQuery(trpc.user.get.queryOptions(id)),
      useSuspenseQuery: (id: string) => [
        useSuspenseQuery(trpc.user.get.queryOptions(id)).data
      ]
    },
    getUsers: {
      useQuery: (ids: string[]) => useQuery(trpc.user.list.queryOptions(ids)),
      useSuspenseQuery: (ids: string[]) => [
        useSuspenseQuery(trpc.user.list.queryOptions(ids)).data
      ]
    }
  }
}

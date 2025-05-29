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
      useQuery: (id: string) => {
        const options = trpc.user.get.queryOptions(id)
        return useQuery({
          ...options,
          queryKey: trpc.user.get.queryKey(id)
        })
      },
      useSuspenseQuery: (id: string) => {
        const options = trpc.user.get.queryOptions(id)
        return [
          useSuspenseQuery({
            ...options,
            queryKey: trpc.user.get.queryKey(id)
          }).data
        ]
      }
    },
    getUsers: {
      useQuery: (ids: string[]) => {
        const options = trpc.user.list.queryOptions(ids)
        return useQuery({
          ...options,
          queryKey: trpc.user.list.queryKey(ids)
        })
      },
      useSuspenseQuery: (ids: string[]) => {
        const options = trpc.user.list.queryOptions(ids)
        return [
          useSuspenseQuery({
            ...options,
            queryKey: trpc.user.list.queryKey(ids)
          }).data
        ]
      }
    }
  }
}

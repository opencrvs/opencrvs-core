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
import { trpcOptionsProxy, useTRPC } from '@client/v2-events/trpc'
import { setQueryDefaults } from '../features/events/useEvents/procedures/utils'
import { getFullUrl, precacheFile } from '../features/files/useFileUpload'

setQueryDefaults(trpcOptionsProxy.user.get, {
  queryFn: async (...params) => {
    const {
      queryKey: [, input]
    } = params[0]

    const queryOptions = trpcOptionsProxy.user.get.queryOptions(input.input)

    if (typeof queryOptions.queryFn !== 'function') {
      throw new Error('queryFn is not a function')
    }

    const user = await queryOptions.queryFn(...params)

    if (user.signatureFilename) {
      await precacheFile(user.signatureFilename, '/')
      return {
        ...user,
        signatureFilename: getFullUrl(user.signatureFilename)
      }
    }

    return user
  }
})

setQueryDefaults(trpcOptionsProxy.user.list, {
  queryFn: async (...params) => {
    const {
      queryKey: [, input]
    } = params[0]

    const queryOptions = trpcOptionsProxy.user.list.queryOptions(input.input)

    if (typeof queryOptions.queryFn !== 'function') {
      throw new Error('queryFn is not a function')
    }

    const users = await queryOptions.queryFn(...params)

    await Promise.allSettled(
      users.map(async (user) => {
        if (user.signatureFilename) {
          return precacheFile(user.signatureFilename, '/')
        }
        return user
      })
    )

    return users.map((user) => ({
      ...user,
      signatureFilename: user.signatureFilename
        ? getFullUrl(user.signatureFilename)
        : undefined
    }))
  }
})

export function useUsers() {
  const trpc = useTRPC()
  return {
    getUser: {
      useQuery: (id: string) => {
        const { queryFn, ...options } = trpc.user.get.queryOptions(id)
        return useQuery({
          ...options,
          queryKey: trpc.user.get.queryKey(id)
        })
      },
      useSuspenseQuery: (id: string) => {
        const { queryFn, ...options } = trpc.user.get.queryOptions(id)
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
        const { queryFn, ...options } = trpc.user.list.queryOptions(ids)
        return useQuery({
          ...options,
          queryKey: trpc.user.list.queryKey(ids)
        })
      },
      useSuspenseQuery: (ids: string[]) => {
        const { queryFn, ...options } = trpc.user.list.queryOptions(ids)
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

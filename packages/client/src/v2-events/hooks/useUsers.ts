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

    if (user.signatureFileName) {
      await precacheFile(user.signatureFileName, '/')
      return {
        ...user,
        signatureFileName: getFullUrl(user.signatureFileName)
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
        if (user.signatureFileName) {
          return precacheFile(user.signatureFileName, '/')
        }
        return user
      })
    )

    return users.map((user) => ({
      ...user,
      signatureFileName: user.signatureFileName
        ? getFullUrl(user.signatureFileName)
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

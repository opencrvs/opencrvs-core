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

import { useMutation, useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { inferInput } from '@trpc/tanstack-react-query'
import {
  FullDocumentUrl,
  System,
  TokenUserType,
  User,
  UserOrSystem
} from '@opencrvs/commons/client'
import { getUnsignedFileUrl } from '@client/v2-events/cache'
import { queryClient, trpcOptionsProxy, useTRPC } from '@client/v2-events/trpc'
import {
  QueryOptions,
  setMutationDefaults,
  setQueryDefaults
} from '../features/events/useEvents/procedures/utils'
import { precacheFile } from '../features/files/useFileUpload'

type UserWithFullUrlFiles = Omit<UserOrSystem, 'signature' | 'avatar'> & {
  signature?: FullDocumentUrl
  avatar?: FullDocumentUrl
}

setQueryDefaults<
  typeof trpcOptionsProxy.user.get,
  Promise<UserWithFullUrlFiles>
>(trpcOptionsProxy.user.get, {
  queryFn: async (...params) => {
    const {
      queryKey: [, input]
    } = params[0]

    const queryOptions = trpcOptionsProxy.user.get.queryOptions(input.input)

    if (typeof queryOptions.queryFn !== 'function') {
      throw new Error('queryFn is not a function')
    }

    const user = await queryOptions.queryFn(...params)

    if (user.type === TokenUserType.enum.system) {
      return user
    }

    if (user.signature) {
      await precacheFile(user.signature)
    }
    if (user.avatar) {
      await precacheFile(user.avatar)
    }

    return {
      ...user,
      signature: user.signature
        ? getUnsignedFileUrl(user.signature)
        : undefined,
      avatar: user.avatar ? getUnsignedFileUrl(user.avatar) : undefined
    }
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
        if (user.type === TokenUserType.enum.system) {
          return user
        }

        if (user.signature) {
          return precacheFile(user.signature)
        }

        if (user.avatar) {
          return precacheFile(user.avatar)
        }
        return user
      })
    )

    return users.map((user) => ({
      ...user,
      signature: user.signature
        ? getUnsignedFileUrl(user.signature)
        : undefined,
      avatar: user.avatar ? getUnsignedFileUrl(user.avatar) : undefined
    }))
  }
})

setMutationDefaults(trpcOptionsProxy.user.changePhone, {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  mutationFn: trpcOptionsProxy.user.changePhone.mutationOptions().mutationFn!,
  retry: false,
  onSuccess: async (data, variables) => {
    await queryClient.invalidateQueries({
      queryKey: trpcOptionsProxy.user.get.queryKey(variables.userId)
    })
  }
})

setMutationDefaults(trpcOptionsProxy.user.changeEmail, {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  mutationFn: trpcOptionsProxy.user.changeEmail.mutationOptions().mutationFn!,
  retry: false,
  onSuccess: async (data, variables) => {
    await queryClient.invalidateQueries({
      queryKey: trpcOptionsProxy.user.get.queryKey(variables.userId)
    })
  }
})
setMutationDefaults(trpcOptionsProxy.user.changeAvatar, {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  mutationFn: trpcOptionsProxy.user.changeAvatar.mutationOptions().mutationFn!,
  retry: false,
  onSuccess: async (data, variables) => {
    await queryClient.invalidateQueries({
      queryKey: trpcOptionsProxy.user.get.queryKey(variables.userId)
    })
  }
})

export function useUsers() {
  const trpc = useTRPC()
  return {
    getUser: {
      useQuery: (
        id: string,
        options?: {
          enabled?: boolean
        }
      ) => {
        const { queryFn, ...queryOptions } = trpc.user.get.queryOptions(id)
        return useQuery({
          ...queryOptions,
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
      },
      getAllCached: () => {
        return queryClient
          .getQueriesData<User>({
            queryKey: trpc.user.get.queryKey()
          })
          .flatMap(([, data]) => data)
          .filter(
            (userOrSystem): userOrSystem is User =>
              userOrSystem?.type === TokenUserType.enum.user
          )
      }
    },
    createUser: ({ onSuccess }: { onSuccess?: () => void } = {}) => {
      useMutation: {
        const mutationOptions = trpc.user.create.mutationOptions()

        return useMutation({
          ...mutationOptions,
          onSuccess: () => {
            onSuccess?.()
          }
        })
      }
    },
    getSystem: {
      getAllCached: () => {
        return queryClient
          .getQueriesData<System>({
            queryKey: trpc.user.get.queryKey()
          })
          .flatMap(([, data]) => data)
          .filter(
            (userOrSystem): userOrSystem is System =>
              userOrSystem?.type === TokenUserType.enum.system
          )
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
    },
    searchUsers: {
      useQuery: (
        input: inferInput<typeof trpc.user.search>,
        additionalOptions: QueryOptions<typeof trpc.user.search> = {}
      ) => {
        return useQuery({
          ...trpc.user.search.queryOptions(input),
          ...additionalOptions,
          queryKey: trpc.user.search.queryKey(input)
        })
      },
      useSuspenseQuery: (
        input: inferInput<typeof trpc.user.search>,
        additionalOptions: QueryOptions<typeof trpc.user.search> = {}
      ) => {
        return [
          useSuspenseQuery({
            ...trpc.user.search.queryOptions(input),
            ...additionalOptions,
            queryKey: trpc.user.search.queryKey(input)
          }).data
        ]
      }
    },
    changePassword: useMutation(
      trpcOptionsProxy.user.changePassword.mutationOptions()
    ),
    sendVerifyCode: useMutation(
      trpcOptionsProxy.user.sendVerifyCode.mutationOptions()
    ),
    changePhone: useMutation(
      trpcOptionsProxy.user.changePhone.mutationOptions()
    ),
    changeEmail: useMutation(
      trpcOptionsProxy.user.changeEmail.mutationOptions()
    ),
    changeAvatar: useMutation(
      trpcOptionsProxy.user.changeAvatar.mutationOptions()
    )
  }
}

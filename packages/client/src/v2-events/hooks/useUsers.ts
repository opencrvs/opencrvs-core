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
import { inferInput, inferOutput } from '@trpc/tanstack-react-query'
import {
  deepDropNulls,
  System,
  TokenUserType,
  UserOrSystem,
  UserOrSystemSummary,
  UserSummary
} from '@opencrvs/commons/client'
import {
  hasConflict,
  queryClient,
  trpcOptionsProxy,
  useTRPC
} from '@client/v2-events/trpc'
import {
  QueryOptions,
  setMutationDefaults,
  setQueryDefaults
} from '../features/events/useEvents/procedures/utils'
import { precacheFile } from '../features/files/useFileUpload'

type UserWithResolvedFiles = Omit<UserOrSystem, 'signature' | 'avatar'> & {
  signature?: string
  avatar?: string
}

setQueryDefaults<
  typeof trpcOptionsProxy.user.get,
  Promise<UserWithResolvedFiles>
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

    return deepDropNulls({
      ...user,
      signature: user.signature ?? undefined,
      avatar: user.avatar
    })
  }
})

setQueryDefaults(trpcOptionsProxy.user.list, {
  queryFn: async (...params) => {
    const {
      queryKey: [procedurePath, input]
    } = params[0]

    const requestedIds = input.input ?? []

    const cachedUserMap = new Map(
      queryClient
        .getQueriesData<inferOutput<typeof trpcOptionsProxy.user.list>>({
          queryKey: trpcOptionsProxy.user.list.queryKey()
        })
        .flatMap(([, data]) => data ?? [])
        .map((user) => [user.id as string, user])
    )
    const uncachedIds = requestedIds.filter((id) => !cachedUserMap.has(id))

    if (uncachedIds.length > 0) {
      const uncachedQueryOptions =
        trpcOptionsProxy.user.list.queryOptions(uncachedIds)

      if (typeof uncachedQueryOptions.queryFn !== 'function') {
        throw new Error('queryFn is not a function')
      }

      // Construct a context whose queryKey input is the uncached IDs only, so
      // the raw tRPC queryFn makes an HTTP request for only those users.
      const freshUsers = await uncachedQueryOptions.queryFn({
        ...params[0],
        queryKey: [
          procedurePath,
          { input: uncachedIds }
        ] as (typeof params)[0]['queryKey']
      })

      await Promise.allSettled(
        freshUsers.map(async (user) => {
          if (user.type === TokenUserType.enum.system) {
            return user
          }
          if (user.avatar) {
            await precacheFile(user.avatar)
          }
          return user
        })
      )

      for (const user of freshUsers) {
        cachedUserMap.set(user.id as string, user)
      }
    }

    // Return only the originally-requested IDs from the combined map,
    // silently dropping any IDs the server does not know about.
    return requestedIds
      .map((id) => cachedUserMap.get(id))
      .filter((u): u is UserSummary => u !== undefined)
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

    await queryClient.invalidateQueries({
      queryKey: trpcOptionsProxy.user.list.queryKey()
    })

    await queryClient.invalidateQueries({
      queryKey: trpcOptionsProxy.user.search.queryKey()
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

    await queryClient.invalidateQueries({
      queryKey: trpcOptionsProxy.user.list.queryKey()
    })

    await queryClient.invalidateQueries({
      queryKey: trpcOptionsProxy.user.search.queryKey()
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

    await queryClient.invalidateQueries({
      queryKey: trpcOptionsProxy.user.list.queryKey()
    })

    await queryClient.invalidateQueries({
      queryKey: trpcOptionsProxy.user.search.queryKey()
    })
  }
})

setMutationDefaults(trpcOptionsProxy.user.sendResetPasswordInvite, {
  mutationFn:
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    trpcOptionsProxy.user.sendResetPasswordInvite.mutationOptions().mutationFn!,
  retry: false,
  onSuccess: async (data, variables) => {
    await queryClient.invalidateQueries({
      queryKey: trpcOptionsProxy.user.get.queryKey(variables)
    })

    await queryClient.invalidateQueries({
      queryKey: trpcOptionsProxy.user.search.queryKey()
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
      }
    },
    createUser: ({
      onSuccess
    }: {
      onSuccess?: (response: inferOutput<typeof trpc.user.create>) => void
    } = {}) => {
      const mutationOptions = trpc.user.create.mutationOptions()

      return useMutation({
        ...mutationOptions,
        retry: (_failureCount, error) => {
          return !hasConflict(error)
        },
        onSuccess: (response) => {
          onSuccess?.(response)
        }
      })
    },
    updateUser: ({
      onSuccess,
      onError
    }: {
      onSuccess?: (response: inferOutput<typeof trpc.user.update>) => void
      onError?: () => void
    } = {}) => {
      const mutationOptions = trpc.user.update.mutationOptions()

      return useMutation({
        ...mutationOptions,
        onSuccess: async (response) => {
          await queryClient.invalidateQueries({
            queryKey: trpc.user.get.queryKey(response.id)
          })

          await queryClient.invalidateQueries({
            queryKey: trpc.user.list.queryKey()
          })

          await queryClient.invalidateQueries({
            queryKey: trpc.user.search.queryKey()
          })

          onSuccess?.(response)
        },
        onError: () => {
          onError?.()
        }
      })
    },
    activateUser: ({
      onSuccess,
      onError
    }: { onSuccess?: () => void; onError?: () => void } = {}) => {
      const mutationOptions = trpc.user.activate.mutationOptions()

      return useMutation({
        ...mutationOptions,
        onSuccess: () => {
          onSuccess?.()
        },
        onError: () => {
          onError?.()
        }
      })
    },
    getSystem: {
      getAllCached: () => {
        return queryClient
          .getQueriesData<UserOrSystemSummary[]>({
            queryKey: trpc.user.list.queryKey()
          })
          .flatMap(([, data]) => data ?? [])
          .filter(
            (userOrSystem): userOrSystem is System =>
              userOrSystem.type === TokenUserType.enum.system
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
      },
      useQueryById: (
        id: string,
        options?: {
          enabled?: boolean
        }
      ) => {
        const ids = id ? [id] : []
        const { queryFn, ...queryOptions } = trpc.user.list.queryOptions(ids)
        const query = useQuery({
          ...queryOptions,
          ...options,
          enabled: !!id && (options?.enabled ?? true),
          queryKey: trpc.user.list.queryKey(ids)
        })
        const data = query.data
        return {
          ...query,
          data: data?.[0]
        }
      },
      getAllCached: () => {
        return queryClient
          .getQueriesData<UserOrSystemSummary[]>({
            queryKey: trpc.user.list.queryKey()
          })
          .flatMap(([, data]) => data ?? [])
          .filter(
            (userOrSystem): userOrSystem is UserSummary =>
              userOrSystem.type === TokenUserType.enum.user
          )
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
    ),
    sendUsernameReminder: useMutation(
      trpcOptionsProxy.user.sendUsernameReminder.mutationOptions()
    ),
    sendResetPasswordInvite: useMutation(
      trpcOptionsProxy.user.sendResetPasswordInvite.mutationOptions()
    ),
    resendInvite: useMutation(
      trpcOptionsProxy.user.resendInvite.mutationOptions()
    )
  }
}

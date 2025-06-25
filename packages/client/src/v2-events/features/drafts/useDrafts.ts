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
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { deepDropNulls, Draft, UUID } from '@opencrvs/commons/client'
import { TokenUserType } from '@opencrvs/commons/client'
import { storage } from '@client/storage'
import {
  invalidateDraftsList,
  invalidateEventsList,
  setDraftData
} from '@client/v2-events/features/events/useEvents/api'
import {
  createEventActionMutationFn,
  setMutationDefaults,
  setQueryDefaults
} from '@client/v2-events/features/events/useEvents/procedures/utils'
import { queryClient, trpcOptionsProxy, useTRPC } from '@client/v2-events/trpc'
import { createTemporaryId } from '@client/v2-events/utils'
import { getFilenamesFromActionDocument } from '../files/cache'
import { precacheFile } from '../files/useFileUpload'

/*
 * Overrides the default behaviour of "api.event.draft.list"
 * Cache files referenced in the draft.
 *
 * This ensures the full record can be browsed even when the user goes offline
 */
setQueryDefaults(trpcOptionsProxy.event.draft.list, {
  queryFn: async (...params) => {
    const queryOptions = trpcOptionsProxy.event.draft.list.queryOptions()

    if (typeof queryOptions.queryFn !== 'function') {
      throw new Error('queryFn is not a function')
    }

    const response = await queryOptions.queryFn(...params)
    const drafts = response.map((draft) => Draft.parse(draft))

    const filenames = drafts.flatMap((draft) =>
      getFilenamesFromActionDocument([draft.action])
    )
    await Promise.all(filenames.map(async (filename) => precacheFile(filename)))

    return drafts
  }
})

interface DraftStore {
  draft: Draft | null
  setDraft: (draft: Draft | null) => void
  getLocalDraftOrDefault: (draft: Draft) => Draft
}

const localDraftStore = create<DraftStore>()(
  persist(
    (set, get) => ({
      draft: null,
      setDraft: (draft: Draft | null) => set({ draft }),
      getLocalDraftOrDefault: (defaultDraft: Draft) => {
        const draft = get().draft
        if (draft) {
          return draft
        }
        return defaultDraft
      }
    }),
    {
      name: 'local-drafts',
      storage: createJSONStorage(() => ({
        getItem: async (key) => {
          const data = await storage.getItem(key)
          return data
        },
        setItem: async (key, value) => {
          await storage.setItem(key, value)
        },
        removeItem: async (key) => {
          await storage.removeItem(key)
        }
      }))
    }
  )
)

setMutationDefaults(trpcOptionsProxy.event.draft.create, {
  retry: true,
  mutationFn: createEventActionMutationFn(trpcOptionsProxy.event.draft.create),
  onMutate: (variables) => {
    const optimisticDraft: Draft = {
      id: createTemporaryId(),
      eventId: variables.eventId as UUID,
      transactionId: variables.transactionId as UUID,
      action: {
        createdAt: new Date().toISOString(),
        createdBy: '@todo',
        createdByUserType: TokenUserType.Enum.user,
        createdByRole: '@todo',
        createdAtLocation: '@todo' as UUID,
        ...variables,
        originalActionId: variables.originalActionId as UUID,
        declaration: variables.declaration || {}
      },
      createdAt: new Date().toISOString()
    }
    setDraftData((drafts) => drafts.concat(optimisticDraft))
    return optimisticDraft
  },
  onSuccess: async () => {
    await invalidateEventsList()
    await invalidateDraftsList()
  },
  retryDelay: 10000
})

function useCreateDraft() {
  const options = trpcOptionsProxy.event.draft.create.mutationOptions()
  const defaults = queryClient.getMutationDefaults(
    trpcOptionsProxy.event.draft.create.mutationKey()
  )

  return useMutation({
    ...options,
    ...defaults,
    mutationFn: defaults.mutationFn as typeof options.mutationFn
  })
}

export function useDrafts() {
  const trpc = useTRPC()
  const setDraft = localDraftStore((drafts) => drafts.setDraft)
  const getLocalDraftOrDefault = localDraftStore(
    (drafts) => drafts.getLocalDraftOrDefault
  )

  const localDraft = localDraftStore((drafts) => drafts.draft)
  const createDraft = useCreateDraft()

  function findAllRemoteDrafts(): Draft[] {
    // Skip the queryFn defined by tRPC and use the one defined above
    const { queryFn, ...options } = trpc.event.draft.list.queryOptions()

    const drafts = useSuspenseQuery({
      ...options,
      queryKey: trpc.event.draft.list.queryKey()
    })

    return drafts.data
  }

  return {
    setLocalDraft: setDraft,
    getLocalDraftOrDefault: getLocalDraftOrDefault,
    submitLocalDraft: () => {
      if (!localDraft) {
        throw new Error('No draft to submit')
      }

      createDraft.mutate({
        eventId: localDraft.eventId,
        declaration: deepDropNulls(localDraft.action.declaration),
        annotation: deepDropNulls(localDraft.action.annotation),
        transactionId: localDraft.transactionId,
        type: localDraft.action.type,
        status: localDraft.action.status
      })
    },
    getAllRemoteDrafts: findAllRemoteDrafts,
    getRemoteDrafts: function useDraftList(eventId: string): Draft[] {
      return findAllRemoteDrafts().filter((draft) => draft.eventId === eventId)
    }
  }
}

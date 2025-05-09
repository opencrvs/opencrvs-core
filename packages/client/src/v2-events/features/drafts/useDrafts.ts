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

import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { ActionStatus, Draft } from '@opencrvs/commons/client'
import { storage } from '@client/storage'
import {
  invalidateDraftsList,
  invalidateEventsList,
  setDraftData
} from '@client/v2-events/features/events/useEvents/api'
import {
  createEventActionMutationFn,
  setMutationDefaults
} from '@client/v2-events/features/events/useEvents/procedures/utils'
import { queryClient, trpcOptionsProxy, useTRPC } from '@client/v2-events/trpc'
import { createTemporaryId } from '@client/v2-events/utils'

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
      eventId: variables.eventId,
      transactionId: variables.transactionId,
      action: {
        status: ActionStatus.Accepted,
        createdAt: new Date().toISOString(),
        createdBy: '@todo',
        createdByRole: '@todo',
        createdAtLocation: '@todo',
        ...variables,
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

  return useMutation({
    ...options,
    ...queryClient.getMutationDefaults(
      trpcOptionsProxy.event.draft.create.mutationKey()
    )
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

  return {
    setLocalDraft: setDraft,
    getLocalDraftOrDefault: getLocalDraftOrDefault,
    submitLocalDraft: () => {
      if (!localDraft) {
        throw new Error('No draft to submit')
      }

      createDraft.mutate({
        eventId: localDraft.eventId,
        declaration: localDraft.action.declaration,
        annotation: localDraft.action.annotation,
        transactionId: localDraft.transactionId,
        type: localDraft.action.type
      })
    },
    getRemoteDrafts: function useDraftList(): Draft[] {
      const options = trpc.event.draft.list.queryOptions()

      const drafts = useSuspenseQuery({
        ...options,
        queryKey: trpc.event.draft.list.queryKey()
      })

      return drafts.data
    }
  }
}

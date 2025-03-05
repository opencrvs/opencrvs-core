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
import {
  DecorateMutationProcedure,
  inferInput,
  inferOutput
} from '@trpc/tanstack-react-query'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { Draft } from '@opencrvs/commons/client'
import { queryClient, useTRPC, utils } from '@client/v2-events/trpc'
import {
  createTemporaryId,
  setMutationDefaults,
  waitUntilEventIsCreated
} from '@client/v2-events/features/events/useEvents/api'
import { storage } from '@client/storage'

// This directly manipulates React query state
function setDraftData(updater: (drafts: Draft[]) => Draft[]) {
  return queryClient.setQueryData(utils.event.draft.list.queryKey(), (drafts) =>
    updater(drafts || [])
  )
}

async function invalidateDraftsList() {
  return queryClient.invalidateQueries({
    queryKey: utils.event.draft.list.queryKey()
  })
}

interface DraftStore {
  draft: Draft | null
  setDraft: (draft: Draft | null) => void
  getLocalDraftOrDefault: (draft: Draft) => Draft
}

const useLocalDrafts = create<DraftStore>()(
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
          return storage.getItem(key)
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createMutationFn<P extends DecorateMutationProcedure<any>>(
  procedure: P
) {
  /*
   * Merge default tRPC mutationOptions with the ones provided above
   */
  const mutationOptions = {
    ...procedure.mutationOptions(),
    ...queryClient.getMutationDefaults(procedure.mutationKey())
  }

  if (!mutationOptions.mutationFn) {
    throw new Error(
      'No mutation fn found for operation. This should never happen'
    )
  }

  const defaultMutationFn = mutationOptions.mutationFn

  return waitUntilEventIsCreated<inferInput<P>, inferOutput<P>>(
    async ({ eventType, ...params }) => {
      return defaultMutationFn({
        ...params,
        data: params.data
      })
    }
  )
}

setMutationDefaults(utils.event.draft.create, {
  retry: true,
  mutationFn: createMutationFn(utils.event.draft.create),
  onMutate: (variables) => {
    const optimisticDraft: Draft = {
      id: createTemporaryId(),
      eventId: variables.eventId,
      transactionId: variables.transactionId,
      action: {
        createdBy: '@todo',
        createdAtLocation: '@todo',
        ...variables
      },
      createdAt: new Date().toISOString()
    }
    setDraftData((drafts) => drafts.concat(optimisticDraft))
    return optimisticDraft
  },
  onSuccess: async () => {
    // await invalidateEventsList()
    // await invalidateDraftsList()
  },
  retryDelay: 10000
})

export function useCreateDraft() {
  const options = utils.event.draft.create.mutationOptions()

  return useMutation({
    ...options,
    ...queryClient.getMutationDefaults(utils.event.draft.create.mutationKey())
  })
}

export function useDrafts() {
  const trpc = useTRPC()
  const setDraft = useLocalDrafts((drafts) => drafts.setDraft)
  const getLocalDraftOrDefault = useLocalDrafts(
    (drafts) => drafts.getLocalDraftOrDefault
  )

  const localDraft = useLocalDrafts((drafts) => drafts.draft)
  const createDraft = useCreateDraft()
  return {
    // create: useCreateDraft(),
    setLocalDraft: (draft: Draft | null) => {
      console.log('Set draft', draft?.action.data)

      setDraft(draft)
    },
    getLocalDraftOrDefault: getLocalDraftOrDefault,
    submitLocalDraft: () => {
      if (!localDraft) {
        throw new Error('No draft to submit')
      }
      console.log('Submit', {
        eventId: localDraft.eventId,
        data: localDraft.action.data,
        transactionId: localDraft.transactionId,
        type: localDraft.action.type,
        createdAt: new Date().toISOString()
      })

      createDraft.mutate({
        eventId: localDraft.eventId,
        data: localDraft.action.data,
        transactionId: localDraft.transactionId,
        type: localDraft.action.type,
        createdAt: new Date().toISOString()
      })
    },
    getRemoteDrafts: function useDraftList(): Draft[] {
      const options = trpc.event.draft.list.queryOptions()

      const drafts = useSuspenseQuery({
        ...options,
        queryKey: trpc.event.draft.list.queryKey()
      })

      return drafts.data || []
    }
  }
}

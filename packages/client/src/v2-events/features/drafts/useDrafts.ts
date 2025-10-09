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
import {
  ActionDocument,
  deepDropNulls,
  Draft,
  UUID
} from '@opencrvs/commons/client'
import { storage } from '@client/storage'
import {
  clearPendingDraftCreationRequests,
  findLocalEventDocument,
  refetchDraftsList,
  refetchAllSearchQueries,
  setDraftData,
  updateLocalEventIndex
} from '@client/v2-events/features/events/useEvents/api'
import {
  createEventActionMutationFn,
  QueryOptions,
  setMutationDefaults,
  setQueryDefaults
} from '@client/v2-events/features/events/useEvents/procedures/utils'
import { queryClient, trpcOptionsProxy, useTRPC } from '@client/v2-events/trpc'
import { createTemporaryId, isTemporaryId } from '@client/v2-events/utils'
import { getFilepathsFromActionDocument } from '../files/cache'
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
      getFilepathsFromActionDocument([draft.action])
    )

    await Promise.all(filenames.map(async (filename) => precacheFile(filename)))

    const missingEventsToDownload = drafts
      .filter((event) => !findLocalEventDocument(event.eventId))
      .map(async (draft) =>
        queryClient.prefetchQuery({
          queryKey: trpcOptionsProxy.event.get.queryKey(draft.eventId),
          queryFn: trpcOptionsProxy.event.get.queryOptions(draft.eventId)
            .queryFn
        })
      )

    await Promise.all(missingEventsToDownload)

    return drafts
  }
})

interface DraftStore {
  draft: Draft | null
  setDraft: (draft: Draft | null) => void
  getLocalDraftOrDefault: (draft: Draft) => Draft
}

export const localDraftStore = create<DraftStore>()(
  persist(
    (set, get) => ({
      draft: null,
      setDraft: (draft: Draft | null) => set({ draft }),
      getLocalDraftOrDefault: (defaultDraft: Draft) => {
        const draft = get().draft

        // If we do not explicitly check for eventId, we might accidentally return previous draft when creating separate drafts in a row.
        if (draft && draft.eventId === defaultDraft.eventId) {
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
        createdByUserType: 'user',
        createdByRole: '@todo',
        ...variables,
        originalActionId: variables.originalActionId as UUID,
        /*
         * Annoyingly these need to be casted or otherwise branded
         * types like FullDocumentPath causes an error here.
         * inferInput of trpc types causes branded types to lose the branding and
         * just show as plain types
         */
        declaration: (variables.declaration ||
          {}) as Draft['action']['declaration'],
        annotation: (variables.annotation ||
          {}) as Draft['action']['annotation']
      },
      createdAt: new Date().toISOString()
    }
    setDraftData((drafts) => {
      return drafts
        .filter((draft) => draft.eventId !== optimisticDraft.eventId)
        .concat(optimisticDraft)
    })
    clearPendingDraftCreationRequests(variables.eventId)
    return optimisticDraft
  },
  onSuccess: async () => {
    await refetchAllSearchQueries()
    await refetchDraftsList()
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
  const getLocalDraftOrDefault = localDraftStore(
    (drafts) => drafts.getLocalDraftOrDefault
  )

  const localDraft = localDraftStore((drafts) => drafts.draft)
  const createDraft = useCreateDraft()

  function getAllRemoteDrafts(
    additionalOptions: QueryOptions<typeof trpc.event.draft.list> = {}
  ): Draft[] {
    // Skip the queryFn defined by tRPC and use the one defined above
    const { queryFn, ...options } = trpc.event.draft.list.queryOptions()

    const drafts = useSuspenseQuery({
      ...options,
      ...additionalOptions,
      // First use data from browser cache, then fetch from the server if online
      networkMode: 'offlineFirst',
      queryKey: trpc.event.draft.list.queryKey(),
      select: (currentDraftState) => {
        const locallyStoredDrafts =
          queryClient.getQueryData<Draft[]>(trpc.event.draft.list.queryKey()) ??
          []
        const serverStoredDrafts = currentDraftState.filter(
          (draft) => !isTemporaryId(draft.id)
        )

        /*
         * These drafts are still pending for successful creation.
         * We still want to show them to the user as if they were already created as
         * syncing ultimately should be a background process.
         */

        const optimisticallyStoredLocalDrafts = locallyStoredDrafts.filter(
          (d) =>
            isTemporaryId(d.id) &&
            !serverStoredDrafts.some((i) => i.transactionId === d.transactionId)
        )

        return [...serverStoredDrafts, ...optimisticallyStoredLocalDrafts]
      }
    })

    return drafts.data
  }

  return {
    setLocalDraft: localDraftStore((drafts) => drafts.setDraft),
    getLocalDraftOrDefault,
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
    getAllRemoteDrafts,
    getRemoteDraftByEventId: function useDraftList(
      eventId: string,
      additionalOptions: QueryOptions<typeof trpc.event.draft.list> = {}
    ): Draft | undefined {
      const eventDrafts = getAllRemoteDrafts(additionalOptions).filter(
        (draft) => draft.eventId === eventId
      )

      if (eventDrafts.length > 1) {
        throw new Error(
          `Multiple drafts found for event ${eventId}. This should not happen.`
        )
      }

      return eventDrafts[0]
    },
    prefetch: () => {
      const drafts = getAllRemoteDrafts()
      drafts.forEach((draft) => {
        const localEvent = findLocalEventDocument(draft.eventId)

        if (localEvent) {
          localEvent.actions.push({
            ...draft.action,
            id: createTemporaryId(),
            createdBy: 'offline',
            type: draft.action.type
          } as ActionDocument)
          updateLocalEventIndex(draft.eventId, localEvent)
        }
      })
    }
  }
}

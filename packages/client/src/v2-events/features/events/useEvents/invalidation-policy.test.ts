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
import { tennisClubMembershipEvent } from '@opencrvs/commons/client'
import { queryClient, trpcOptionsProxy } from '@client/v2-events/trpc'
import { tennisClubMembershipEventDocument } from '@client/v2-events/features/events/fixtures'
import {
  addLocalEventConfig,
  deleteLocalEvent,
  findLocalEventIndex,
  onAssign,
  onMarkNotDuplicate
} from './api'
import { searchKeys } from './procedures/search'

/*
 * Importing these modules registers each action's mutation defaults (its
 * onSuccess handler) on the shared queryClient — this is the per-action
 * invalidation policy under test.
 */
/* eslint-disable import/no-unassigned-import */
import './procedures/create'
import './procedures/delete'
import './procedures/actions/action'
import '@client/v2-events/features/drafts/useDrafts'
/* eslint-enable import/no-unassigned-import */

const allWorkqueuesKey = JSON.stringify(searchKeys.filters.allWorkqueues())

/** Poll an assertion until it passes or the timeout elapses. */
async function waitFor(assertion: () => void, timeout = 3000) {
  const start = Date.now()
  for (;;) {
    try {
      assertion()
      return
    } catch (error) {
      if (Date.now() - start > timeout) {
        throw error
      }
      await new Promise((resolve) => setTimeout(resolve, 10))
    }
  }
}

function getOnSuccess(mutationKey: readonly unknown[]) {
  return queryClient.getMutationDefaults(mutationKey)?.onSuccess as
    | ((...args: unknown[]) => unknown)
    | undefined
}

/** True if any spied invalidateQueries/refetchQueries call targeted workqueue searches. */
function touchedWorkqueueSearches(
  spies: Array<{ mock: { calls: unknown[][] } }>
) {
  return spies.some((spy) =>
    spy.mock.calls.some(([arg]) => {
      const key = JSON.stringify((arg as { queryKey?: unknown })?.queryKey)
      return key?.includes('"workqueue"') || key === allWorkqueuesKey
    })
  )
}

function touchedByIdSearch(
  spies: Array<{ mock: { calls: unknown[][] } }>,
  eventId: string
) {
  const byIdKey = JSON.stringify(searchKeys.filters.byId(eventId))
  return spies.some((spy) =>
    spy.mock.calls.some(
      ([arg]) =>
        JSON.stringify((arg as { queryKey?: unknown })?.queryKey) === byIdKey
    )
  )
}

describe('per-action invalidation policy (handler map)', () => {
  beforeEach(() => {
    global.caches = {
      keys: vi.fn().mockResolvedValue([])
    } as unknown as CacheStorage
    queryClient.clear()
    addLocalEventConfig(tennisClubMembershipEvent)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('gated-out actions do no search/workqueue invalidation', () => {
    it('CREATE: onSuccess never touches workqueue or by-id search queries', () => {
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
      const refetchSpy = vi.spyOn(queryClient, 'refetchQueries')

      const onSuccess = getOnSuccess(
        trpcOptionsProxy.event.create.mutationKey()
      )
      expect(onSuccess).toBeTypeOf('function')

      onSuccess?.(tennisClubMembershipEventDocument, undefined, {
        transactionId: tennisClubMembershipEventDocument.id
      })

      expect(touchedWorkqueueSearches([invalidateSpy, refetchSpy])).toBe(false)
      expect(
        touchedByIdSearch(
          [invalidateSpy, refetchSpy],
          tennisClubMembershipEventDocument.id
        )
      ).toBe(false)
    })

    it('DELETE: onSuccess never touches workqueue or by-id search queries', () => {
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
      const refetchSpy = vi.spyOn(queryClient, 'refetchQueries')

      const onSuccess = getOnSuccess(
        trpcOptionsProxy.event.delete.mutationKey()
      )
      expect(onSuccess).toBeTypeOf('function')

      onSuccess?.({ id: tennisClubMembershipEventDocument.id })

      expect(touchedWorkqueueSearches([invalidateSpy, refetchSpy])).toBe(false)
      expect(
        touchedByIdSearch(
          [invalidateSpy, refetchSpy],
          tennisClubMembershipEventDocument.id
        )
      ).toBe(false)
    })

    it('DELETE: onSuccess settles only after the drafts list has refetched', async () => {
      let finishDraftsRefetch: () => void = () => undefined
      const refetchSpy = vi
        .spyOn(queryClient, 'refetchQueries')
        .mockReturnValue(
          new Promise<void>((resolve) => (finishDraftsRefetch = resolve))
        )
      const onSuccess = getOnSuccess(
        trpcOptionsProxy.event.delete.mutationKey()
      )

      let settled = false
      const done = Promise.resolve(
        onSuccess?.({ id: tennisClubMembershipEventDocument.id })
      ).then(() => (settled = true))
      await new Promise((resolve) => setTimeout(resolve, 0))
      expect(refetchSpy).toHaveBeenCalledWith({
        queryKey: trpcOptionsProxy.event.draft.list.queryKey()
      })
      expect(settled).toBe(false)

      finishDraftsRefetch()
      await done
      expect(settled).toBe(true)
    })

    it('DRAFT_SAVE: onSuccess refreshes only the draft list, no search/workqueue', async () => {
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
      const refetchSpy = vi.spyOn(queryClient, 'refetchQueries')

      const onSuccess = getOnSuccess(
        trpcOptionsProxy.event.draft.create.mutationKey()
      )
      expect(onSuccess).toBeTypeOf('function')

      await onSuccess?.(undefined, {
        eventId: tennisClubMembershipEventDocument.id
      })

      expect(touchedWorkqueueSearches([invalidateSpy, refetchSpy])).toBe(false)
      expect(
        touchedByIdSearch(
          [invalidateSpy, refetchSpy],
          tennisClubMembershipEventDocument.id
        )
      ).toBe(false)
      // it DOES refetch the (client-state) draft list
      expect(refetchSpy).toHaveBeenCalledWith({
        queryKey: trpcOptionsProxy.event.draft.list.queryKey()
      })
    })
  })

  it('CREATE offline: onMutate makes the record resolvable by its temporary id', () => {
    const transactionId = 'tmp-offline-create'
    const onMutate = queryClient.getMutationDefaults(
      trpcOptionsProxy.event.create.mutationKey()
    ).onMutate as (variables: unknown) => unknown

    onMutate({ transactionId, type: tennisClubMembershipEvent.id })

    expect(findLocalEventIndex(transactionId)?.id).toBe(transactionId)
    expect(
      queryClient.getQueryData(searchKeys.byId(transactionId))?.results
    ).toHaveLength(1)
  })

  describe('workqueue-affecting actions use the standard path', () => {
    it('MARK_AS_NOT_DUPLICATE is wired to onMarkNotDuplicate (standard refresh, keeps local event — record stays assigned)', () => {
      const onSuccess = getOnSuccess(
        trpcOptionsProxy.event.actions.duplicate.markNotDuplicate.mutationKey()
      )
      expect(onSuccess).toBe(onMarkNotDuplicate)
    })

    it('MARK_AS_DUPLICATE stays on deleteLocalEvent (record is unassigned after)', () => {
      const onSuccess = getOnSuccess(
        trpcOptionsProxy.event.actions.duplicate.markAsDuplicate.mutationKey()
      )
      expect(onSuccess).toBe(deleteLocalEvent)
    })

    it('REGISTER: onSuccess stales workqueues + refetches count + resets byId', async () => {
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
      const resetSpy = vi.spyOn(queryClient, 'resetQueries')

      const onSuccess = getOnSuccess(
        trpcOptionsProxy.event.actions.register.request.mutationKey()
      )
      expect(onSuccess).toBeTypeOf('function')

      // REGISTER's handler fires the standard path (deleteLocalEvent) without
      // awaiting it, so poll for the resulting cache operations.
      onSuccess?.(tennisClubMembershipEventDocument)

      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalledWith({
          queryKey: searchKeys.filters.allWorkqueues(),
          refetchType: 'none'
        })
        expect(invalidateSpy).toHaveBeenCalledWith({
          queryKey: trpcOptionsProxy.workqueue.count.queryKey()
        })
        expect(resetSpy).toHaveBeenCalledWith({
          queryKey: searchKeys.filters.byId(
            tennisClubMembershipEventDocument.id
          )
        })
      })
    })
  })

  describe('assignment actions stay scoped', () => {
    it('ASSIGN is wired to onAssign (count-only, no blanket)', () => {
      const onSuccess = getOnSuccess(
        trpcOptionsProxy.event.actions.assignment.assign.mutationKey()
      )
      expect(onSuccess).toBe(onAssign)
    })
  })
})

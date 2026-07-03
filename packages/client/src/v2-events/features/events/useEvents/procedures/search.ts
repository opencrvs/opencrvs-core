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
import { QueryFunctionContext } from '@tanstack/react-query'
import { inferInput } from '@trpc/tanstack-react-query'
import { QueryType } from '@opencrvs/commons/client'
import { queryClient, trpcOptionsProxy } from '@client/v2-events/trpc'

/**
 * The tRPC procedure input for event.search. Use the inferred input (not
 * commons' SearchQuery) so `{ query }` alone is accepted — offset/limit/sort
 * are optional here, matching what searchEventById passes.
 */
export type SearchInput = inferInput<typeof trpcOptionsProxy.event.search>

/**
 * The scope segment(s) spliced into the tRPC key path element (queryKey[0]) to
 * make `event.search` cache entries granularly targetable:
 *
 *   workqueue:  [['event','search','workqueue', slug], {input, type:'query'}]
 *   by-id:      [['event','search','id', eventId],     {input, type:'query'}]
 *   adhoc:      [['event','search','adhoc'],           {input, type:'query'}]
 *
 * Because react-query treats a shorter key array as a partial-match prefix of a
 * longer one, filters like [['event','search','workqueue']] match every
 * workqueue entry, and [['event','search']] still matches everything.
 */
export type SearchScope = ['workqueue', string] | ['id', string] | ['adhoc']

/**
 * Takes the plain unscoped tRPC key for `event.search` and splices the scope
 * segments into its path element (queryKey[0]), leaving the {input, type}
 * element untouched so the shim below can re-derive a clean key for tRPC.
 */
function scopedKey(input: SearchInput, scope: SearchScope) {
  const key = trpcOptionsProxy.event.search.queryKey(input)
  const [path, meta] = key
  // Splice the scope into the path element; spreading strips readonly. Cast back
  // to the branded key type so useQuery still infers the correct data type.
  return [[...path, ...scope], meta] as unknown as typeof key
}

function byIdInput(eventId: string): SearchInput {
  return {
    query: {
      type: 'and',
      clauses: [{ id: eventId }]
    } satisfies QueryType
  }
}

export const searchKeys = {
  /** Generic builder for the hook layer, which receives the scope as a param. */
  scoped: (input: SearchInput, scope: SearchScope) => scopedKey(input, scope),
  workqueue: (input: SearchInput, slug: string) =>
    scopedKey(input, ['workqueue', slug]),
  byId: (eventId: string) => scopedKey(byIdInput(eventId), ['id', eventId]),
  adhoc: (input: SearchInput) => scopedKey(input, ['adhoc']),
  /**
   * Prefix keys for invalidation/refetch targeting. Shorter than a full scoped
   * key so they partial-match every entry beneath them.
   */
  filters: {
    all: () => [['event', 'search']] as const,
    allWorkqueues: () => [['event', 'search', 'workqueue']] as const,
    workqueue: (slug: string) =>
      [['event', 'search', 'workqueue', slug]] as const,
    byId: (eventId: string) => [['event', 'search', 'id', eventId]] as const
  }
}

/**
 * CRITICAL: @trpc/tanstack-react-query's generated queryFn re-derives the
 * procedure path from the RUNTIME query key (getClientArgs does
 * `path = queryKey[0]; path.join('.')`). A scoped key would call procedure
 * `event.search.workqueue.<slug>` → server NOT_FOUND.
 *
 * This default queryFn strips the scope back off by re-building a clean
 * unscoped key from the {input} element and delegating to tRPC's own queryFn.
 * Query defaults match by partial key, so this applies to every scoped key.
 *
 * Consequence: hooks spreading queryOptions() must strip its explicit queryFn
 * (an explicit queryFn beats this default) — see the searchEvent /
 * searchEventById hooks in useEvents.ts.
 *
 * NOTE: this calls queryClient.setQueryDefaults directly (mirroring the
 * networkMode:'online' the procedures/utils helper adds) rather than importing
 * that helper. Importing the helper would create the cycle
 * api → search → utils → api (api.ts imports searchKeys from this module),
 * whose module-load-time setQueryDefaults call resolves to `undefined` under
 * the bundler. Depending only on `trpc` keeps this call cycle-free.
 */
queryClient.setQueryDefaults(trpcOptionsProxy.event.search.queryKey(), {
  // With a persister, networkMode defaults to 'offlineFirst', which would run
  // the query offline and fail against an unreachable tRPC server. 'online'
  // makes it wait for connectivity — same as the procedures/utils helper.
  networkMode: 'online',
  queryFn: (ctx: QueryFunctionContext) => {
    // The {input, type} element is always present for event.search keys.
    const { input } = ctx.queryKey[1] as { input: SearchInput }
    const options = trpcOptionsProxy.event.search.queryOptions(input)
    if (!options.queryFn) {
      throw new Error('queryFn is not defined for event.search')
    }
    // Feed tRPC a clean, unscoped key so it derives the correct procedure path.
    return options.queryFn({ ...ctx, queryKey: options.queryKey })
  }
})

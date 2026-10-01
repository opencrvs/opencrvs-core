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
import { hashKey, QueryFunctionContext } from '@tanstack/react-query'
import { inferInput, inferOutput } from '@trpc/tanstack-react-query'
import { QueryType } from '@opencrvs/commons/client'
import { queryClient, trpcOptionsProxy } from '@client/v2-events/trpc'

/**
 * The tRPC procedure input for event.search. Use the inferred input (not
 * commons' SearchQuery) so `{ query }` alone is accepted — offset/limit/sort
 * are optional here, matching what searchEventById passes.
 */
export type SearchInput = inferInput<typeof trpcOptionsProxy.event.search>
type SearchOutput = inferOutput<typeof trpcOptionsProxy.event.search>

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
  workqueue: (input: SearchInput, slug: string) =>
    scopedKey(input, ['workqueue', slug]),
  byId: (eventId: string) => scopedKey(byIdInput(eventId), ['id', eventId]),
  adhoc: (input: SearchInput) => scopedKey(input, ['adhoc']),
  /**
   * Prefix keys for invalidation/refetch targeting. Shorter than a full scoped
   * key so they partial-match every entry beneath them.
   */
  filters: {
    allWorkqueues: () => [['event', 'search', 'workqueue']] as const,
    workqueue: (slug: string) =>
      [['event', 'search', 'workqueue', slug]] as const,
    byId: (eventId: string) => [['event', 'search', 'id', eventId]] as const
  }
}

let searchRequests = 0
const lastRequestByQuery = new Map<string, number>()

/** The number of the latest `event.search` request sent. Numbers only grow. */
export function lastSearchRequest() {
  return searchRequests
}

/** True if a request for the query `queryHash` was sent after request `after`. */
export function isSearchRequestedAfter(queryHash: string, after: number) {
  return (lastRequestByQuery.get(queryHash) ?? 0) > after
}

/**
 * tRPC's queryFn derives the procedure path from the runtime key, so a scoped
 * key would call `event.search.workqueue.<slug>`. This rebuilds the unscoped
 * key before delegating to tRPC.
 */
async function fetchScopedSearch(ctx: QueryFunctionContext) {
  lastRequestByQuery.set(hashKey(ctx.queryKey), ++searchRequests)
  // The {input, type} element is always present for event.search keys.
  const { input } = ctx.queryKey[1] as { input: SearchInput }
  const options = trpcOptionsProxy.event.search.queryOptions(input)
  if (!options.queryFn) {
    throw new Error('queryFn is not defined for event.search')
  }
  return options.queryFn({ ...ctx, queryKey: options.queryKey })
}

/**
 * Query options for a scoped `event.search` entry. tRPC's own queryFn is left
 * out: it would derive the procedure path from the scoped key, so the default
 * queryFn below serves the entry unless the caller supplies its own.
 */
export function scopedSearchOptions(input: SearchInput, scope: SearchScope) {
  const { queryFn: _queryFn, ...options } =
    trpcOptionsProxy.event.search.queryOptions(input)
  return { ...options, queryKey: scopedKey(input, scope) }
}

/**
 * Query options for the by-id `event.search` entry of an event. When the
 * server has no record yet, `fallback` builds the result instead, and it is
 * cached like a server result.
 */
export function byIdSearchOptions(
  eventId: string,
  fallback: () => SearchOutput
) {
  return {
    ...scopedSearchOptions(byIdInput(eventId), ['id', eventId]),
    queryFn: async (ctx: QueryFunctionContext) => {
      const result = await fetchScopedSearch(ctx)
      return result.total > 0 ? result : fallback()
    }
  }
}

/**
 * The default queryFn for every scoped `event.search` key. Calls
 * queryClient.setQueryDefaults directly: the procedures/utils helper would
 * close the import cycle api → search → utils → api.
 */
queryClient.setQueryDefaults(trpcOptionsProxy.event.search.queryKey(), {
  // As in the procedures/utils helper: wait for connectivity rather than the
  // persister's 'offlineFirst'.
  networkMode: 'online',
  queryFn: fetchScopedSearch
})

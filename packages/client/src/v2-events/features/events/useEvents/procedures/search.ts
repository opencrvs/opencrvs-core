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
 * The cache tag segment(s) spliced into the tRPC key path element (queryKey[0]) to
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
export type SearchCacheTag = ['workqueue', string] | ['id', string] | ['adhoc']

/**
 * Takes the plain untagged tRPC key for `event.search` and splices the tag
 * segments into its path element (queryKey[0]), leaving the {input, type}
 * element untouched so the shim below can re-derive a clean key for tRPC.
 */
export function taggedKey(input: SearchInput, tag: SearchCacheTag) {
  const key = trpcOptionsProxy.event.search.queryKey(input)
  const [path, meta] = key
  // Splice the tag into the path element; spreading strips readonly. Cast back
  // to the branded key type so useQuery still infers the correct data type.
  return [[...path, ...tag], meta] as unknown as typeof key
}

function byIdInput(eventId: string): SearchInput {
  return {
    query: {
      type: 'and',
      clauses: [{ id: eventId }]
    } satisfies QueryType
  }
}

/**
 * Key of the by-id `event.search` entry of an event: the one entry that
 * resolves it locally.
 */
export function byIdSearchKey(eventId: string) {
  return taggedKey(byIdInput(eventId), ['id', eventId])
}

/**
 * Prefix key matching the entries of every workqueue. Shorter than a full
 * tagged key, so it partial-matches every entry beneath it.
 */
export function workqueueSearchKey() {
  return [['event', 'search', 'workqueue']] as const
}

/**
 * tRPC's queryFn derives the procedure path from the runtime key, so a tagged
 * key would call `event.search.workqueue.<slug>`. This rebuilds the untagged
 * key before delegating to tRPC.
 */
function fetchTaggedSearch(ctx: QueryFunctionContext) {
  // The {input, type} element is always present for event.search keys.
  const { input } = ctx.queryKey[1] as { input: SearchInput }
  const options = trpcOptionsProxy.event.search.queryOptions(input)
  if (!options.queryFn) {
    throw new Error('queryFn is not defined for event.search')
  }
  return options.queryFn({ ...ctx, queryKey: options.queryKey })
}

/**
 * Query options for a tagged `event.search` entry. tRPC's own queryFn is left
 * out: it would derive the procedure path from the tagged key, so the default
 * queryFn below serves the entry unless the caller supplies its own.
 */
export function taggedSearchOptions(input: SearchInput, tag: SearchCacheTag) {
  const { queryFn: _queryFn, ...options } =
    trpcOptionsProxy.event.search.queryOptions(input)
  return { ...options, queryKey: taggedKey(input, tag) }
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
    ...taggedSearchOptions(byIdInput(eventId), ['id', eventId]),
    queryFn: async (ctx: QueryFunctionContext) => {
      const result = await fetchTaggedSearch(ctx)
      return result.total > 0 ? result : fallback()
    }
  }
}

/**
 * The default queryFn for every tagged `event.search` key. Calls
 * queryClient.setQueryDefaults directly: the procedures/utils helper would
 * close the import cycle api → search → utils → api.
 */
queryClient.setQueryDefaults(trpcOptionsProxy.event.search.queryKey(), {
  // As in the procedures/utils helper: wait for connectivity rather than the
  // persister's 'offlineFirst'.
  networkMode: 'online',
  queryFn: fetchTaggedSearch
})

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
import { useEffect } from 'react'
import { focusManager, hashKey, QueryKey } from '@tanstack/react-query'
import { queryClient } from '@client/v2-events/trpc'

/** Queries polled together: every query in a group refetches on one tick. */
export interface RefetchGroup {
  name: string
  intervalMs: number
}

const groups = new Map<
  string,
  { timer: ReturnType<typeof setInterval>; queryKeys: Set<QueryKey> }
>()

/** One tick of `group`: what its timer does every `intervalMs`. */
export async function refetchGroup({ name }: RefetchGroup) {
  // As react-query's own refetchInterval does, wait while the tab is hidden.
  if (!focusManager.isFocused()) {
    return
  }
  const queryKeys = groups.get(name)?.queryKeys ?? []
  await Promise.all(
    [...queryKeys].map(async (queryKey) =>
      queryClient.refetchQueries(
        { queryKey, type: 'active' },
        { cancelRefetch: false }
      )
    )
  )
}

function joinGroup(group: RefetchGroup, queryKey: QueryKey) {
  let entry = groups.get(group.name)
  if (!entry) {
    entry = {
      timer: setInterval(() => void refetchGroup(group), group.intervalMs),
      queryKeys: new Set()
    }
    groups.set(group.name, entry)
  }
  entry.queryKeys.add(queryKey)

  return () => {
    entry.queryKeys.delete(queryKey)
    if (entry.queryKeys.size === 0) {
      clearInterval(entry.timer)
      groups.delete(group.name)
    }
  }
}

/**
 * Polls the query `queryKey` on the shared tick of `group`, so queries shown
 * side by side refresh together instead of each on its own timer.
 */
export function useSharedRefetch(group: RefetchGroup, queryKey: QueryKey) {
  // Keyed by hash, so a re-render's new but equal key does not resubscribe.
  const hash = hashKey(queryKey)
  useEffect(() => joinGroup(group, JSON.parse(hash) as QueryKey), [group, hash])
}

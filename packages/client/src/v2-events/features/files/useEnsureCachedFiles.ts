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

import { useSuspenseQuery } from '@tanstack/react-query'
import { EventDocument } from '@opencrvs/commons/client'
import { cacheMissingFiles } from './cache'

/**
 * Guarantees that the files an event refers to are in the browser cache before
 * the event is rendered.
 *
 * `cacheFiles` only runs when the event itself is fetched, and an event read
 * back from the persisted react-query cache is never fetched again. The two
 * caches are cleared independently — Chrome's "Cached images and files" empties
 * Cache Storage and leaves IndexedDB alone, and so does quota eviction — so the
 * event document outlives its files, and every document and signature renders
 * as a broken image until the record is downloaded again.
 *
 * Suspending is what makes this a fix rather than a repair: an effect would run
 * after the <img> elements had already asked for files that were not there.
 */
export function useEnsureCachedFiles(event: EventDocument) {
  useSuspenseQuery({
    queryKey: ['cached-files', event.id, event.updatedAt],
    queryFn: async () => {
      await cacheMissingFiles(event)

      return null
    },
    /*
     * This describes the state of a cache that anything can empty between two
     * renders, so the answer is never reusable: it must be recomputed on every
     * mount and must not be persisted to IndexedDB.
     */
    meta: { noCache: true },
    staleTime: 0,
    gcTime: 0
  })
}

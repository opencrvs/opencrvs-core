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
import { useEffect, useState } from 'react'
import { CACHE_NAME } from '@client/v2-events/cache'

const MAX_RETRY = 5

export function useWorkboxCacheReady(cachePrefix = CACHE_NAME) {
  const [ready, setReady] = useState<boolean | null>(null)

  useEffect(() => {
    let cancelled = false
    async function checkCache() {
      // retry up to MAX_RETRY times with delay to check if CACHE_NAME cache key exists
      for (let i = 0; i < MAX_RETRY; i++) {
        const cacheKeys = await caches.keys()
        const found = cacheKeys.find((k) => k.startsWith(cachePrefix))
        if (found) {
          if (!cancelled) {
            setReady(true)
          }
          return
        }
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }

      // eslint-disable-next-line no-console
      console.warn(
        '⚠️ Workbox runtime cache not found after retries, preparing to logout'
      )
      if (!cancelled) {
        setReady(false)
      }
    }

    void navigator.serviceWorker.ready.then(() => {
      void checkCache()
    })

    return () => {
      cancelled = true
    }
  }, [cachePrefix])

  return ready
}

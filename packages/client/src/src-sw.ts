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
import {
  PrecacheEntry,
  createHandlerBoundToURL,
  precacheAndRoute,
  cleanupOutdatedCaches
} from 'workbox-precaching'
import { registerRoute, NavigationRoute } from 'workbox-routing'
import { NetworkFirst, CacheFirst } from 'workbox-strategies'
import { clientsClaim } from 'workbox-core'

declare let self: ServiceWorkerGlobalScope

self.addEventListener('message', async (event) => {
  if (!event.data) {
    return
  }

  if (
    typeof event.data === 'object' &&
    event.data.hasOwnProperty('minioUrls')
  ) {
    await removeCache(event.data.minioUrls)
    return
  }
})

/* eslint-disable-next-line no-restricted-globals */
precacheAndRoute(self.__WB_MANIFEST as PrecacheEntry[])

cleanupOutdatedCaches()

/*
 * As the config file can change after the app is built, we cannot precache it
 * as we do with other assets. Instead, we use the NetworkFirst strategy that
 * tries to load the file, but falls back to the cached version. This version is updated
 * when a new version is succesfully loaded.
 * https://developers.google.com/web/tools/workbox/modules/workbox-strategies#network_first_network_falling_back_to_cache
 */

// This caches the config files fetched from country config
registerRoute(/http(.+)config\.js$/, new NetworkFirst())
// This caches validations fetched from country config
registerRoute(/http(.+)validation\.js$/, new NetworkFirst())
// This caches config fetched from the config microservice
registerRoute(/http(.+)config$/, new NetworkFirst())

// This caches the minio urls
registerRoute(
  import.meta.env.DEV
    ? /http(.+)localhost:3535\/ocrvs\/.+/
    : /http(.+)minio\.(.+)\/ocrvs\/.+/,
  new CacheFirst()
)

/*
 *   Alternate for navigateFallback & navigateFallbackBlacklist
 */
registerRoute(
  new NavigationRoute(createHandlerBoundToURL('/index.html'), {
    ...(import.meta.env.DEV && { allowlist: [/^\/$/] }),
    denylist: [/^\/__.*$/]
  })
)

self.skipWaiting()
clientsClaim()

const removeCache = async (minioUrls: string) => {
  const runTimeCacheKey = (await caches.keys()).find((e) =>
    e.includes('workbox-runtime')
  )
  if (!runTimeCacheKey) {
    return
  }
  const runtimecache = await caches.open(runTimeCacheKey)
  for (const minioUrl of minioUrls) {
    const cacheDeletionSuccess = await runtimecache.delete(minioUrl)
    // eslint-disable-next-line no-console
    console.log(`Deleted cache for ${minioUrl} : ${cacheDeletionSuccess}`)
  }
}

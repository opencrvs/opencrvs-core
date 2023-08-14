/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import {
  PrecacheEntry,
  createHandlerBoundToURL,
  precacheAndRoute
} from 'workbox-precaching'
import { registerRoute, NavigationRoute } from 'workbox-routing'
import { Queue } from 'workbox-background-sync'
import { NetworkFirst, CacheFirst } from 'workbox-strategies'
import { RouteHandler, skipWaiting } from 'workbox-core'

interface OnSyncCallbackOptions {
  queue: Queue
}
interface OnSyncCallback {
  (options: OnSyncCallbackOptions): void | Promise<void>
}

const callback = (requestArray: any[]) => {
  let requestSynced = 0
  requestArray.forEach((item) => {
    if (!item.error) {
      requestSynced++
    }
  })

  if (requestSynced > 0) {
    new BroadcastChannel('backgroundSynBroadCastChannel').postMessage(
      requestSynced
    )
  }
}

const queue = new Queue('registerQueue', {
  onSync: callback as unknown as OnSyncCallback
})
const GraphQLMatch = /graphql(\S+)?/

/* eslint-disable-next-line no-restricted-globals */
self.addEventListener('fetch', (event: any) => {
  if (
    null !== event.request.url.match(GraphQLMatch) &&
    navigator.onLine === false
  ) {
    const promiseChain = fetch(event.request.clone()).catch((err) => {
      return queue.pushRequest(event.request)
    })

    event.waitUntil(promiseChain)
  }
})

/* eslint-disable-next-line no-restricted-globals */
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

  switch (event.data) {
    case 'skipWaiting':
      // About caches variable: https://developer.mozilla.org/en-US/docs/Web/API/CacheStorage/delete
      caches
        .keys()
        .then((cs) => cs.forEach((c) => caches.delete(c)))
        .then(() => skipWaiting())
      break
    default:
      break
  }
})

/* eslint-disable-next-line no-restricted-globals */
precacheAndRoute(self.__WB_MANIFEST as PrecacheEntry[])

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
registerRoute(/https(.+)minio\.(.+)\/ocrvs\/+/, new CacheFirst())

/*
 *   Alternate for navigateFallback & navigateFallbackBlacklist
 */
registerRoute(
  new NavigationRoute(createHandlerBoundToURL('/index.html'), {
    denylist: [/^\/__.*$/]
  })
)

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
    console.log(`Deleted cache for ${minioUrl} : ${cacheDeletionSuccess}`)
  }
}

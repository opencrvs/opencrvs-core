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
import { WorkboxPlugin } from 'workbox-core/types'
import { S3_URL_REGEX } from '@opencrvs/commons/client'

// "App shell" = the SPA's index.html, served for any unmatched route. True
// if a document's URL got poisoned with that HTML instead of the real file.
function isAppShellResponse(response: Response) {
  return (response.headers.get('content-type') ?? '').startsWith('text/html')
}

self.__WB_DISABLE_DEV_LOGS = true

declare let self: ServiceWorkerGlobalScope

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

precacheAndRoute(self.__WB_MANIFEST as PrecacheEntry[])

cleanupOutdatedCaches()

/*
 * As the config file can change after the app is built, we cannot precache it
 * as we do with other assets. Instead, we use the NetworkFirst strategy that
 * tries to load the file, but falls back to the cached version. This version is updated
 * when a new version is successfully loaded.
 * https://developers.google.com/web/tools/workbox/modules/workbox-strategies#network_first_network_falling_back_to_cache
 */

// This caches the config files fetched from country config
registerRoute(/http(.+)config\.js$/, new NetworkFirst())
// This caches the certificate config file fetched from country config
registerRoute(/http(.+)certificate-configuration$/, new NetworkFirst())
// This caches font files fetched from country config. On a slow connection, the
// cached font is used after 3 seconds, so that certificates do not wait for the network.
// The font responses vary by origin, and the preview and the PDF request the fonts
// with different headers. The cache ignores Vary, so that both match the cached font.
registerRoute(
  /http(.+)fonts\/.*\.ttf$/,
  new NetworkFirst({
    networkTimeoutSeconds: 3,
    matchOptions: { ignoreVary: true }
  })
)
// This caches validations fetched from country config
registerRoute(/http(.+)validators\.js$/, new NetworkFirst())
// This caches handlebars fetched from country config
registerRoute(/http(.+)handlebars\.js$/, new NetworkFirst())
// This caches conditionals fetched from country config
registerRoute(/http(.+)conditionals\.js$/, new NetworkFirst())
// This caches config fetched from the config microservice
registerRoute(/http(.+)config$/, new NetworkFirst())
// This caches certificates fetched from the countryconfig microservice
registerRoute(/api\/countryconfig\/certificates/, new NetworkFirst())
// This caches the country logo that the loading screens show
registerRoute(/api\/countryconfig\/content\/country-logo$/, new NetworkFirst())

// Refuses to cache an app-shell response under a document's URL, and drops one already cached.
const documentsOnly: WorkboxPlugin = {
  cacheWillUpdate: async ({ response }) =>
    isAppShellResponse(response) ? null : response,

  // Repairs entries poisoned by an earlier version: dropping the entry and
  // returning nothing makes CacheFirst fall through to the network.
  cachedResponseWillBeUsed: async ({ cachedResponse, cacheName, request }) => {
    if (!cachedResponse || !isAppShellResponse(cachedResponse)) {
      return cachedResponse
    }

    const cache = await caches.open(cacheName)
    // eslint-disable-next-line no-console
    console.log('deleting app-shell response from cache')
    await cache.delete(request)

    return undefined
  }
}

// This caches the document urls served by the object store
registerRoute(S3_URL_REGEX, new CacheFirst({ plugins: [documentsOnly] }))

/*
 *   Alternate for navigateFallback & navigateFallbackBlacklist
 */
registerRoute(
  new NavigationRoute(createHandlerBoundToURL('/index.html'), {
    ...(import.meta.env.DEV && { allowlist: [/^\/$/] }),
    // /login and /register are other apps: login and its redirect to the client. On a single domain
    // they share the origin of the client, so the service worker must leave them to the network.
    denylist: [/^\/__.*$/, /^\/login/, /^\/register/]
  })
)

self.skipWaiting()
clientsClaim()

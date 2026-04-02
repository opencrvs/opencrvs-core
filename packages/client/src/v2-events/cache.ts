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

import { DocumentPath } from '@opencrvs/commons/client'

/* Must match the one defined src-sw.ts */
export const CACHE_NAME = 'workbox-runtime'

/**
 * Converts a DocumentPath to an absolute URL suitable for use in `src` attributes,
 * `fetch()` calls, and other URL contexts in the browser.
 *
 * DocumentPath is a bucket-relative path (e.g. "events/eventId/file.jpg").
 * Browsers resolve relative URLs against the current page URL, which would be incorrect.
 * Files are stored in the service worker cache under their absolute path (with a leading "/"),
 * so rendering must use the same form to get a cache hit from the service worker.
 *
 * @see cacheFile — stores files under the same normalized URL format.
 */
export function toFileUrl(path: DocumentPath): string {
  return path.startsWith('/') ? path : `/${path}`
}

/**
 * Sets file to **BROWSER** cache with given filename.
 * Normalizes url to an absolute path (prepends / if missing).
 * @see CACHE_NAME
 */
export async function cacheFile({ url, file }: { url: string; file: File }) {
  const normalizedUrl = url.startsWith('/') ? url : `/${url}`
  const temporaryBlob = new Blob([file], { type: file.type })
  const cacheKeys = await caches.keys()

  const cacheKey = cacheKeys.find((key) => key.startsWith(CACHE_NAME))

  if (!cacheKey) {
    // eslint-disable-next-line no-console
    console.error(
      `Cache ${CACHE_NAME} not found. Is service worker running properly?`
    )
    return
  }

  const cache = await caches.open(cacheKey)

  return cache.put(
    normalizedUrl,
    new Response(temporaryBlob, { headers: { 'Content-Type': file.type } })
  )
}

/**
 * Removes given file from the **BROWSER** cache.
 * Normalizes the path to an absolute URL (prepends / if missing).
 * @see CACHE_NAME
 */
export async function removeCached(filename: DocumentPath) {
  const normalizedUrl = filename.startsWith('/') ? filename : `/${filename}`
  const cacheKeys = await caches.keys()
  const cacheKey = cacheKeys.find((key) => key.startsWith(CACHE_NAME))

  if (!cacheKey) {
    // eslint-disable-next-line no-console
    console.error(
      `Cache ${CACHE_NAME} not found. Is service worker running properly?`
    )
    return
  }

  const cache = await caches.open(cacheKey)
  return cache.delete(normalizedUrl, {
    ignoreSearch: true
  })
}

export async function ensureCacheExists(cacheName: string) {
  const cacheNames = await caches.keys()
  if (!cacheNames.includes(cacheName)) {
    await caches.open(cacheName)
    // eslint-disable-next-line no-console
    console.log(`Cache "${cacheName}" created.`)
  } else {
    // eslint-disable-next-line no-console
    console.log(`Cache "${cacheName}" already exists.`)
  }
}

export async function getCache(cacheName: string) {
  const cacheKeys = await caches.keys()
  const cacheKey = cacheKeys.find((key) => key === cacheName)

  if (!cacheKey) {
    throw new Error(
      `Cache ${cacheName} not found. Is service worker running properly?`
    )
  }

  return caches.open(cacheKey)
}

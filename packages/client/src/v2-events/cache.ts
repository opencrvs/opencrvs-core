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

import { DocumentPath, FullDocumentPath } from '@opencrvs/commons/client'
import { isExpectedAccessError, trpcClient } from '@client/v2-events/trpc'

/* Must match the one defined src-sw.ts */
export const CACHE_NAME = 'workbox-runtime'

/**
 * Converts a DocumentPath to an absolute URL suitable for use in `src` attributes,
 * `fetch()` calls, and other URL contexts in the browser.
 *
 * DocumentPath is a relative path (e.g. "events/eventId/file.jpg").
 * Browsers resolve relative URLs against the current page URL, which would be incorrect.
 * Files are stored in the service worker cache under their absolute path (with a leading "/"),
 * so rendering must use the same form to get a cache hit from the service worker.
 *
 * @see cacheFile — stores files under the same normalized URL format.
 */
export function toFileUrl(path: DocumentPath): string {
  return path.startsWith('/') ? path : `/${path}`
}

// "App shell" = the SPA's index.html, served for any unmatched route. True
// if a document's URL got poisoned with that HTML instead of the real file.
export function isAppShellResponse(response: Response) {
  return (response.headers.get('content-type') ?? '').startsWith('text/html')
}

export async function fetchFileFromUrl(
  externalUrl: string,
  filename: string
): Promise<File | undefined> {
  const res = await fetch(externalUrl)

  if (!res.ok) {
    // eslint-disable-next-line no-console
    console.error(
      `Failed to fetch file from URL: ${externalUrl}. Status: ${res.status} ${res.statusText}`
    )

    return undefined
  }

  const blob = await res.blob()

  return new File([blob], filename, { type: blob.type })
}

/**
 *
 * @returns global file cache.
 */
async function findFileCache() {
  const cacheKeys = await caches.keys()
  const cacheKey = cacheKeys.find((key) => key.startsWith(CACHE_NAME))

  if (!cacheKey) {
    // eslint-disable-next-line no-console
    console.error(
      `Cache ${CACHE_NAME} not found. Is service worker running properly?`
    )
    return null
  }

  return caches.open(cacheKey)
}

/**
 * Sets file to **BROWSER** cache with given filename.
 * Normalizes url to an absolute path (prepends / if missing).
 * @see CACHE_NAME
 */
export async function cacheFile(
  { url, file }: { url: string; file: File },
  cache?: Cache
) {
  const normalizedUrl = toFileUrl(url as DocumentPath)
  const temporaryBlob = new Blob([file], { type: file.type })

  const cachetoUse = cache ?? (await findFileCache())

  return cachetoUse?.put(
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
  const normalizedUrl = toFileUrl(filename)

  const cache = await findFileCache()

  return cache?.delete(normalizedUrl, {
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

function getPresignedUrl(filePath: DocumentPath | FullDocumentPath) {
  return trpcClient.event.file.getPresignedUrl.query({ filePath })
}

/**
 *
 * returns already cached file urls in absolute format.
 */
async function getCachedUrls(cache: Cache) {
  const requests = await cache.keys()
  return new Set(requests.map((req) => req.url))
}

/**
 * precaches file and always fetches the presigned url. Useful in manual retries.
 * @see precacheFiles for "intelligent" fetching.
 */
export async function precacheFile(
  path: DocumentPath | FullDocumentPath,
  cache?: Cache
) {
  try {
    const presignedUrl = (await getPresignedUrl(path)).presignedURL
    const file = await fetchFileFromUrl(presignedUrl, path)

    if (file) {
      await cacheFile({ url: path, file }, cache)
    }
  } catch (error) {
    if (!isExpectedAccessError(error)) {
      // eslint-disable-next-line no-console
      console.warn('Failed to precache file', error)
    }
  }
}

function toAbsoluteUrl(url: string) {
  return new URL(url, window.location.origin).href
}

/**
 * Precache files that are not found in cache already, avoiding unnecessary calls and inserts.
 * @see precacheFile for undiscriminated fetching and re-caching.
 */
export async function precacheFiles(
  paths: (DocumentPath | FullDocumentPath)[]
) {
  if (paths.length === 0) {
    return
  }

  const cache = await findFileCache()

  if (!cache) {
    return
  }

  const cachedUrls = await getCachedUrls(cache)

  const missingFiles = paths.filter(
    (path) => !cachedUrls.has(toAbsoluteUrl(path))
  )

  await Promise.all(missingFiles.map(async (path) => precacheFile(path, cache)))
}

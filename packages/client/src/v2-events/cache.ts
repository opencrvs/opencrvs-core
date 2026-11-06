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
  DocumentPath,
  FullDocumentPath,
  parseDocumentPath,
  UUID
} from '@opencrvs/commons/client'
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

/**
 * The record or user whose files are signed together. The server signs every
 * file the owner names in one call, keyed by the path it stores.
 */
export type FileOwner = { eventId: UUID } | { userId: UUID }

async function presignOwnerFiles(
  owner: FileOwner
): Promise<Record<string, string>> {
  if ('eventId' in owner) {
    return await trpcClient.event.files.presign.query({
      eventId: owner.eventId
    })
  }

  return await trpcClient.user.files.presign.query({ userIds: [owner.userId] })
}

/**
 * The owner named by an `events/{eventId}/` or `users/{userId}/` path. A
 * pre-2.0 key names neither, so it can only be cached with its record.
 */
function getFileOwner(path: string): FileOwner | undefined {
  const file = parseDocumentPath(path)

  if (file?.kind === 'event') {
    return { eventId: file.eventId }
  }

  if (file?.kind === 'user') {
    return { userId: file.userId }
  }

  return undefined
}

/**
 *
 * returns already cached file urls in absolute format.
 */
async function getCachedUrls(cache: Cache) {
  const requests = await cache.keys()
  return new Set(requests.map((req) => req.url))
}

function toAbsoluteUrl(url: string) {
  return new URL(url, window.location.origin).href
}

/**
 * Downloads each path from its presigned URL and caches it under the path.
 * Paths the server didn't sign are skipped.
 */
async function cachePresigned(
  urls: Record<string, string>,
  paths: string[],
  cache?: Cache
) {
  await Promise.all(
    paths.map(async (path) => {
      const presignedUrl = urls[path] as string | undefined

      if (!presignedUrl) {
        return
      }

      const file = await fetchFileFromUrl(presignedUrl, path)

      if (file) {
        await cacheFile({ url: path, file }, cache)
      }
    })
  )
}

function warnUnlessExpected(error: unknown) {
  if (!isExpectedAccessError(error)) {
    // eslint-disable-next-line no-console
    console.warn('Failed to precache file', error)
  }
}

/**
 * Re-signs and caches one file, even if it is cached already. Useful in
 * manual retries. The file is signed through the record or user its path
 * names; a path that names neither is left as it is.
 * @see precacheFiles for "intelligent" fetching.
 */
export async function precacheFile(path: DocumentPath | FullDocumentPath) {
  const owner = getFileOwner(path)

  if (!owner) {
    return
  }

  try {
    await cachePresigned(await presignOwnerFiles(owner), [path])
  } catch (error) {
    warnUnlessExpected(error)
  }
}

/**
 * Precaches the owner's files that are not cached already, signing them in
 * one call, and only when at least one is missing.
 * @see precacheFile for undiscriminated fetching and re-caching.
 */
export async function precacheFiles(
  paths: (DocumentPath | FullDocumentPath)[],
  owner: FileOwner
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

  if (missingFiles.length === 0) {
    return
  }

  try {
    await cachePresigned(await presignOwnerFiles(owner), missingFiles, cache)
  } catch (error) {
    warnUnlessExpected(error)
  }
}

/**
 * Precaches the files of several users (e.g. a list's avatars) that are not
 * cached already, signing them in one call.
 */
export async function precacheUserFiles(userIds: UUID[]) {
  if (userIds.length === 0) {
    return
  }

  const cache = await findFileCache()

  if (!cache) {
    return
  }

  try {
    const urls = await trpcClient.user.files.presign.query({ userIds })
    const cachedUrls = await getCachedUrls(cache)
    const missingFiles = Object.keys(urls).filter(
      (path) => !cachedUrls.has(toAbsoluteUrl(path))
    )

    await cachePresigned(urls, missingFiles, cache)
  } catch (error) {
    warnUnlessExpected(error)
  }
}

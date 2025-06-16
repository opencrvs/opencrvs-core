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

/* Must match the one defined src-sw.ts */
export const CACHE_NAME = 'workbox-runtime'

function withPostfix(str: string, postfix: string) {
  if (str.endsWith(postfix)) {
    return str
  }

  return str + postfix
}

/**
 * Files are stored in MinIO. Files should be accessed via unsigned URLs, utilizing browser cache and aggressively precaching them.
 * @returns unsigned URL to the file in MinIO. Assumes file has been cached.
 */
export function getUnsignedFileUrl(filename: string) {
  const minioURL = window.config.MINIO_URL
  if (minioURL && typeof minioURL === 'string') {
    return new URL(filename, withPostfix(minioURL, '/')).toString()
  }

  throw new Error('MINIO_URL is not defined')
}

/**
 * Sets file to **BROWSER** cache with given filename
 * @see CACHE_NAME
 */
export async function cacheFile({
  filename,
  file
}: {
  filename: string
  file: File
}) {
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
    getUnsignedFileUrl(filename),
    new Response(temporaryBlob, { headers: { 'Content-Type': file.type } })
  )
}

/**
 * Removes given file from the **BROWSER** cache.
 * @see CACHE_NAME
 */
export async function removeCached(filename: string) {
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
  return cache.delete(getUnsignedFileUrl(filename))
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

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
import { PrecacheController } from 'workbox-precaching'

/**
 * Replaces `PrecacheController.install`, which fetches entries one at a time
 * (https://github.com/GoogleChrome/workbox/issues/2528). The app renders only
 * once the service worker is ready, so on a cold load every round trip of that
 * serial install delays first paint. A small pool keeps the fix for #2528 —
 * no unbounded burst of requests — without paying one round trip per entry.
 * Workbox's dev-only install report is not reproduced.
 */
export async function installPrecache(
  controller: PrecacheController,
  event: ExtendableEvent,
  // Chromium's per-host connection limit over HTTP/1.1.
  concurrency = 6
) {
  const entries = [...controller.getURLsToCacheKeys()]

  const cacheEntry = async ([url, cacheKey]: [string, string]) => {
    const request = new Request(url, {
      integrity: controller.getIntegrityForCacheKey(cacheKey),
      // Mirrors workbox: a revisioned entry carries its revision in the cache
      // key and must bypass the HTTP cache; a hashed URL is its own revision.
      cache: cacheKey === url ? 'default' : 'reload',
      credentials: 'same-origin'
    })
    await Promise.all(
      controller.strategy.handleAll({ params: { cacheKey }, request, event })
    )
  }

  const worker = async () => {
    for (let entry = entries.shift(); entry; entry = entries.shift()) {
      await cacheEntry(entry)
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker))
}

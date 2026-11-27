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
import { Page } from '@playwright/test'

/*
 * Workbox precaches during the service worker's install event, which can land after
 * the page itself has loaded, so poll for a while before concluding there is none.
 */
export async function hasPrecachedBuildAssets(page: Page) {
  const deadline = Date.now() + 30 * 1000

  while (Date.now() < deadline) {
    const precached = await page.evaluate(async () => {
      if (!('caches' in window)) {
        return false
      }

      const cacheNames = await caches.keys()

      for (const cacheName of cacheNames.filter((name) =>
        name.includes('precache')
      )) {
        const cache = await caches.open(cacheName)
        const requests = await cache.keys()

        if (
          requests.some((request) =>
            new URL(request.url).pathname.startsWith('/assets/')
          )
        ) {
          return true
        }
      }

      return false
    })

    if (precached) {
      return true
    }

    await page.waitForTimeout(1000)
  }

  return false
}

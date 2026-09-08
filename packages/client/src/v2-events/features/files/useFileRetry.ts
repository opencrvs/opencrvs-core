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

import { useState } from 'react'
import { DocumentPath } from '@opencrvs/commons/client'
import { removeCached } from '@client/v2-events/cache'
import { precacheFile } from './useFileUpload'

/**
 * Recovery for a document whose <img> failed to load: re-cache the file and
 * render it again. This covers the files disappearing from the cache after the
 * record was rendered, which `useEnsureCachedFiles` cannot see.
 *
 * Spread the result onto the element rendering the file. The URL is deliberately
 * left alone — the service worker cache is keyed by it, so a cache-busting query
 * string would turn every retry into a guaranteed miss. Remounting the element,
 * once the file is back in the cache, is what makes the browser ask again.
 */
export function useFileRetry() {
  const [attempts, setAttempts] = useState<Record<string, number>>({})

  return function retryProps(path: DocumentPath) {
    const attempt = attempts[path] ?? 0

    return {
      key: `${path}-${attempt}`,
      onError: () => {
        // One attempt per file: a file the server no longer has must not loop.
        if (attempt > 0) {
          return
        }

        void (async () => {
          try {
            // A poisoned entry has to go before `precacheFile` can replace it.
            await removeCached(path)
            await precacheFile(path)
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error(`Failed to re-cache ${path}`, error)
          } finally {
            // Last, so the element remounts against a warm cache.
            setAttempts((current) => ({ ...current, [path]: attempt + 1 }))
          }
        })()
      }
    }
  }
}

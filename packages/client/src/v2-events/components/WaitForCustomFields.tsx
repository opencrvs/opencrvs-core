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
import React from 'react'
import { LoadingBar } from '@opencrvs/components'
import { preloadCustomFields } from '@client/v2-events/features/events/registered-fields/Custom'
import { queryClient, trpcOptionsProxy } from '@client/v2-events/trpc'

/**
 * The longest time that the app waits for the custom field modules. After
 * this time the app opens, and a field that has not loaded loads when it
 * mounts.
 */
const PRELOAD_TIMEOUT_MS = 15000

let preloaded = false

/**
 * Shows the loading bar until the custom field modules of all events are
 * loaded. Thus, when the app opens, the forms work also if the user then goes
 * offline. A module that does not load does not stop the app: only that field
 * shows an error.
 */
export function WaitForCustomFields({
  children
}: {
  children: React.ReactNode
}) {
  const [ready, setReady] = React.useState(preloaded)

  React.useEffect(() => {
    if (preloaded) {
      return
    }

    let cancelled = false
    const open = () => {
      if (!cancelled) {
        setReady(true)
      }
    }
    const timeout = setTimeout(open, PRELOAD_TIMEOUT_MS)

    void queryClient
      .ensureQueryData(trpcOptionsProxy.event.config.get.queryOptions())
      .then(preloadCustomFields)
      .then(() => {
        preloaded = true
      })
      .catch((error: unknown) => {
        // The config did not load. The pages that use it show their own error.
        // eslint-disable-next-line no-console
        console.warn('Could not preload custom fields:', error)
      })
      .finally(() => {
        clearTimeout(timeout)
        open()
      })

    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [])

  if (!ready) {
    return <LoadingBar />
  }

  return <>{children}</>
}

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
import { useSuspenseQuery } from '@tanstack/react-query'
import {
  findCustomFieldSources,
  preloadCustomFields
} from '@client/v2-events/features/events/registered-fields/Custom'
import { useVersionedEventConfigurations } from '@client/v2-events/features/events/useEventConfiguration'

/**
 * The longest time that the preload waits for the modules. After this time
 * the component renders, and a field that has not loaded loads when it mounts.
 */
const PRELOAD_TIMEOUT_MS = 15000

/**
 * Loads the custom field modules of all events, and suspends until they are
 * loaded. The workqueue layout calls it, as it reads the event configuration.
 * Thus, when the user sees the workqueue, the forms work also if the user then
 * goes offline. A module that does not load does not stop the render: only that
 * field shows an error.
 */
export function usePreloadCustomFields() {
  const sources = findCustomFieldSources(useVersionedEventConfigurations())

  useSuspenseQuery({
    queryKey: ['customFieldModules', sources],
    queryFn: async () => {
      let timeout: ReturnType<typeof setTimeout> | undefined
      await Promise.race([
        preloadCustomFields(sources),
        new Promise((resolve) => {
          timeout = setTimeout(resolve, PRELOAD_TIMEOUT_MS)
        })
      ])
      clearTimeout(timeout)
      return sources
    },
    staleTime: Infinity,
    retry: false,
    // The service worker cache serves the modules also when the device is offline
    networkMode: 'always',
    // The modules stay in memory. The service worker caches the files.
    meta: { noCache: true }
  })
}

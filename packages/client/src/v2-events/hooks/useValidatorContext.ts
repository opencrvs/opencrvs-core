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

import { useMemo } from 'react'
import {
  EventConfig,
  EventDocument,
  EventValidatorContext,
  getEventValidatorContext,
  getOrThrow,
  ValidatorContext
} from '@opencrvs/commons/client'
import { useAuthentication } from '../../utils/userUtils'
import { useEventConfigurations } from '../features/events/useEventConfiguration'
import { useSuspenseGetLeafAdministrativeAreaIds } from './useAdministrativeAreas'

/**
 * Private hook for reading user details. Since the user is authenticated, we can assume the token is valid, and some other process throws an error when it becomes invalid.
 * NOTE: Without memoization, this will decode the token on every call, running the application to a halt.
 * decoding token is synchronous process, which blocks the main thread for a very short time. Since this is called all-around the app, it cascades.
 */
function useUser() {
  const maybeAuth = useAuthentication()

  return useMemo(
    () => getOrThrow(maybeAuth, 'Token payload missing. User is not logged in'),
    [maybeAuth]
  )
}

export function resolveEventValidatorContext(
  configs: EventConfig[],
  event?: EventDocument
): EventValidatorContext | undefined {
  const eventConfig = configs.find((c) => c.id === event?.type)

  if (!event || !eventConfig) {
    return undefined
  }

  return getEventValidatorContext(event, eventConfig)
}

export function useValidatorContext(event?: EventDocument): ValidatorContext {
  const leafAdminStructureLocationIds =
    useSuspenseGetLeafAdministrativeAreaIds()
  const user = useUser()
  const configs = useEventConfigurations()

  /**
   * Aggregating the action history is expensive and conditionals are evaluated
   * per field, per conditional type — so compute it once per (event, config).
   */
  const eventContext = useMemo(
    () => resolveEventValidatorContext(configs, event),
    [event, configs]
  )

  return {
    user,
    leafAdminStructureLocationIds,
    event: eventContext
  }
}

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
  ActionConditionalContext,
  ActionFormConditionalContext,
  EventConfig,
  EventDocument,
  EventIndex,
  getOrThrow,
  UserConditionalContext
} from '@opencrvs/commons/client'
import { useAuthentication } from '../../utils/userUtils'
import { EventlessFormConditionalContext } from '../components/forms/formConditionalContext'
import { useSuspenseGetLeafAdministrativeAreaIds } from './useAdministrativeAreas'

/**
 * Returns the user of the session. The user is authenticated, so the token is valid. Another process throws an error when the token becomes invalid.
 * NOTE: The hook memoizes the result. Without memoization, it decodes the token on each call.
 * Decoding the token is synchronous and blocks the main thread for a short time. The app calls this hook in many places, so the time adds up.
 */
export function useUser(): UserConditionalContext {
  const maybeAuth = useAuthentication()

  return useMemo(
    () => getOrThrow(maybeAuth, 'Token payload missing. User is not logged in'),
    [maybeAuth]
  )
}

/**
 * Returns the context for conditionals in a form that has no event, e.g. the user form or the advanced search form.
 */
export function useEventlessFormConditionalContext(): EventlessFormConditionalContext {
  const user = useUser()
  const leafAdminStructureLocationIds =
    useSuspenseGetLeafAdministrativeAreaIds()

  return useMemo(
    () => ({ user, leafAdminStructureLocationIds }),
    [user, leafAdminStructureLocationIds]
  )
}

/**
 * Returns the context for conditionals in the form of an action: field visibility, field validation and page visibility.
 * @param event the event that the user performs the action on.
 * @param eventConfig the configuration of the version that the event was created under.
 */
export function useActionFormConditionalContext(
  event: EventDocument,
  eventConfig: EventConfig
): ActionFormConditionalContext {
  const eventlessContext = useEventlessFormConditionalContext()

  return useMemo(
    () => ({ ...eventlessContext, eventDocument: event, eventConfig }),
    [eventlessContext, event, eventConfig]
  )
}

/**
 * The event that an action conditional reads: the event document with its configuration, or the event index.
 * The type does not allow both.
 */
type ActionConditionalEvent =
  | {
      /** The event document, when the event is downloaded. */
      eventDocument: EventDocument
      /** The configuration of the version that the event was created under. */
      eventConfig: EventConfig
      eventIndex?: never
    }
  | {
      /** The event index from the server. Do not change it. Put changed values in the form. */
      eventIndex: EventIndex
      eventDocument?: never
      eventConfig?: never
    }

/**
 * Returns the context for action conditionals: whether an action is visible or enabled.
 * Give the event document when the event is downloaded. Otherwise give the event index.
 */
export function useActionConditionalContext({
  eventDocument,
  eventConfig,
  eventIndex
}: ActionConditionalEvent): ActionConditionalContext {
  const user = useUser()

  return useMemo(() => {
    if (eventIndex) {
      return { eventIndex, user }
    }

    // The type makes sure that the event document comes with its configuration.
    return {
      eventDocument: getOrThrow(eventDocument, 'The event document is missing'),
      eventConfig: getOrThrow(
        eventConfig,
        'The event configuration is missing'
      ),
      user
    }
  }, [eventIndex, eventDocument, eventConfig, user])
}

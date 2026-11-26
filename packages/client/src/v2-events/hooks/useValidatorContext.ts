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
  ActionFormConditionalContext,
  ActionUpdate,
  EventConfig,
  EventDocument,
  EventIndex,
  EventValidatorContext,
  FormValues,
  getEventValidatorContext,
  getOrThrow,
  ValidatorContext
} from '@opencrvs/commons/client'
import { useAuthentication } from '../../utils/userUtils'
import { useEventConfigurationResolver } from '../features/events/useEventConfiguration'
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

/**
 * @param findEventConfiguration gives the configuration of the version `event` was
 * created under.
 */
export function resolveEventValidatorContext(
  findEventConfiguration: (record: EventDocument) => EventConfig | undefined,
  event?: EventDocument
): EventValidatorContext | undefined {
  const eventConfig = event && findEventConfiguration(event)

  if (!event || !eventConfig) {
    return undefined
  }

  return getEventValidatorContext(event, eventConfig)
}

/**
 * TODO: Pass `FormValues` and `ActionFormConditionalContext` through the components, and remove these two functions. https://github.com/opencrvs/opencrvs-core/issues/14485
 */
export function toFormValues(
  values: ActionUpdate,
  context: ValidatorContext
): FormValues {
  // `baseFormState` holds values that the conditionals read in addition to the form values.
  // We are deprecating baseFormState in favor of typed contexts.
  return context.baseFormState === undefined
    ? { declaration: values }
    : { declaration: context.baseFormState, annotation: values }
}

/**
 * TODO: Some forms have no event, e.g. the user form. Remove the cast when we have client specific context for forms without an event. https://github.com/opencrvs/opencrvs-core/issues/14485
 */
export function getFormConditionalContext(
  context: ValidatorContext,
  eventIndex?: Pick<EventIndex, 'flags' | 'status' | 'declaration'>
): ActionFormConditionalContext {
  const conditionalContext = {
    eventDocument: context.event?.document,
    eventIndex: eventIndex ??
      context.event?.state ?? {
        flags: [],
        status: undefined,
        declaration: {}
      },
    user: context.user,
    leafAdminStructureLocationIds: context.leafAdminStructureLocationIds ?? []
  }
  /** TODO: Remove casting */
  return conditionalContext as unknown as ActionFormConditionalContext
}

export function useValidatorContext(event?: EventDocument): ValidatorContext {
  const leafAdminStructureLocationIds =
    useSuspenseGetLeafAdministrativeAreaIds()
  const user = useUser()
  const findEventConfiguration = useEventConfigurationResolver()

  /**
   * Aggregating the action history is expensive and conditionals are evaluated
   * per field, per conditional type — so compute it once per (event, config).
   */
  const eventContext = useMemo(
    () => resolveEventValidatorContext(findEventConfiguration, event),
    [event, findEventConfiguration]
  )

  return {
    user,
    leafAdminStructureLocationIds,
    event: eventContext
  }
}

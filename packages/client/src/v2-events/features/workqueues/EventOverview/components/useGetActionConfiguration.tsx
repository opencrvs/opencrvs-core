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
import { CtaActionType, EventIndex } from '@opencrvs/commons/client'
import { useActionConfigurationResolver } from './useActionConfigResolver'

/**
 * Given an event and action type, returns the configuration for the action item.
 * Used to determine CTA button state for search result rows.
 */
export function useGetActionConfiguration(
  event: EventIndex,
  actionType: CtaActionType
) {
  const { resolveAction } = useActionConfigurationResolver(event)
  return resolveAction(actionType)
}

/**
 *
 * @returns array of action menu item configurations.
 * Excludes 'READ' action as it's used for the CTA button and not the dropdown menu.
 */
export function useGetActionMenuConfigurations(event: EventIndex) {
  const { resolveAction, modals } = useActionConfigurationResolver(event)
  const actions = useMemo(
    () => CtaActionType.exclude(['READ']).options.map(resolveAction),
    [resolveAction]
  )

  return { modals, actions }
}

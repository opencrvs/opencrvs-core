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
import React, { useMemo } from 'react'
import { ActionType, EventIndex } from '@opencrvs/commons/client'
import { ActionMenuItem } from './utils'
import { useGetActionMenuActionConfigurations } from './useGetActionConfiguration'

/**
 *
 * @returns a tuple containing modals (which must be rendered in the parent where this hook is called)
 *  and a list of action menu items based on the event state and scopes provided.
 */
export function useAllowedActionConfigurations(
  event: EventIndex
): [React.ReactNode, ActionMenuItem[]] {
  const { modals, actions } = useGetActionMenuActionConfigurations(event)

  const visibleActions = useMemo(
    () => actions.filter((action) => !action.hidden),
    [actions]
  )

  return [modals, visibleActions]
}

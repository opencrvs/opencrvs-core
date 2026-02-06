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
import { useSelector } from 'react-redux'
import { useMemo } from 'react'
import {
  ActionType,
  ClientSpecificAction,
  isActionInScope
} from '@opencrvs/commons/client'
import { getScope } from '@client/profile/profileSelectors'

const ALL_ACTIONS = [
  ...Object.values(ActionType),
  ...Object.values(ClientSpecificAction)
]

export function useUserAllowedActions(eventType: string) {
  const scopes = useSelector(getScope)
  const allowedActions = useMemo(
    () =>
      ALL_ACTIONS.filter((action) =>
        isActionInScope(scopes ?? [], action, eventType)
      ),
    [scopes, eventType]
  )

  return {
    allowedActions,
    isActionAllowed: (action: ActionType | ClientSpecificAction) =>
      allowedActions.includes(action)
  }
}

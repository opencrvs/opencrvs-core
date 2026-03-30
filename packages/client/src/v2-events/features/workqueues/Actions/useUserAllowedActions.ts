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
import { useSelector } from 'react-redux'
import {
  ActionType,
  ClientSpecificAction,
  DisplayableAction,
  EventIndex,
  isActionInScope
} from '@opencrvs/commons/client'
import { getScope } from '@client/profile/profileSelectors'
import { buildEventIndexWithHierarchy } from '@client/v2-events/layouts/EventOverview/utils'
import { useLocations } from '@client/v2-events/hooks/useLocations'
import { useAdministrativeAreas } from '@client/v2-events/hooks/useAdministrativeAreas'
import { useCurrentUser } from '@client/v2-events/hooks/useCurrentUser'

const ALL_ACTIONS = [
  ...Object.values(ActionType),
  ...Object.values(ClientSpecificAction)
]

export function useUserAllowedActions(event: EventIndex) {
  const scopes = useSelector(getScope)
  const { getLocations } = useLocations()
  const locations = getLocations.useSuspenseQuery()
  const { getAdministrativeAreas } = useAdministrativeAreas()
  const administrativeAreas = getAdministrativeAreas.useSuspenseQuery()
  const { currentUser } = useCurrentUser()

  const eventWithHierarchy = buildEventIndexWithHierarchy(event, {
    administrativeAreas,
    locations
  })

  const allowedActions = useMemo(
    () =>
      ALL_ACTIONS.filter((action) =>
        isActionInScope({
          scopes: scopes ?? [],
          action,
          event: eventWithHierarchy,
          currentUser
        })
      ),
    [scopes, eventWithHierarchy, currentUser]
  )

  return {
    allowedActions,
    isActionAllowed: (action: DisplayableAction) =>
      allowedActions.includes(action)
  }
}

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
import {
  getAcceptedScopesByType,
  RecordScopeTypeV2,
  userCanAccessEventWithScopes
} from '@opencrvs/commons/client'
import { getScope } from '@client/profile/profileSelectors'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { buildEventIndexWithHierarchy } from '@client/v2-events/layouts/EventOverview/utils'
import { useAdministrativeAreas } from './useAdministrativeAreas'
import { useCurrentUser } from './useCurrentUser'
import { useLocations } from './useLocations'

/**
 * Checks whether the current user's scopes allow access to a given event.
 *
 * Resolves the event's location fields into administrative hierarchies and
 * evaluates each matching scope against the event and user context.
 * Returns true if any scope grants access.
 */
export function useCanAccessEventWithScopes(
  eventId: string,
  scopeTypes: RecordScopeTypeV2[]
): boolean {
  const scopes = useSelector(getScope)
  const { getLocations } = useLocations()
  const locations = getLocations.useSuspenseQuery()
  const { getAdministrativeAreas } = useAdministrativeAreas()
  const administrativeAreas = getAdministrativeAreas.useSuspenseQuery()
  const currentUser = useCurrentUser()

  const { searchEventById } = useEvents()
  const eventResults = searchEventById.useSuspenseQuery(eventId)
  const event = eventResults.results[0]

  const matchingScopes = getAcceptedScopesByType({
    acceptedScopes: scopeTypes,
    scopes: scopes ?? []
  })

  const eventWithHierarchy = buildEventIndexWithHierarchy(event, {
    administrativeAreas,
    locations
  })

  return userCanAccessEventWithScopes(eventWithHierarchy, matchingScopes, {
    id: currentUser.id,
    primaryOfficeId: currentUser.primaryOfficeId,
    administrativeAreaId: currentUser.administrativeAreaId ?? null,
    role: currentUser.role,
    signature: currentUser.signature,
    type: currentUser.type
  })
}

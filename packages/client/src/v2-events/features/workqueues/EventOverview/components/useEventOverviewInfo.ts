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
import { getOrThrow, EventIndex, EventDocument } from '@opencrvs/commons/client'
import { useAuthentication } from '@client/utils/userUtils'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { AssignmentStatus, getAssignmentStatus } from '@client/v2-events/utils'

type EventOverviewInfo =
  | {
      eventIndex: EventIndex
      fullEvent: EventDocument
      shouldShowFullOverview: true
    }
  | {
      eventIndex: EventIndex
      fullEvent: EventDocument | undefined
      shouldShowFullOverview: false
    }

export function useEventOverviewInfo(eventId: string): EventOverviewInfo {
  const { searchEventById, getEvent } = useEvents()
  const fullEvent = getEvent.useFindEventFromCache(eventId).data

  const maybeAuth = useAuthentication()
  const auth = getOrThrow(
    maybeAuth,
    'Authentication is not available but is required'
  )

  const getEventQuery = searchEventById.useQuery(eventId)
  const eventIndex = getEventQuery.data?.results[0]

  if (!eventIndex) {
    throw new Error('Record not found')
  }

  const assignmentStatus = getAssignmentStatus(eventIndex, auth.sub)
  const shouldShow =
    fullEvent !== undefined &&
    assignmentStatus === AssignmentStatus.ASSIGNED_TO_SELF

  if (shouldShow) {
    return {
      eventIndex,
      fullEvent, // EventDocument
      shouldShowFullOverview: true
    }
  }

  return {
    eventIndex,
    fullEvent, // EventDocument | undefined
    shouldShowFullOverview: false
  }
}

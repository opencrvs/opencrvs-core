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
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ROUTES } from '@client/v2-events/routes'
import { createTemporaryId } from '@client/v2-events/utils'
import { getUserDetails } from '@client/profile/profileSelectors'
import { useDrafts } from '@client/v2-events/features/drafts/useDrafts'
import { useEvents } from './useEvents/useEvents'
import { useEventFormData } from './useEventFormData'
import { useActionAnnotation } from './useActionAnnotation'

/**
 * Returns a callback that creates a new event of the given type and navigates
 * straight to its declaration form.
 *
 * This is the behaviour the removed `/events/create` selection page used to run
 * on its "Continue" button; it is now triggered directly from the event type
 * chosen in the `NewEventButton` dropdown.
 */
export function useCreateEvent() {
  const navigate = useNavigate()
  const events = useEvents()
  const createEvent = events.createEvent()
  const user = useSelector(getUserDetails)
  const { setLocalDraft } = useDrafts()
  const clearForm = useEventFormData((state) => state.clear)
  const clearAnnotation = useActionAnnotation((state) => state.clear)

  return function createDeclaration(eventType: string) {
    const transactionId = createTemporaryId()

    // Start the new declaration from a clean slate.
    setLocalDraft(null)
    clearForm()
    clearAnnotation()

    createEvent.mutate({
      type: eventType,
      transactionId,
      createdAtLocation: user?.primaryOfficeId
    })

    navigate(
      ROUTES.V2.EVENTS.DECLARE.buildPath({
        eventId: transactionId
      })
    )
  }
}

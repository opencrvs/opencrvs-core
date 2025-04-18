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

import React, { useEffect } from 'react'
import { useTypedParams } from 'react-router-typesafe-routes/dom'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@client/v2-events/routes'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { withSuspense } from '@client/v2-events/components/withSuspense'

function DeleteEvent() {
  const { eventId } = useTypedParams(ROUTES.V2.EVENTS.DELETE)
  const navigate = useNavigate()
  const events = useEvents()
  const deleteEvent = events.deleteEvent.useMutation()

  useEffect(() => {
    deleteEvent.mutate({ eventId })
    navigate(ROUTES.V2.path)
    // If you add deleteEvent to the dependencies, it will cause the delete
    // to be called >1 times. This is because the deleteEvent contains updating data fields describing
    // the state of the request
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <div />
}

export const DeleteEventIndex = withSuspense(DeleteEvent)

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
import { useNavigate } from 'react-router-dom'
import { useTypedParams } from 'react-router-typesafe-routes/dom'
import { v4 as uuid } from 'uuid'
import { getCurrentEventState } from '@opencrvs/commons/client'
import { ROUTES } from '@client/v2-events/routes'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'

export function ValidateEvent() {
  const { eventId } = useTypedParams(ROUTES.V2.EVENTS.VALIDATE)
  const navigate = useNavigate()

  const events = useEvents()
  const validateEvent = events.actions.validate

  const [event] = events.getEvent.useSuspenseQuery(eventId)

  const latestEvent = getCurrentEventState(event)

  const transactionId = uuid()

  useEffect(() => {
    validateEvent.mutate({
      eventId,
      data: latestEvent.data,
      transactionId,
      duplicates: []
    })
    navigate(ROUTES.V2.path)
    // If you add validateEvent to the dependencies, it will cause the action
    // to be called >1 times. This is because the validateEvent contains updating data fields describing
    // the state of the request
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <div />
}

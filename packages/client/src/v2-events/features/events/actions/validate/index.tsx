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

import React, { useEffect, useState } from 'react'
import { useTypedParams } from 'react-router-typesafe-routes/dom'
import { useNavigate } from 'react-router-dom'
import { v4 as uuid } from 'uuid'
import { ROUTES } from '@client/v2-events/routes'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'

export function ValidateEvent() {
  const [validated, setValidated] = useState(false)
  const { eventId } = useTypedParams(ROUTES.V2.EVENTS.VALIDATE)
  const navigate = useNavigate()

  const events = useEvents()
  const validateEvent = events.actions.validate

  const transactionId = uuid()

  useEffect(() => {
    if (!validated) {
      validateEvent.mutate(
        {
          eventId,
          data: {},
          transactionId,
          duplicates: []
        },
        { onSettled: () => navigate(ROUTES.V2.path) }
      )
      setValidated(true)
    }
  }, [validateEvent, eventId, navigate, transactionId, validated])

  return <div />
}

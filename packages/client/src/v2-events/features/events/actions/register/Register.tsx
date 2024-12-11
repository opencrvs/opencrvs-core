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

import React from 'react'
import { ROUTES } from '@client/v2-events/routes'
import { EventDocument } from '@opencrvs/commons'
import { useTypedParams } from 'react-router-typesafe-routes/dom'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { ReviewSectionComponent } from '@client/v2-events/features/events/actions/declare/Review'

export const RegisterIndex = () => {
  const { eventId } = useTypedParams(ROUTES.V2.EVENTS.REGISTER.EVENT)

  const { getEvent } = useEvents()
  const [event] = getEvent(eventId)

  if (!event) {
    throw new Error('Event not found')
  }

  return <Register event={event} />
}

export const Register = ({ event }: { event: EventDocument }) => {
  return <ReviewSectionComponent event={event} />
}

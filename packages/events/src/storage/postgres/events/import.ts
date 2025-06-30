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

import { getClient } from '@events/storage/postgres/events'
import { Events } from './schema/app/Events'
import { EventActions } from './schema/app/EventActions'
import {
  createActionInTrx,
  createEventInTrx,
  deleteEventByIdInTrx,
  getEventByIdInTrx
} from './events'

/**
 * @warning For internal use only! Import can be destructive due to it's upsertive nature.
 */

export const upsertEventWithActions = async (
  event: Events,
  actions: Array<Omit<EventActions, 'eventId'>>
) => {
  const db = getClient()

  return db.transaction().execute(async (trx) => {
    await deleteEventByIdInTrx(event.id, trx)
    const { id: eventId } = await createEventInTrx(event, trx)

    for (const action of actions) {
      await createActionInTrx({ ...action, eventId }, trx)
    }

    return getEventByIdInTrx(eventId, trx)
  })
}

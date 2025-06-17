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
import { EventDocument } from '@opencrvs/commons'
import * as events from '@events/storage/mongodb/events'
import { indexEvent } from '@events/service/indexing/indexing'
import { getEventConfigurationById } from '@events/service/config/config'

export async function importEvent(event: EventDocument, token: string) {
  const db = await events.getClient()
  const collection = db.collection<EventDocument>('events')
  const config = await getEventConfigurationById({
    eventType: event.type,
    token
  })
  await collection.replaceOne({ id: event.id }, event, { upsert: true })
  await indexEvent(event, config)
  return event
}

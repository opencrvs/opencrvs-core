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

export async function importEvent(event: EventDocument) {
  const db = await events.getClient()
  const collection = db.collection<EventDocument>('events')
  await collection.replaceOne({ id: event.id }, event, { upsert: true })
  await indexEvent(event)
  return event
}

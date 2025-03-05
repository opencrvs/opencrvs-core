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

import { DraftInput, Draft } from '@opencrvs/commons/events'

import * as events from '@events/storage/mongodb/events'
import { getUUID } from '@opencrvs/commons'

export async function createDraft(
  input: DraftInput,
  {
    eventId,
    createdBy,
    createdAtLocation,
    transactionId
  }: {
    eventId: string
    createdBy: string
    createdAtLocation: string
    token: string
    transactionId: string
  }
) {
  const db = await events.getClient()
  const now = new Date().toISOString()

  const draft: Draft = {
    id: getUUID(),
    eventId: eventId,
    createdAt: now,
    transactionId,
    action: {
      ...input,
      type: input.type,
      createdBy,
      createdAt: now,
      createdAtLocation
    }
  }

  await db.collection<Draft>('drafts').updateOne(
    // Match by transactionId
    { transactionId },
    // Update document
    { $set: draft },
    // Insert if not found
    { upsert: true }
  )

  return draft
}

export async function getDraftsByUserId(createdBy: string) {
  const db = await events.getClient()
  const collection = db.collection<Draft>('drafts')

  const drafts = await collection
    .find({ 'action.createdBy': createdBy })
    .toArray()

  return drafts
}

export async function deleteDraftsByEventId(eventId: string) {
  const db = await events.getClient()
  const collection = db.collection<Draft>('drafts')
  await collection.deleteMany({ eventId: eventId })
}

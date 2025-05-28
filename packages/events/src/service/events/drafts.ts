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

import { getUUID } from '@opencrvs/commons'
import * as events from '@events/storage/mongodb/events'
import { UserDetails } from '@events/router/middleware/utils'

export async function createDraft(
  input: DraftInput,
  {
    eventId,
    userDetails,
    transactionId
  }: {
    eventId: string
    userDetails: UserDetails
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
      createdBy: userDetails.user.id,
      createdByRole: userDetails.user.role,
      createdAt: now,
      createdAtLocation: userDetails.user.primaryOfficeId,
      createdByUserType: userDetails.userType
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

export async function getDraftsForAction(
  eventId: string,
  createdBy: string,
  actionType: string
) {
  const db = await events.getClient()
  const collection = db.collection<Draft>('drafts')

  const drafts = await collection
    .find({ eventId, 'action.createdBy': createdBy, 'action.type': actionType })
    .toArray()

  return drafts
}

export async function deleteDraftsByEventId(eventId: string) {
  const db = await events.getClient()
  const collection = db.collection<Draft>('drafts')
  await collection.deleteMany({ eventId: eventId })
}

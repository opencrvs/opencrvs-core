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

import { Draft, DraftInput, UUID } from '@opencrvs/commons'
import * as draftsRepo from '@events/storage/postgres/events/drafts'
import { UserContext } from '@events/context'

export const createDraft = async (
  input: DraftInput,
  {
    eventId,
    user,
    transactionId
  }: {
    eventId: UUID
    user: UserContext
    transactionId: string
  }
): Promise<Draft> => {
  const createdAt = new Date().toISOString()
  const draft = await draftsRepo.createDraft({
    eventId,
    transactionId,
    // @TODO: Extract DELETE from ActionTypes. It's not an action that's stored!
    // Type '"DELETE"' is not assignable to type 'ActionType'.
    actionType: input.type as Exclude<DraftInput['type'], 'DELETE'>,
    declaration: input.declaration,
    annotation: input.annotation,
    createdBy: user.id,
    createdByRole: user.role,
    createdAtLocation: user.primaryOfficeId,
    createdBySignature: user.signature,
    createdAt: new Date().toISOString(),
    createdByUserType: user.type
  })

  if (!draft) {
    throw new Error('Failed to create draft')
  }

  return {
    id: draft.id,
    transactionId: draft.transactionId,
    createdAt,
    eventId: draft.eventId,
    action: {
      transactionId: draft.transactionId,
      createdAt: createdAt,
      createdBy: user.id,
      createdByRole: user.role,
      createdByUserType: user.type,
      createdAtLocation: user.primaryOfficeId,
      declaration: draft.declaration,
      annotation: draft.annotation,
      type: input.type,
      status: 'Accepted'
    }
  }
}

export const getDraftsByUserId = draftsRepo.getDraftsByUserId

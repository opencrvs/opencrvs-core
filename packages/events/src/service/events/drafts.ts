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
  const draft = await draftsRepo.createDraft({
    eventId,
    transactionId,
    actionType: input.type,
    declaration: input.declaration,
    annotation: input.annotation,
    createdBy: user.id,
    createdByRole: user.role,
    createdByUserType: user.type,
    createdAtLocation: user.primaryOfficeId,
    createdBySignature: user.signature
  })

  if (!draft) {
    throw new Error('Failed to create draft')
  }

  return {
    id: draft.id,
    transactionId: draft.transactionId,
    createdAt: draft.createdAt,
    eventId: draft.eventId,
    action: {
      transactionId: draft.transactionId,
      createdAt: draft.createdAt,
      createdBy: user.id,
      createdByRole: user.role,
      createdByUserType: user.type,
      declaration: draft.declaration,
      annotation: draft.annotation,
      type: input.type,
      status: 'Accepted'
    }
  }
}

export const getDraftsByUserId = draftsRepo.getDraftsByUserId

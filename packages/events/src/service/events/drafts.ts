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

import { DraftInput, UUID } from '@opencrvs/commons'
import * as draftsRepo from '@events/storage/postgres/events/drafts'
import { TrpcUserContext } from '@events/context'

export const createDraft = async (
  input: DraftInput,
  {
    eventId,
    user,
    transactionId
  }: {
    eventId: UUID
    user: TrpcUserContext
    transactionId: string
  }
) => {
  return draftsRepo.createDraft({
    eventId,
    transactionId,
    actionType: input.type,
    declaration: input.declaration,
    annotation: input.annotation,
    createdBy: user.id,
    createdByRole: user.role,
    createdAtLocation: user.primaryOfficeId,
    // @TODO: Why can this be null | undefined, does either have a different meaning?
    createdBySignature: user.signature ?? undefined
  })
}

export const getDraftsByUserId = draftsRepo.getDraftsByUserId

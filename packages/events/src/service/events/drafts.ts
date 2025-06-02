import { DraftInput, UUID } from '@opencrvs/commons'
import * as draftsRepo from '@events/storage/postgres/events/drafts'
import { UserDetails } from '@events/user'

export const createDraft = async (
  input: DraftInput,
  {
    eventId,
    user,
    transactionId
  }: {
    eventId: UUID
    user: UserDetails
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
    createdAtLocation: user.primaryOfficeId
  })
}

export const getDraftsByUserId = draftsRepo.getDraftsByUserId

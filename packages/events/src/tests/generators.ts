import {
  DeclareActionInput,
  DraftActionInput,
  EventInput,
  getUUID,
  ActionType
} from '@opencrvs/commons'

/**
 * @returns a payload generator for creating events and actions with sensible defaults.
 */
export function payloadGenerator() {
  const event = {
    create: (input: Partial<EventInput> = {}) => ({
      transactionId: input?.transactionId ?? getUUID(),
      type: input?.type ?? 'TENNIS_CLUB_MEMBERSHIP'
    }),
    patch: (id: string, input: Partial<EventInput> = {}) => ({
      transactionId: input?.transactionId ?? getUUID(),
      type: input?.type ?? 'TENNIS_CLUB_MEMBERSHIP',
      id
    }),
    actions: {
      declare: (
        eventId: string,
        input: Partial<Pick<DeclareActionInput, 'transactionId' | 'data'>> = {}
      ) => ({
        type: ActionType.DECLARE,
        transactionId: input?.transactionId ?? getUUID(),
        data: input?.data ?? {},
        eventId
      }),
      draft: (
        eventId: string,
        input: Partial<Pick<DraftActionInput, 'transactionId' | 'data'>> = {}
      ) => ({
        type: ActionType.DRAFT,
        transactionId: input?.transactionId ?? getUUID(),
        data: input?.data ?? {},
        eventId
      })
    }
  }

  return { event }
}

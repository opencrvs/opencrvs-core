import * as middleware from '@events/router/middleware'
import { requiresAnyOfScopes } from '@events/router/middleware'
import { router, publicProcedure } from '@events/router/trpc'
import { notifyOnAction } from '@events/service/config/config'
import { deleteDraftsByEventId } from '@events/service/events/drafts'
import { addAction } from '@events/service/events/events'
import {
  SCOPES,
  RegisterActionInput,
  ActionType,
  getUUID
} from '@opencrvs/commons'

async function register(confirmation: boolean) {
  return (options: any) => {
    const updatedEvent = addAction(
      {
        ...options.input,
        identifiers: {
          trackingId: getUUID(),
          registrationNumber: getUUID()
        }
      },
      {
        eventId: options.input.eventId,
        createdBy: options.ctx.user.id,
        createdAtLocation: options.ctx.user.primaryOfficeId,
        token: options.ctx.token,
        transactionId: options.input.transactionId,
        confirmed: confirmation
      }
    )

    if (!confirmation) {
      await notifyOnAction(input, updatedEvent, token)
      // jos onnistuu heti, kutsu addAction uudestaan confirmed: true?
    }
  }
}

export const registerRouter = router({
  '': publicProcedure
    .use(requiresAnyOfScopes([SCOPES.RECORD_REGISTER]))
    // @TODO: Find out a way to dynamically modify the MiddlewareOptions type
    .input(RegisterActionInput.omit({ identifiers: true }))
    // @ts-expect-error
    .use(middleware.validateAction(ActionType.REGISTER))
    .mutation(register),
  confirm: publicProcedure
})

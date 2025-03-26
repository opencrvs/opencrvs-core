import * as middleware from '@events/router/middleware'
import { requiresAnyOfScopes } from '@events/router/middleware'
import { router, publicProcedure } from '@events/router/trpc'
import { notifyOnAction } from '@events/service/config/config'
import { addAction } from '@events/service/events/events'
import {
  SCOPES,
  RegisterActionInput,
  ActionType,
  getUUID
} from '@opencrvs/commons'

function register(confirmation: boolean) {
  // TODO CIHAN: type?
  return async (options: any) => {
    const token = options.ctx.token
    const input = {
      ...options.input,
      identifiers: {
        trackingId: getUUID(),
        registrationNumber: getUUID()
      }
    }

    const updatedEvent = await addAction(input, {
      eventId: options.input.eventId,
      createdBy: options.ctx.user.id,
      createdAtLocation: options.ctx.user.primaryOfficeId,
      token: options.ctx.token,
      transactionId: options.input.transactionId
      // TODO CIHAN
      // confirmed: confirmation
    })

    if (!confirmation) {
      await notifyOnAction(input, updatedEvent, token)
      // jos onnistuu heti, kutsu addAction uudestaan missä confirmed: true?
    }
  }
}

export const registerRouter = router({
  // CIHAN: jos tää ei toimi, käytä jotain nimeä esim. 'request'
  '': publicProcedure
    .use(requiresAnyOfScopes([SCOPES.RECORD_REGISTER]))
    // @TODO: Find out a way to dynamically modify the MiddlewareOptions type
    .input(RegisterActionInput.omit({ identifiers: true }))
    // @ts-expect-error
    .use(middleware.validateAction(ActionType.REGISTER))
    .mutation(register(false)),
  confirm: publicProcedure
    .use(requiresAnyOfScopes([SCOPES.RECORD_REGISTER]))
    .input(RegisterActionInput.omit({ identifiers: true }))
    // @ts-expect-error
    .use(middleware.validateAction(ActionType.REGISTER))
    .mutation(register(true))
})

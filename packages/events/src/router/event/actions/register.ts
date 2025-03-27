import * as middleware from '@events/router/middleware'
import { requiresAnyOfScopes } from '@events/router/middleware'
import { router, publicProcedure } from '@events/router/trpc'
import { notifyOnAction } from '@events/service/config/config'
import { addAction, updateActionStatus } from '@events/service/events/events'
import {
  SCOPES,
  RegisterActionInput,
  ActionType,
  getUUID,
  ActionStatus,
  ActionConfirmationResponseCodes
} from '@opencrvs/commons'

const RegisterActionInputWithoutIdentifiers = RegisterActionInput.omit({
  identifiers: true
})

export const registerRouter = router({
  request: publicProcedure
    .use(requiresAnyOfScopes([SCOPES.RECORD_REGISTER]))
    // @TODO: Find out a way to dynamically modify the MiddlewareOptions type
    .input(RegisterActionInputWithoutIdentifiers)
    // @ts-expect-error
    .use(middleware.validateAction(ActionType.REGISTER))
    .mutation(async ({ ctx, input }) => {
      const { token, user } = ctx
      const { eventId, transactionId } = input

      const addActionInput = {
        ...input,
        identifiers: {
          trackingId: getUUID(),
          registrationNumber: getUUID()
        }
      }

      const { event, actionId } = await addAction(addActionInput, {
        eventId,
        createdBy: user.id,
        createdAtLocation: user.primaryOfficeId,
        token,
        transactionId,
        status: ActionStatus.Requested
      })

      const notifyResult = await notifyOnAction(addActionInput, event, token)

      console.log('CIHAN TÄÄL')
      console.log(notifyResult)
      // If the action is instantly accepted or rejected, simply update the action status.
      if (notifyResult === ActionConfirmationResponseCodes.Success) {
        return updateActionStatus(event.id, actionId, ActionStatus.Accepted)
      }

      if (notifyResult === ActionConfirmationResponseCodes.ActionRejected) {
        return updateActionStatus(event.id, actionId, ActionStatus.Rejected)
      }

      return event
    }),

  accept: publicProcedure
    .use(requiresAnyOfScopes([SCOPES.RECORD_REGISTER]))
    .input(RegisterActionInputWithoutIdentifiers)
    // @ts-expect-error
    .use(middleware.validateAction(ActionType.REGISTER))
    .mutation(async ({ ctx, input }) => {
      const { token, user } = ctx
      const { eventId, transactionId } = input

      const addActionInput = {
        ...input,
        identifiers: {
          trackingId: getUUID(),
          registrationNumber: getUUID()
        }
      }

      const { event } = await addAction(addActionInput, {
        eventId,
        createdBy: user.id,
        createdAtLocation: user.primaryOfficeId,
        token,
        transactionId,
        status: ActionStatus.Accepted
      })

      return event
    }),

  reject: publicProcedure
    .use(requiresAnyOfScopes([SCOPES.RECORD_REGISTER]))
    .mutation(async ({ ctx, input }) => {
      console.log('TODO CIHAN')

      // const { token, user } = ctx
      // const { eventId, transactionId } = input
      // return addAction()
    })
})

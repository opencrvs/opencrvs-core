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
import { TRPCError } from '@trpc/server'
import { findLast } from 'lodash'
import * as z from 'zod/v4'
import {
  canUserCreateEvent,
  getAcceptedScopesByType,
  getScopes,
  UUID
} from '@opencrvs/commons'
import {
  ActionType,
  EventDocument,
  NotifyActionInput
} from '@opencrvs/commons/events'
import { systemOnlyProcedure } from '@events/router/trpc'
import {
  getEventConfigurationById,
  getInMemoryEventConfigurations
} from '@events/service/config/config'
import { createEvent } from '@events/service/events/events'
import { locationExists } from '@events/storage/postgres/administrative-hierarchy/locations'
import { writeAuditLog } from '@events/storage/postgres/events/auditLog'
import { validateNotifyAction } from '@events/router/middleware/validate'
import {
  getValidatorContext,
  throwWhenNotEmpty
} from '@events/router/middleware/validate/utils'
import { defaultRequestHandler } from '@events/router/event/actions'

/**
 * Input schema for the createAndNotify combinator endpoint.
 *
 * Composed from NotifyActionInput by removing the fields that do not apply to a
 * combined create+notify call:
 *  - `eventId` is omitted - the event is created as part of this request.
 *  - `type`    is omitted - it is always ActionType.NOTIFY and needs no input.
 *
 * `eventType` is added to identify which event configuration to use.
 * `createdAtLocation` is required (not nullish) because this endpoint is
 * system-only and system users must always supply a valid leaf office location.
 */
export const CreateAndNotifyInput = NotifyActionInput.omit({
  eventId: true,
  type: true
}).extend({
  /** The event type identifier, e.g. tennis-club-membership. Must match a configured event type. */
  eventType: z.string(),
  /**
   * A valid leaf office location ID.
   * Required for all callers of this endpoint (system users only).
   * The provided location must not have any child locations.
   */
  createdAtLocation: UUID.describe(
    'A valid office location ID. Required. The provided location must be a leaf-location, i.e. it must not have any child locations.'
  )
})

export type CreateAndNotifyInput = z.infer<typeof CreateAndNotifyInput>

/**
 * Combinator procedure that creates a new event and immediately applies a NOTIFY action,
 * so the caller only needs to make one HTTP request instead of two.
 *
 * This endpoint is available to system (API-key) clients only.
 *
 * Authorization requires both record.create and record.notify scopes for the requested
 * event type.
 *
 * The operation is idempotent: re-submitting the same transactionId is safe and returns
 * the already-created, already-notified event.
 */
export function createAndNotifyProcedure() {
  return {
    request: systemOnlyProcedure
      .meta({
        openapi: {
          summary:
            'Create an event and immediately notify (single request, system clients only)',
          method: 'POST',
          path: '/events/notify',
          tags: ['events'],
          protect: true
        }
      })
      .input(CreateAndNotifyInput)
      .output(EventDocument)
      .mutation(async ({ ctx, input }) => {
        const { token, user } = ctx
        const {
          eventType,
          transactionId,
          declaration,
          annotation,
          createdAtLocation,
          keepAssignment
        } = input

        // Authorization
        const eventConfigs = await getInMemoryEventConfigurations(token)
        const tokenScopes = getScopes(token)

        const eventConfig = eventConfigs.find((c) => c.id === eventType)
        if (!eventConfig) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `No configuration found for event type: ${eventType}`
          })
        }

        // Must have record.create scope for this event type
        if (!canUserCreateEvent(tokenScopes, eventType)) {
          throw new TRPCError({ code: 'FORBIDDEN' })
        }

        // Must have record.notify scope for this event type
        const notifyScopes = getAcceptedScopesByType({
          acceptedScopes: ['record.notify'],
          scopes: tokenScopes
        })

        if (notifyScopes.length === 0) {
          throw new TRPCError({ code: 'FORBIDDEN' })
        }

        const canNotify = notifyScopes.some((scope) => {
          if (
            !('options' in scope) ||
            !scope.options ||
            !('event' in scope.options)
          ) {
            // Scope has no event restriction - allows any event type
            return true
          }
          return scope.options.event?.includes(eventType)
        })

        if (!canNotify) {
          throw new TRPCError({ code: 'FORBIDDEN' })
        }

        // Location validation: createdAtLocation must exist in the locations table.
        const isValidLocation = await locationExists(createdAtLocation)
        if (!isValidLocation) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'createdAtLocation must be a valid location id'
          })
        }

        // Step 1: Create the event.
        // Use a derived transactionId so that the event-create step has its own idempotency
        // key, separate from the notify transactionId.
        const createTransactionId = `${transactionId}:create`
        const config = await getEventConfigurationById({ token, eventType })
        const event = await createEvent({
          eventInput: {
            type: eventType,
            transactionId: createTransactionId,
            createdAtLocation
          },
          user,
          transactionId: createTransactionId,
          createdAtLocation,
          config
        })

        // Step 2: Idempotency guard.
        // If we are replaying a request the event already exists and already has a NOTIFY
        // action with this transactionId - just return the current event state.
        const existingNotifyAction = findLast(
          event.actions,
          (action) =>
            action.transactionId === transactionId &&
            action.type === ActionType.NOTIFY
        )
        if (existingNotifyAction) {
          return event
        }

        // Step 3: Validate notify fields against the event configuration.
        const validatorContext = await getValidatorContext(token)
        const notifyErrors = validateNotifyAction({
          eventConfig: config,
          declaration: declaration,
          annotation,
          context: { ...validatorContext, event }
        })
        throwWhenNotEmpty(notifyErrors)

        // Step 4: Apply the NOTIFY action.
        const notifyInput = {
          type: ActionType.NOTIFY,
          eventId: event.id,
          transactionId,
          declaration: declaration,
          annotation,
          createdAtLocation,
          keepAssignment
        }

        const result = await defaultRequestHandler(
          notifyInput,
          user,
          token,
          event,
          config,
          NotifyActionInput
        )

        // Step 5: Write audit log.
        await writeAuditLog({
          clientId: user.id,
          clientType: user.type,
          operation: 'event.actions.notify.request',
          requestData: {
            eventId: event.id,
            actionType: ActionType.NOTIFY,
            eventType: result.type,
            trackingId: result.trackingId,
            transactionId
          }
        })

        return result
      })
  }
}

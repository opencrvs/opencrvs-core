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
import { MiddlewareFunction } from '@trpc/server/unstable-core-do-not-import'
import { OpenApiMeta } from 'trpc-to-openapi'
import { isEqual } from 'lodash'
import {
  ActionInputWithType,
  ActionStatus,
  ActionType,
  DeclarationActionConfig,
  EventDocument,
  getCurrentEventState,
  RegisterActionInput,
  ValidateActionInput
} from '@opencrvs/commons/events'
import { getUUID } from '@opencrvs/commons'
import { TrpcContext } from '@events/context'
import { getInMemoryEventConfigurations } from '@events/service/config/config'
import { searchForDuplicates } from '@events/service/deduplication/deduplication'
import { processAction, getEventById } from '@events/service/events/events'
import { getContext } from '@events/router/middleware/validate/utils'

function requiresDedupCheck(
  input: ActionInputWithType
): input is ValidateActionInput | RegisterActionInput {
  const actionsRequiringCheck: ActionType[] = [
    ActionType.VALIDATE,
    ActionType.REGISTER
  ]
  return actionsRequiringCheck.includes(input.type)
}

export const detectDuplicate: MiddlewareFunction<
  TrpcContext,
  OpenApiMeta,
  TrpcContext,
  TrpcContext & {
    duplicates:
      | {
          detected: true
          event: EventDocument
        }
      | {
          detected: false
        }
  },
  ActionInputWithType
> = async ({ input, next, ctx }) => {
  if (!requiresDedupCheck(input)) {
    return next({
      ctx: {
        duplicates: {
          detected: false
        }
      }
    })
  }
  const { user, token } = ctx
  const configs = await getInMemoryEventConfigurations(token)
  const storedEvent = await getEventById(input.eventId)
  const context = await getContext(token)
  const config = configs.find((c) => c.id === storedEvent.type)

  if (!config) {
    throw new Error(
      `Event configuration not found with type: ${storedEvent.type}`
    )
  }

  const dedupConfig = config.actions.find(
    (action): action is DeclarationActionConfig => action.type === input.type
  )?.deduplication

  if (!dedupConfig) {
    return next({
      ctx: {
        duplicates: {
          detected: false
        }
      }
    })
  }
  const createdByDetails = {
    createdBy: user.id,
    createdByUserType: user.type,
    createdByRole: user.role,
    createdAtLocation: user.primaryOfficeId,
    createdBySignature: user.signature
  }

  const existingEventState = getCurrentEventState(storedEvent, config, context)

  const futureEventState = getCurrentEventState(
    {
      ...storedEvent,
      actions: [
        ...storedEvent.actions,
        {
          ...input,
          ...createdByDetails,
          createdAt: new Date().toISOString(),
          id: getUUID(),
          status: ActionStatus.Accepted
        }
      ]
    },
    config,
    context
  )

  const isMarkedAsNotDuplicate = storedEvent.actions.reduce((acc, action) => {
    if (action.type === ActionType.MARK_AS_NOT_DUPLICATE) {
      return true
    }
    if (action.type === ActionType.DUPLICATE_DETECTED) {
      return false
    }
    return acc
  }, false)

  if (
    isMarkedAsNotDuplicate &&
    isEqual(existingEventState.declaration, futureEventState.declaration)
  ) {
    return next({
      ctx: {
        duplicates: {
          detected: false
        }
      }
    })
  }

  const duplicates = await searchForDuplicates(
    futureEventState,
    dedupConfig,
    config
  )

  if (duplicates.length > 0) {
    const event = await processAction(
      {
        type: ActionType.DUPLICATE_DETECTED,
        transactionId: input.transactionId,
        eventId: input.eventId,
        declaration: input.declaration,
        content: {
          duplicates: duplicates.map(({ event: { id, trackingId } }) => ({
            id,
            trackingId
          }))
        }
      },
      {
        event: storedEvent,
        user,
        token,
        status: ActionStatus.Accepted,
        configuration: config
      }
    )
    return next({
      ctx: {
        duplicates: {
          detected: true,
          event
        }
      }
    })
  }
  return next({
    ctx: {
      duplicates: { detected: false }
    }
  })
}

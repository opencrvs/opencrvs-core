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
import { createTRPCMsw } from '@vafanassieff/msw-trpc'
import {
  ActionType,
  tennisClubMembershipEvent,
  generateEventDocument,
  generateEventDraftDocument,
  footballClubMembershipEvent,
  EventDocument
} from '@opencrvs/commons/client'
import { AppRouter } from '@client/v2-events/trpc'
import { tennisClubMembershipEventIndex } from '@client/v2-events/features/events/fixtures'

/**
 * Create a spy function that tracks if a handler was called and with what input.
 */
function createSpy<Args extends unknown[], Result>(
  handler: (...args: Args) => Result
) {
  let called = false

  const spy = (...args: Args): Result => {
    called = true
    return handler(...args)
  }

  return {
    handler: spy,
    wasCalled: () => called,
    reset: () => {
      called = false
    }
  }
}

/**
 * Wraps handlers with spies to track if they were called and with what input.
 *
 * @param handlerConfigs - Array of handler configurations
 * @param handlerConfigs[].procedure - TRPC procedure. Will be called with the handler.
 * @param handlerConfigs[].handler - handler function that returns the mock. This will be wrapped to spy
 * @param handlerConfigs[].name - The name of the handler. Used for accessing spy results
 *
 *
 * @returns handlers with spy methods
 */
export function wrapHandlersWithSpies<
  Handlers extends {
    name: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    procedure: (handler: any) => any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handler: (...args: any[]) => any
  }[]
>(
  handlerConfigs: Handlers
): {
  handlers: ReturnType<Handlers[number]['procedure']>[]
  spies: Record<Handlers[number]['name'], ReturnType<typeof createSpy>>
  reset: () => void
  getSpyCalls: () => Record<Handlers[number]['name'], boolean>
} {
  const spies: Record<string, ReturnType<typeof createSpy>> = {}

  const handlers = handlerConfigs.map(({ procedure, handler, name }) => {
    const spy = createSpy(handler)

    /** NOTE: We are building up spies map as a side effect */
    spies[name] = spy
    return procedure(spy.handler as typeof handler)
  })

  const reset = () => {
    Object.values(spies).forEach((spy) => spy.reset())
  }

  return {
    handlers,
    spies,
    reset,
    getSpyCalls: () =>
      Object.entries(spies).reduce(
        (calls, [key, spy]) => {
          return {
            ...calls,
            [key]: spy.wasCalled()
          }
        },
        {} as Record<Handlers[number]['name'], boolean>
      )
  }
}

const eventDocument = generateEventDocument({
  configuration: tennisClubMembershipEvent,
  actions: [{ type: ActionType.CREATE }]
})
const eventId = eventDocument.id
const draft = generateEventDraftDocument({
  eventId,
  actionType: ActionType.REGISTER
})

/**
 * Shareable msw configuration for declaration action flows with spies.
 */
export const createDeclarationTrpcMsw = (
  trpcMsw: ReturnType<typeof createTRPCMsw<AppRouter>>,
  eventDocument: EventDocument
) => {
  return {
    eventDocument,
    draft,
    events: wrapHandlersWithSpies([
      {
        name: 'event.config.get',
        procedure: trpcMsw.event.config.get.query,
        handler: () => [tennisClubMembershipEvent, footballClubMembershipEvent]
      },
      {
        name: 'event.get',
        procedure: trpcMsw.event.get.query,
        handler: () => eventDocument
      },
      {
        name: 'event.create',
        procedure: trpcMsw.event.create.mutation,
        handler: () =>
          generateEventDocument({
            configuration: tennisClubMembershipEvent,
            actions: [{ type: ActionType.CREATE }]
          })
      },
      {
        name: 'event.actions.notify.request',
        procedure: trpcMsw.event.actions.notify.request.mutation,
        handler: () =>
          generateEventDocument({
            configuration: tennisClubMembershipEvent,
            actions: [{ type: ActionType.CREATE }, { type: ActionType.NOTIFY }]
          })
      },
      {
        name: 'event.actions.declare.request',
        procedure: trpcMsw.event.actions.declare.request.mutation,
        handler: () =>
          generateEventDocument({
            configuration: tennisClubMembershipEvent,
            actions: [{ type: ActionType.CREATE }, { type: ActionType.DECLARE }]
          })
      },
      {
        name: 'event.actions.validate.request',
        procedure: trpcMsw.event.actions.validate.request.mutation,
        handler: () =>
          generateEventDocument({
            configuration: tennisClubMembershipEvent,
            actions: [
              { type: ActionType.CREATE },
              { type: ActionType.DECLARE },
              { type: ActionType.VALIDATE }
            ]
          })
      },
      {
        name: 'event.actions.register.request',
        procedure: trpcMsw.event.actions.register.request.mutation,
        handler: () =>
          generateEventDocument({
            configuration: tennisClubMembershipEvent,
            actions: [
              { type: ActionType.CREATE },
              { type: ActionType.DECLARE },
              { type: ActionType.VALIDATE },
              { type: ActionType.REGISTER }
            ]
          })
      },
      {
        name: 'event.actions.archive.request',
        procedure: trpcMsw.event.actions.archive.request.mutation,
        handler: () =>
          generateEventDocument({
            configuration: tennisClubMembershipEvent,
            actions: [
              { type: ActionType.CREATE },
              { type: ActionType.DECLARE },
              { type: ActionType.VALIDATE },
              { type: ActionType.ARCHIVE }
            ]
          })
      },
      {
        name: 'event.actions.duplicate.markAsDuplicate',
        procedure: trpcMsw.event.actions.duplicate.markAsDuplicate.mutation,
        handler: () =>
          generateEventDocument({
            configuration: tennisClubMembershipEvent,
            actions: [
              { type: ActionType.CREATE },
              { type: ActionType.DECLARE },
              { type: ActionType.VALIDATE },
              { type: ActionType.MARK_AS_DUPLICATE }
            ]
          })
      },
      {
        name: 'event.actions.reject.request',
        procedure: trpcMsw.event.actions.reject.request.mutation,
        handler: () =>
          generateEventDocument({
            configuration: tennisClubMembershipEvent,
            actions: [
              { type: ActionType.CREATE },
              { type: ActionType.DECLARE },
              { type: ActionType.VALIDATE },
              { type: ActionType.REJECT }
            ]
          })
      }
    ]),
    drafts: wrapHandlersWithSpies([
      {
        name: 'event.draft.list',
        procedure: trpcMsw.event.draft.list.query,
        handler: () => [draft]
      }
    ]),
    search: wrapHandlersWithSpies([
      {
        name: 'event.search',
        procedure: trpcMsw.event.search.query,
        handler: () => [tennisClubMembershipEventIndex]
      }
    ])
  } as const
}

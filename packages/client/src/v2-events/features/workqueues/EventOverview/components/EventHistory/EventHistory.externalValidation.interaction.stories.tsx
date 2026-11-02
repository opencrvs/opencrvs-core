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

import type { Meta, StoryObj } from '@storybook/react-vite'
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import React from 'react'
import superjson from 'superjson'
import { expect, userEvent, within } from 'storybook/test'
import {
  ActionDocument,
  ActionStatus,
  ActionType,
  EventDocument,
  generateActionDocuments,
  getCurrentEventState,
  getUUID,
  tennisClubMembershipEvent,
  TestUserRole,
  TokenUserType,
  UserOrSystemSummary
} from '@opencrvs/commons/client'
import {
  AppRouter,
  queryClient,
  trpcOptionsProxy,
  TRPCProvider
} from '@client/v2-events/trpc'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { tennisClubMembershipEventDocument } from '@client/v2-events/features/events/fixtures'
import { testDataGenerator } from '@client/tests/test-data-generators'
import { EventOverviewIndex } from '../../EventOverview'

const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [httpLink({ url: '/api/events' })],
  transformer: { input: superjson, output: superjson }
})

const refData = testDataGenerator()

const config = tennisClubMembershipEvent

const localRegistrarId = refData.user.id.localRegistrar

const actionDefaults = {
  createdBy: localRegistrarId,
  createdByRole: TestUserRole.enum.LOCAL_REGISTRAR,
  createdAtLocation: refData.user.localRegistrar().v2.primaryOfficeId
} satisfies Partial<ActionDocument>

/**
 * The external system (e.g. MOSIP) that confirms async validations. Seeded into
 * the user list so its actions resolve to a system actor in the audit.
 */
const systemId = getUUID()
const system = {
  id: systemId,
  name: 'OpenCRVS',
  type: TokenUserType.enum.system
} satisfies UserOrSystemSummary

/** Overrides marking an action as created by the external system, not a user. */
const systemActor = {
  createdBy: systemId,
  createdByUserType: TokenUserType.enum.system
} satisfies Partial<ActionDocument>

/** Deterministic, increasing timestamps so the audit order is stable. */
function at(minute: number) {
  return new Date(Date.UTC(2024, 2, 1, 10, minute, 0)).toISOString()
}

/** The actions stored for `type` when the local registrar performs it at `minute`. */
function storyActions<T extends ActionType>(
  type: T,
  minute: number,
  defaults: Partial<Extract<ActionDocument, { type: T }>> = {}
) {
  return generateActionDocuments({
    configuration: config,
    action: type,
    defaults: { ...actionDefaults, createdAt: at(minute), ...defaults }
  })
}

/**
 * A confirmable action requested by the local registrar at `minute` and, unless
 * still pending, confirmed asynchronously by the external system a minute later.
 */
function confirmableAction<T extends ActionType>(
  type: T,
  minute: number,
  status: ActionStatus,
  defaults: Partial<Extract<ActionDocument, { type: T }>> = {}
) {
  return generateActionDocuments({
    configuration: config,
    action: type,
    defaults: { ...actionDefaults, createdAt: at(minute), ...defaults },
    confirmation: {
      status,
      // An asynchronous confirmation arrives in a transaction of its own
      defaults: {
        ...systemActor,
        createdAt: at(minute + 1),
        transactionId: getUUID()
      }
    }
  })
}

/**
 * A record whose registration was deferred to an external system (e.g. MOSIP)
 * and is still pending: the REGISTER action is `Requested`, not yet accepted.
 */
const registrationWaitingEvent: EventDocument = {
  ...tennisClubMembershipEventDocument,
  id: getUUID(),
  actions: [
    ...storyActions(ActionType.CREATE, 0, { declaration: {} }),
    ...storyActions(ActionType.ASSIGN, 1, { assignedTo: localRegistrarId }),
    ...storyActions(ActionType.DECLARE, 2, {
      declaration: {
        'applicant.name': { firstname: 'Danny', surname: 'Drinkwater' }
      }
    }),
    ...confirmableAction(ActionType.REGISTER, 3, ActionStatus.Requested)
  ]
}

const requestCorrectionPair = confirmableAction(
  ActionType.REQUEST_CORRECTION,
  4,
  ActionStatus.Accepted,
  {
    declaration: {
      'applicant.name': { firstname: 'Daniel', surname: 'Drinkwater' }
    }
  }
)
// The approval refers to the accepted request
const [, acceptedRequestCorrection] = requestCorrectionPair

const correctionWaitingEvent: EventDocument = {
  ...tennisClubMembershipEventDocument,
  id: getUUID(),
  actions: [
    ...storyActions(ActionType.CREATE, 0, { declaration: {} }),
    ...storyActions(ActionType.ASSIGN, 1, { assignedTo: localRegistrarId }),
    ...storyActions(ActionType.DECLARE, 2, {
      declaration: {
        'applicant.name': { firstname: 'Danny', surname: 'Drinkwater' }
      }
    }),
    ...storyActions(ActionType.REGISTER, 3),
    ...requestCorrectionPair,
    ...confirmableAction(
      ActionType.APPROVE_CORRECTION,
      6,
      ActionStatus.Requested,
      {
        content: { immediateCorrection: true },
        requestId: acceptedRequestCorrection.id
      }
    )
  ]
}

/**
 * A registration whose external validation has finished: the `Requested`
 * REGISTER is now followed by an `Accepted` REGISTER (its `originalActionId`
 * points at the request, but it carries a different transactionId, as the async
 * confirmation does). The audit shows the completed "Registered" row.
 */
const registrationFinishedEvent: EventDocument = {
  ...tennisClubMembershipEventDocument,
  id: getUUID(),
  actions: [
    ...storyActions(ActionType.CREATE, 0, { declaration: {} }),
    ...storyActions(ActionType.ASSIGN, 1, { assignedTo: localRegistrarId }),
    ...storyActions(ActionType.DECLARE, 2, {
      declaration: {
        'applicant.name': { firstname: 'Danny', surname: 'Drinkwater' }
      }
    }),
    ...confirmableAction(ActionType.REGISTER, 3, ActionStatus.Accepted)
  ]
}

/**
 * A direct correction whose external validation has finished: the `Requested`
 * APPROVE_CORRECTION is now followed by an `Accepted` one.
 */
const finishedRequestCorrectionPair = confirmableAction(
  ActionType.REQUEST_CORRECTION,
  4,
  ActionStatus.Accepted,
  {
    declaration: {
      'applicant.name': { firstname: 'Daniel', surname: 'Drinkwater' }
    }
  }
)
// The approval refers to the accepted request
const [, finishedAcceptedRequestCorrection] = finishedRequestCorrectionPair

const correctionFinishedEvent: EventDocument = {
  ...tennisClubMembershipEventDocument,
  id: getUUID(),
  actions: [
    ...storyActions(ActionType.CREATE, 0, { declaration: {} }),
    ...storyActions(ActionType.ASSIGN, 1, { assignedTo: localRegistrarId }),
    ...storyActions(ActionType.DECLARE, 2, {
      declaration: {
        'applicant.name': { firstname: 'Danny', surname: 'Drinkwater' }
      }
    }),
    ...storyActions(ActionType.REGISTER, 3),
    ...finishedRequestCorrectionPair,
    ...confirmableAction(
      ActionType.APPROVE_CORRECTION,
      6,
      ActionStatus.Accepted,
      {
        content: { immediateCorrection: true },
        requestId: finishedAcceptedRequestCorrection.id
      }
    )
  ]
}

/**
 * A registration whose external validation was rejected: the `Requested`
 * REGISTER is followed by a `Rejected` confirmation (a different transactionId,
 * as the async rejection carries). The audit shows a single "Registration
 * failed" row with a rejected status badge — no separate waiting row.
 */
const registrationRejectedEvent: EventDocument = {
  ...tennisClubMembershipEventDocument,
  id: getUUID(),
  actions: [
    ...storyActions(ActionType.CREATE, 0, { declaration: {} }),
    ...storyActions(ActionType.ASSIGN, 1, { assignedTo: localRegistrarId }),
    ...storyActions(ActionType.DECLARE, 2, {
      declaration: {
        'applicant.name': { firstname: 'Danny', surname: 'Drinkwater' }
      }
    }),
    ...confirmableAction(ActionType.REGISTER, 3, ActionStatus.Rejected)
  ]
}

/**
 * A direct correction whose external validation was rejected: the `Requested`
 * APPROVE_CORRECTION is followed by a `Rejected` one. The audit shows the
 * correction row with a rejected status badge, and it can be expanded to reveal
 * the rejection.
 */
const rejectedRequestCorrectionPair = confirmableAction(
  ActionType.REQUEST_CORRECTION,
  4,
  ActionStatus.Accepted,
  {
    declaration: {
      'applicant.name': { firstname: 'Daniel', surname: 'Drinkwater' }
    }
  }
)
// The approval refers to the accepted request
const [, rejectedAcceptedRequestCorrection] = rejectedRequestCorrectionPair

const correctionRejectedEvent: EventDocument = {
  ...tennisClubMembershipEventDocument,
  id: getUUID(),
  actions: [
    ...storyActions(ActionType.CREATE, 0, { declaration: {} }),
    ...storyActions(ActionType.ASSIGN, 1, { assignedTo: localRegistrarId }),
    ...storyActions(ActionType.DECLARE, 2, {
      declaration: {
        'applicant.name': { firstname: 'Danny', surname: 'Drinkwater' }
      }
    }),
    ...storyActions(ActionType.REGISTER, 3),
    ...rejectedRequestCorrectionPair,
    ...confirmableAction(
      ActionType.APPROVE_CORRECTION,
      6,
      ActionStatus.Rejected,
      {
        content: { immediateCorrection: true },
        requestId: rejectedAcceptedRequestCorrection.id
      }
    )
  ]
}

function auditParameters(event: EventDocument) {
  return {
    chromatic: { disableSnapshot: true },
    userRole: TestUserRole.enum.LOCAL_REGISTRAR,
    offline: { configs: [config], events: [event] },
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.EVENT.AUDIT.buildPath({ eventId: event.id })
    },
    msw: {
      handlers: {
        events: [
          tRPCMsw.event.config.get.query(() => [config]),
          tRPCMsw.event.get.query(() => event),
          tRPCMsw.event.search.query(() => ({
            results: [getCurrentEventState(event, config)],
            total: 1
          }))
        ]
      }
    }
  }
}

const meta: Meta<typeof EventOverviewIndex> = {
  title: 'EventHistory/ExternalValidation',
  component: EventOverviewIndex,
  decorators: [
    (Story) => (
      <TRPCProvider>
        <Story />
      </TRPCProvider>
    )
  ],
  // Seed the user list (and the confirming system) so action creators resolve
  // instead of "Missing user". Each actor is seeded under its own query key: the
  // custom user.list queryFn returns only the ids it was asked for, so a system
  // sharing the user's cache entry would be dropped when that user is refetched.
  beforeEach: () => {
    queryClient.setQueryData(
      trpcOptionsProxy.user.list.queryKey([localRegistrarId]),
      [refData.user.localRegistrar().v2]
    )
    queryClient.setQueryData(trpcOptionsProxy.user.list.queryKey([systemId]), [
      system
    ])
  }
}

export default meta
type Story = StoryObj<typeof EventOverviewIndex>

/**
 * A pending async registration shows the register row with a yellow
 * "Requested" status badge — not a separate row.
 */
export const RegistrationWaitingForExternalValidation: Story = {
  parameters: auditParameters(registrationWaitingEvent),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('the register row is shown', async () => {
      await expect(
        await canvas.findByRole(
          'button',
          { name: 'Registered' },
          { timeout: 10000 }
        )
      ).toBeVisible()
    })

    await step('it shows status "Requested"', async () => {
      await expect(await canvas.findByTitle('Requested')).toBeVisible()
      await expect(
        canvas.queryByRole('button', {
          name: 'Requested'
        })
      ).toBeNull()
    })
  }
}

export const CorrectionWaitingForExternalValidation: Story = {
  parameters: auditParameters(correctionWaitingEvent),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('the correction is shown as "Record corrected"', async () => {
      await expect(
        await canvas.findByRole(
          'button',
          { name: 'Record corrected' },
          { timeout: 10000 }
        )
      ).toBeVisible()
    })

    await step('it shows status "Requested"', async () => {
      // The status is an icon badge (first column) with a descriptive title,
      // not a row of its own.
      await expect(await canvas.findByTitle('Requested')).toBeVisible()
      await expect(
        canvas.queryByRole('button', {
          name: 'Requested'
        })
      ).toBeNull()
    })

    await step(
      'expanding reveals the succeeded request and a pending placeholder',
      async () => {
        await expect(canvas.queryByText('Awaiting confirmation')).toBeNull()

        await userEvent.click(
          await canvas.findByRole('button', {
            name: 'Show validation details'
          })
        )

        // The request itself is shown as succeeded, and its confirmation is
        // still pending.
        await expect(await canvas.findByText('Requested')).toBeVisible()
        await expect(
          await canvas.findByText('Awaiting confirmation')
        ).toBeVisible()
      }
    )
  }
}

/**
 * Once the registration's external validation completes, the audit shows a
 * single "Registered" row with no waiting badge — the requested action is no
 * longer surfaced separately.
 */
export const RegistrationExternalValidationFinished: Story = {
  parameters: auditParameters(registrationFinishedEvent),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('the registration is complete', async () => {
      await expect(
        await canvas.findByRole(
          'button',
          { name: 'Registered' },
          { timeout: 10000 }
        )
      ).toBeVisible()
    })

    await step('there is no waiting status', async () => {
      await expect(canvas.queryByTitle('Requested')).toBeNull()
    })

    await step(
      'the row can be expanded to reveal who confirmed it and when',
      async () => {
        // The confirmation details are not shown until the row is expanded.
        await expect(canvas.queryByText('Accepted')).toBeNull()

        await userEvent.click(
          await canvas.findByRole('button', {
            name: 'Show validation details'
          })
        )

        await expect(await canvas.findByText('Accepted')).toBeVisible()
      }
    )
  }
}

/**
 * Once the correction's external validation completes, the audit shows the
 * "Record corrected" row with no waiting badge.
 */
export const CorrectionExternalValidationFinished: Story = {
  parameters: auditParameters(correctionFinishedEvent),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('the correction is shown as "Record corrected"', async () => {
      await expect(
        await canvas.findByRole(
          'button',
          { name: 'Record corrected' },
          { timeout: 10000 }
        )
      ).toBeVisible()
    })

    await step('there is no waiting status', async () => {
      await expect(canvas.queryByTitle('Requested')).toBeNull()
    })
  }
}

/**
 * When the registration's external validation is rejected, the top-level row
 * still reads as "Registered" (the action itself) with a rejected status badge
 * (no waiting badge); the rejection is only surfaced in the expandable sub-row.
 */
export const RegistrationExternalValidationRejected: Story = {
  parameters: auditParameters(registrationRejectedEvent),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('the row still reads as the register action', async () => {
      await expect(
        await canvas.findByRole(
          'button',
          { name: 'Registered' },
          { timeout: 10000 }
        )
      ).toBeVisible()
    })

    await step('its status shows as rejected, not waiting', async () => {
      // The status is an icon badge (first column) with a descriptive title.
      await expect(await canvas.findByTitle('Rejected')).toBeVisible()
      await expect(canvas.queryByTitle('Requested')).toBeNull()
    })

    await step('the row can be expanded to reveal the rejection', async () => {
      // The confirmation details are not shown until the row is expanded.
      await expect(canvas.queryByText('Rejected')).toBeNull()

      await userEvent.click(
        await canvas.findByRole('button', {
          name: 'Show validation details'
        })
      )

      await expect(await canvas.findByText('Rejected')).toBeVisible()
    })
  }
}

/**
 * When the correction's external validation is rejected, the top-level row still
 * reads as "Record corrected" (the action itself) with a rejected status badge;
 * the rejection is surfaced by the badge, not the row title.
 */
export const CorrectionExternalValidationRejected: Story = {
  parameters: auditParameters(correctionRejectedEvent),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('the row still reads as the correction action', async () => {
      await expect(
        await canvas.findByRole(
          'button',
          { name: 'Record corrected' },
          { timeout: 10000 }
        )
      ).toBeVisible()
    })

    await step('its status shows as rejected, not waiting', async () => {
      await expect(await canvas.findByTitle('Rejected')).toBeVisible()
      await expect(canvas.queryByTitle('Requested')).toBeNull()
    })
  }
}

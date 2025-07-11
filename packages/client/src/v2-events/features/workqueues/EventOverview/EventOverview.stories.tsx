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

import type { Meta, StoryObj } from '@storybook/react'
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import React from 'react'
import superjson from 'superjson'
import {
  ActionType,
  generateEventDraftDocument,
  ActionStatus,
  getUUID,
  createPrng,
  getRandomDatetime,
  tennisClubMembershipEvent,
  getCurrentEventState,
  UUID
} from '@opencrvs/commons/client'
import { SystemRole } from '@opencrvs/commons/client'
import {
  AppRouter,
  trpcOptionsProxy,
  TRPCProvider
} from '@client/v2-events/trpc'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { tennisClubMembershipEventDocument } from '@client/v2-events/features/events/fixtures'
import { setEventData, addLocalEventConfig } from '../../events/useEvents/api'
import { EventOverviewIndex } from './EventOverview'

const meta: Meta<typeof EventOverviewIndex> = {
  title: 'EventOverview',
  component: EventOverviewIndex,
  decorators: [
    (Story) => (
      <TRPCProvider>
        <Story />
      </TRPCProvider>
    )
  ]
}

export default meta
type Story = StoryObj<typeof EventOverviewIndex>

const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [
    httpLink({
      url: '/api/events'
    })
  ],
  transformer: { input: superjson, output: superjson }
})

const defaultEvent = {
  ...tennisClubMembershipEventDocument,
  actions: tennisClubMembershipEventDocument.actions.filter(
    (action) => action.type !== ActionType.REGISTER
  )
}

export const Overview: Story = {
  parameters: {
    offline: {
      events: [defaultEvent]
    },
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.OVERVIEW.buildPath({
        eventId: defaultEvent.id
      })
    },
    msw: {
      handlers: {
        events: [
          tRPCMsw.event.search.query(() => {
            return [
              getCurrentEventState(defaultEvent, tennisClubMembershipEvent)
            ]
          })
        ],
        drafts: [
          tRPCMsw.event.draft.list.query(() => {
            return [
              generateEventDraftDocument({
                eventId: defaultEvent.id,
                actionType: ActionType.REGISTER,
                declaration: {
                  'applicant.name': {
                    firstname: 'Riku',
                    surname: 'This value is from a draft'
                  }
                }
              })
            ]
          })
        ]
      }
    }
  }
}

export const WithAcceptedRegisterEvent: Story = {
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.OVERVIEW.buildPath({
        eventId: tennisClubMembershipEventDocument.id
      })
    },
    msw: {
      handlers: {
        drafts: [
          tRPCMsw.event.draft.list.query(() => {
            return [
              generateEventDraftDocument({
                eventId: tennisClubMembershipEventDocument.id,
                actionType: ActionType.REGISTER,
                declaration: {
                  'applicant.name': {
                    firstname: 'Riku',
                    surname: 'This value is from a draft'
                  }
                }
              })
            ]
          })
        ]
      }
    }
  }
}

export const WithRejectedAction: Story = {
  beforeEach: () => {
    const event = {
      ...tennisClubMembershipEventDocument,
      actions: tennisClubMembershipEventDocument.actions.concat([
        {
          type: ActionType.ARCHIVE,
          status: ActionStatus.Accepted,
          id: getUUID(),
          transactionId: getUUID(),
          createdAt: new Date().toISOString(),
          createdByUserType: 'user',
          createdBy: '123',
          createdAtLocation: '123' as UUID,
          createdByRole: 'LOCAL_REGISTRAR',
          declaration: {},
          reason: { message: 'Archived', isDuplicate: true }
        }
      ])
    }
    setEventData(event.id, event)
  },
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.OVERVIEW.buildPath({
        eventId: tennisClubMembershipEventDocument.id
      })
    },
    msw: {
      handlers: {
        drafts: [
          tRPCMsw.event.draft.list.query(() => {
            return []
          })
        ]
      }
    }
  }
}

export const WithSystemUserActions: Story = {
  beforeEach: () => {
    const rng = createPrng(1234)

    const event = {
      ...tennisClubMembershipEventDocument,
      actions: [
        {
          type: ActionType.CREATE,
          status: ActionStatus.Accepted,
          id: getUUID(),
          transactionId: getUUID(),
          createdAt: getRandomDatetime(
            rng,
            new Date('2024-01-01'),
            new Date('2024-02-01')
          ),
          createdBy: '010101',
          createdAtLocation: undefined,
          createdByUserType: 'system' as const,
          createdByRole: SystemRole.enum.HEALTH,
          assignedTo: '010101',
          declaration: {}
        },
        {
          type: ActionType.ASSIGN,
          status: ActionStatus.Accepted,
          id: getUUID(),
          transactionId: getUUID(),
          createdAt: getRandomDatetime(
            rng,
            new Date('2024-02-01'),
            new Date('2024-03-01')
          ),
          createdBy: '010101',
          createdAtLocation: undefined,
          createdByUserType: 'system' as const,
          createdByRole: SystemRole.enum.HEALTH,
          assignedTo: '010101',
          declaration: {}
        },
        {
          type: ActionType.NOTIFY,
          status: ActionStatus.Accepted,
          id: getUUID(),
          transactionId: getUUID(),
          createdAt: getRandomDatetime(
            rng,
            new Date('2024-03-01'),
            new Date('2024-04-01')
          ),
          createdBy: '010101',
          createdAtLocation: undefined,
          createdByUserType: 'system' as const,
          createdByRole: SystemRole.enum.HEALTH,
          declaration: {}
        },
        {
          type: ActionType.UNASSIGN,
          status: ActionStatus.Accepted,
          id: getUUID(),
          transactionId: getUUID(),
          createdAt: getRandomDatetime(
            rng,
            new Date('2024-04-01'),
            new Date('2024-05-01')
          ),
          createdBy: '010101',
          createdAtLocation: undefined,
          createdByUserType: 'system' as const,
          createdByRole: SystemRole.enum.HEALTH,
          assignedTo: null,
          declaration: {}
        },
        {
          type: ActionType.DECLARE,
          status: ActionStatus.Accepted,
          id: getUUID(),
          transactionId: getUUID(),
          createdAt: getRandomDatetime(
            rng,
            new Date('2024-05-01'),
            new Date('2024-06-01')
          ),
          createdBy: '123',
          createdByUserType: 'user' as const,
          createdAtLocation: '123' as UUID,
          createdByRole: 'LOCAL_REGISTRAR',
          declaration: {}
        }
      ]
    }
    setEventData(event.id, event)
  },
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.OVERVIEW.buildPath({
        eventId: tennisClubMembershipEventDocument.id
      })
    },
    msw: {
      handlers: {
        drafts: [
          tRPCMsw.event.draft.list.query(() => {
            return [
              generateEventDraftDocument({
                eventId: tennisClubMembershipEventDocument.id,
                actionType: ActionType.REGISTER,
                declaration: {
                  'applicant.name': {
                    firstname: 'Riku',
                    surname: 'This value is from a draft'
                  }
                }
              })
            ]
          })
        ]
      }
    }
  }
}

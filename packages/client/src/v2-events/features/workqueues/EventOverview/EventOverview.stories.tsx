/* eslint-disable max-lines */
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
  UUID,
  SystemRole,
  FullDocumentPath,
  TokenUserType
} from '@opencrvs/commons/client'
import { AppRouter, TRPCProvider } from '@client/v2-events/trpc'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { tennisClubMembershipEventDocument } from '@client/v2-events/features/events/fixtures'
import { testDataGenerator } from '@client/tests/test-data-generators'
import { setEventData } from '../../events/useEvents/api'
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

const mockUser = {
  id: '67bda93bfc07dee78ae558cf',
  name: [
    {
      use: 'en',
      given: ['Kalusha'],
      family: 'Bwalya'
    }
  ],
  scope: ['record.register', 'record.registration-correct'],
  role: 'SOCIAL_WORKER',
  exp: '1739881718',
  algorithm: 'RS256',
  userType: TokenUserType.enum.user,
  signature: 'signature.png' as FullDocumentPath,
  sub: '677b33fea7efb08730f3abfa33',
  avatar: undefined,
  primaryOfficeId: '028d2c85-ca31-426d-b5d1-2cef545a4902' as UUID
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
            return {
              results: [
                getCurrentEventState(defaultEvent, tennisClubMembershipEvent, {
                  user: mockUser
                })
              ],
              total: 1
            }
          })
        ],
        drafts: [
          tRPCMsw.event.draft.list.query(() => {
            return [
              generateEventDraftDocument({
                eventId: defaultEvent.id,
                actionType: ActionType.REGISTER,
                context: { user: mockUser },
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
                context: { user: mockUser },
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
          createdBy: testDataGenerator().user.id.localRegistrar,
          createdAtLocation: 'a45b982a-5c7b-4bd9-8fd8-a42d0994054c' as UUID,
          createdByRole: 'LOCAL_REGISTRAR',
          declaration: {},
          content: { reason: 'Archived' }
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
          createdBy: testDataGenerator().user.id.localRegistrar,
          createdByUserType: 'user' as const,
          createdAtLocation: 'a45b982a-5c7b-4bd9-8fd8-a42d0994054c' as UUID,
          createdByRole: 'LOCAL_REGISTRAR',
          declaration: {}
        },
        {
          id: '9e048856-8c4d-4f85-8b7f-5f13885d2374' as UUID,
          status: ActionStatus.Accepted,
          declaration: {},
          type: ActionType.ASSIGN,
          createdBy: testDataGenerator().user.id.localRegistrar,
          createdByRole: 'LOCAL_REGISTRAR',
          createdByUserType: 'user' as const,
          createdAt: '2025-01-23T05:35:27.689Z',
          createdAtLocation: 'a45b982a-5c7b-4bd9-8fd8-a42d0994054c' as UUID,
          assignedTo: testDataGenerator().user.id.localRegistrar,
          transactionId: 'aasdk342-asdkj3423-kn234k26'
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

export const WithVariousUserRoles: Story = {
  beforeEach: () => {
    const rng = createPrng(5678)

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
          createdBy: testDataGenerator().user.id.localRegistrar, // not necessary for this test
          createdAtLocation: 'loc-001' as UUID,
          createdByUserType: 'user' as const,
          createdByRole: 'LOCAL_REGISTRAR', // testing role
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
          createdBy: testDataGenerator().user.id.fieldAgent,
          createdAtLocation: 'loc-002' as UUID,
          createdByUserType: 'user' as const,
          createdByRole: 'SOCIAL_WORKER',
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
          createdBy: testDataGenerator().user.id.fieldAgent,
          createdAtLocation: 'loc-003' as UUID,
          createdByUserType: 'user' as const,
          createdByRole: 'FIELD_AGENT',
          declaration: {}
        },
        {
          type: ActionType.REGISTER,
          status: ActionStatus.Accepted,
          id: getUUID(),
          transactionId: getUUID(),
          createdAt: getRandomDatetime(
            rng,
            new Date('2024-05-01'),
            new Date('2024-06-01')
          ),
          createdBy: 'system-123',
          createdAtLocation: undefined,
          createdByUserType: 'system' as const,
          createdByRole: SystemRole.enum.IMPORT,
          declaration: {}
        },
        {
          type: ActionType.READ,
          status: ActionStatus.Accepted,
          id: getUUID(),
          transactionId: getUUID(),
          createdAt: getRandomDatetime(
            rng,
            new Date('2024-03-01'),
            new Date('2024-04-01')
          ),
          createdBy: testDataGenerator().user.id.fieldAgent,
          createdAtLocation: 'loc-003' as UUID,
          createdByUserType: 'user' as const,
          createdByRole: 'POLICE_OFFICER',
          declaration: {}
        },
        {
          type: ActionType.READ,
          status: ActionStatus.Accepted,
          id: getUUID(),
          transactionId: getUUID(),
          createdAt: getRandomDatetime(
            rng,
            new Date('2024-03-01'),
            new Date('2024-04-01')
          ),
          createdBy: testDataGenerator().user.id.fieldAgent,
          createdAtLocation: 'loc-003' as UUID,
          createdByUserType: 'user' as const,
          createdByRole: 'LOCAL_LEADER',
          declaration: {}
        },
        {
          type: ActionType.READ,
          status: ActionStatus.Accepted,
          id: getUUID(),
          transactionId: getUUID(),
          createdAt: getRandomDatetime(
            rng,
            new Date('2024-03-01'),
            new Date('2024-04-01')
          ),
          createdBy: testDataGenerator().user.id.fieldAgent,
          createdAtLocation: 'loc-003' as UUID,
          createdByUserType: 'user' as const,
          createdByRole: 'HOSPITAL_CLERK',
          declaration: {}
        },
        {
          type: ActionType.READ,
          status: ActionStatus.Accepted,
          id: getUUID(),
          transactionId: getUUID(),
          createdAt: getRandomDatetime(
            rng,
            new Date('2024-03-01'),
            new Date('2024-04-01')
          ),
          createdBy: testDataGenerator().user.id.fieldAgent,
          createdAtLocation: 'loc-003' as UUID,
          createdByUserType: 'user' as const,
          createdByRole: 'LOCAL_SYSTEM_ADMIN',
          declaration: {}
        },
        {
          type: ActionType.READ,
          status: ActionStatus.Accepted,
          id: getUUID(),
          transactionId: getUUID(),
          createdAt: getRandomDatetime(
            rng,
            new Date('2024-03-01'),
            new Date('2024-04-01')
          ),
          createdBy: testDataGenerator().user.id.fieldAgent,
          createdAtLocation: 'loc-003' as UUID,
          createdByUserType: 'user' as const,
          createdByRole: 'NATIONAL_REGISTRAR',
          declaration: {}
        },
        {
          type: ActionType.READ,
          status: ActionStatus.Accepted,
          id: getUUID(),
          transactionId: getUUID(),
          createdAt: getRandomDatetime(
            rng,
            new Date('2024-03-01'),
            new Date('2024-04-01')
          ),
          createdBy: testDataGenerator().user.id.fieldAgent,
          createdAtLocation: 'loc-003' as UUID,
          createdByUserType: 'user' as const,
          createdByRole: 'NATIONAL_SYSTEM_ADMIN',
          declaration: {}
        },
        {
          type: ActionType.READ,
          status: ActionStatus.Accepted,
          id: getUUID(),
          transactionId: getUUID(),
          createdAt: getRandomDatetime(
            rng,
            new Date('2024-03-01'),
            new Date('2024-04-01')
          ),
          createdBy: testDataGenerator().user.id.fieldAgent,
          createdAtLocation: 'loc-003' as UUID,
          createdByUserType: 'user' as const,
          createdByRole: 'COMMUNITY_LEADER',
          declaration: {}
        },
        {
          type: ActionType.READ,
          status: ActionStatus.Accepted,
          id: getUUID(),
          transactionId: getUUID(),
          createdAt: getRandomDatetime(
            rng,
            new Date('2024-03-01'),
            new Date('2024-04-01')
          ),
          createdBy: testDataGenerator().user.id.fieldAgent,
          createdAtLocation: 'loc-003' as UUID,
          createdByUserType: 'user' as const,
          createdByRole: 'HEALTH',
          declaration: {}
        },
        {
          type: ActionType.READ,
          status: ActionStatus.Accepted,
          id: getUUID(),
          transactionId: getUUID(),
          createdAt: getRandomDatetime(
            rng,
            new Date('2024-03-01'),
            new Date('2024-04-01')
          ),
          createdBy: testDataGenerator().user.id.fieldAgent,
          createdAtLocation: 'loc-003' as UUID,
          createdByUserType: 'user' as const,
          createdByRole: 'NATIONAL_ID',
          declaration: {}
        },
        {
          type: ActionType.READ,
          status: ActionStatus.Accepted,
          id: getUUID(),
          transactionId: getUUID(),
          createdAt: getRandomDatetime(
            rng,
            new Date('2024-03-01'),
            new Date('2024-04-01')
          ),
          createdBy: testDataGenerator().user.id.fieldAgent,
          createdAtLocation: 'loc-003' as UUID,
          createdByUserType: 'user' as const,
          createdByRole: 'RECORD_SEARCH',
          declaration: {}
        },
        {
          type: ActionType.READ,
          status: ActionStatus.Accepted,
          id: getUUID(),
          transactionId: getUUID(),
          createdAt: getRandomDatetime(
            rng,
            new Date('2024-03-01'),
            new Date('2024-04-01')
          ),
          createdBy: testDataGenerator().user.id.fieldAgent,
          createdAtLocation: 'loc-003' as UUID,
          createdByUserType: 'user' as const,
          createdByRole: 'WEBHOOK',
          declaration: {}
        },
        {
          id: '9e048856-8c4d-4f85-8b7f-5f13885d2374' as UUID,
          status: ActionStatus.Accepted,
          declaration: {},
          type: ActionType.ASSIGN,
          createdBy: testDataGenerator().user.id.localRegistrar,
          createdByRole: 'LOCAL_REGISTRAR',
          createdByUserType: 'user' as const,
          createdAt: '2025-01-23T05:35:27.689Z',
          createdAtLocation: 'a45b982a-5c7b-4bd9-8fd8-a42d0994054c' as UUID,
          assignedTo: testDataGenerator().user.id.localRegistrar,
          transactionId: 'aasdk342-asdkj3423-kn234k26'
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
                    firstname: 'Sara',
                    surname: 'Covers various roles'
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

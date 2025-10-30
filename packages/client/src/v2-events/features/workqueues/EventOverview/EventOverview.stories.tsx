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
import { userEvent, within } from '@storybook/test'
import addDays from 'date-fns/addDays'
import {
  ActionType,
  generateEventDraftDocument,
  ActionStatus,
  getUUID,
  createPrng,
  generateRandomDatetime,
  tennisClubMembershipEvent,
  getCurrentEventState,
  UUID,
  SystemRole,
  TestUserRole,
  generateActionDocument,
  ActionDocument,
  generateUuid,
  generateTrackingId,
  generateRandomSignature
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
  parameters: {
    userRole: TestUserRole.enum.LOCAL_REGISTRAR
  },
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

const refData = testDataGenerator()

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
            return {
              results: [
                getCurrentEventState(defaultEvent, tennisClubMembershipEvent)
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
          createdBy: refData.user.id.localRegistrar,
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
          createdAt: generateRandomDatetime(
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
          createdAt: generateRandomDatetime(
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
          createdAt: generateRandomDatetime(
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
          createdAt: generateRandomDatetime(
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
          createdAt: generateRandomDatetime(
            rng,
            new Date('2024-05-01'),
            new Date('2024-06-01')
          ),
          createdBy: refData.user.id.localRegistrar,
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
          createdBy: refData.user.id.localRegistrar,
          createdByRole: 'LOCAL_REGISTRAR',
          createdByUserType: 'user' as const,
          createdAt: '2025-01-23T05:35:27.689Z',
          createdAtLocation: 'a45b982a-5c7b-4bd9-8fd8-a42d0994054c' as UUID,
          assignedTo: refData.user.id.localRegistrar,
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
          createdAt: generateRandomDatetime(
            rng,
            new Date('2024-01-01'),
            new Date('2024-02-01')
          ),
          createdBy: refData.user.id.localRegistrar, // not necessary for this test
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
          createdAt: generateRandomDatetime(
            rng,
            new Date('2024-02-01'),
            new Date('2024-03-01')
          ),
          createdBy: refData.user.id.fieldAgent,
          createdAtLocation: 'loc-002' as UUID,
          createdByUserType: 'user' as const,
          createdByRole: 'HOSPITAL_CLERK',
          assignedTo: '010101',
          declaration: {}
        },
        {
          type: ActionType.NOTIFY,
          status: ActionStatus.Accepted,
          id: getUUID(),
          transactionId: getUUID(),
          createdAt: generateRandomDatetime(
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
          createdAt: generateRandomDatetime(
            rng,
            new Date('2024-05-01'),
            new Date('2024-06-01')
          ),
          createdBy: 'system-123',
          createdAtLocation: undefined,
          createdByUserType: 'system' as const,
          createdByRole: SystemRole.enum.IMPORT_EXPORT,
          declaration: {}
        },
        {
          type: ActionType.READ,
          status: ActionStatus.Accepted,
          id: getUUID(),
          transactionId: getUUID(),
          createdAt: generateRandomDatetime(
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
          createdAt: generateRandomDatetime(
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
          createdAt: generateRandomDatetime(
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
          createdAt: generateRandomDatetime(
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
          createdAt: generateRandomDatetime(
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
          createdAt: generateRandomDatetime(
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
          createdAt: generateRandomDatetime(
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
          createdAt: generateRandomDatetime(
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
          createdAt: generateRandomDatetime(
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
          createdAt: generateRandomDatetime(
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
          createdAt: generateRandomDatetime(
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

const actionDefaults = {
  createdAt: generateRandomDatetime(
    createPrng(73),
    new Date('2024-03-01'),
    new Date('2024-04-01')
  ),
  createdBy: refData.user.id.localRegistrar,
  createdByRole: TestUserRole.enum.LOCAL_REGISTRAR,
  createdAtLocation: refData.user.localRegistrar().v2.primaryOfficeId
} satisfies Partial<ActionDocument>

const duplicateEvent = {
  ...tennisClubMembershipEventDocument,
  actions: [
    generateActionDocument({
      configuration: tennisClubMembershipEvent,
      action: ActionType.CREATE,
      defaults: actionDefaults
    }),
    generateActionDocument({
      configuration: tennisClubMembershipEvent,
      action: ActionType.ASSIGN,
      defaults: {
        ...actionDefaults,
        assignedTo: refData.user.id.localRegistrar
      }
    }),
    generateActionDocument({
      configuration: tennisClubMembershipEvent,
      action: ActionType.DECLARE,
      defaults: actionDefaults
    }),
    generateActionDocument({
      configuration: tennisClubMembershipEvent,
      action: ActionType.DUPLICATE_DETECTED,
      defaults: actionDefaults
    }),
    generateActionDocument({
      configuration: tennisClubMembershipEvent,
      action: ActionType.ASSIGN,
      defaults: {
        ...actionDefaults,
        assignedTo: refData.user.id.localRegistrar
      }
    })
  ]
}
export const WithDuplicateDetectedAction: Story = {
  parameters: {
    offline: {
      events: [duplicateEvent]
    },
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.OVERVIEW.buildPath({
        eventId: duplicateEvent.id
      })
    },
    msw: {
      handlers: {
        events: [
          tRPCMsw.event.search.query(() => {
            return {
              results: [
                getCurrentEventState(duplicateEvent, tennisClubMembershipEvent)
              ],
              total: 1
            }
          })
        ]
      }
    }
  }
}

export const WithDuplicateDetectedActionModal: Story = {
  parameters: {
    offline: {
      events: [duplicateEvent]
    },
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.OVERVIEW.buildPath({
        eventId: duplicateEvent.id
      })
    },
    msw: {
      handlers: {
        events: [
          tRPCMsw.event.search.query(() => {
            return {
              results: [
                getCurrentEventState(duplicateEvent, tennisClubMembershipEvent)
              ],
              total: 1
            }
          })
        ]
      }
    }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      await canvas.findByRole('button', {
        name: 'Flagged as potential duplicate'
      })
    )
  }
}

const rng = createPrng(33123)
const validateActionUuid = generateUuid(rng)

const annotationUpdateOnValidateEvent = {
  id: getUUID(),
  type: 'tennis-club-membership',
  actions: [
    generateActionDocument({
      action: ActionType.CREATE,
      configuration: tennisClubMembershipEvent,
      defaults: {
        ...actionDefaults,
        createdAt: actionDefaults.createdAt
      }
    }),
    generateActionDocument({
      action: ActionType.DECLARE,
      configuration: tennisClubMembershipEvent,
      defaults: {
        ...actionDefaults,
        createdAt: addDays(new Date(actionDefaults.createdAt), 1).toISOString(),
        annotation: {
          'review.signature': generateRandomSignature(rng)
        }
      }
    }),
    generateActionDocument({
      action: ActionType.VALIDATE,
      configuration: tennisClubMembershipEvent,
      declarationOverrides: {},
      defaults: {
        ...actionDefaults,
        createdAt: addDays(new Date(actionDefaults.createdAt), 2).toISOString(),
        id: validateActionUuid,
        status: ActionStatus.Requested,
        annotation: {
          'review.signature': generateRandomSignature(rng)
        }
      }
    }),
    generateActionDocument({
      action: ActionType.VALIDATE,
      configuration: tennisClubMembershipEvent,
      declarationOverrides: {},
      defaults: {
        ...actionDefaults,
        createdAt: addDays(new Date(actionDefaults.createdAt), 2).toISOString(),
        status: ActionStatus.Accepted,
        originalActionId: validateActionUuid
      }
    }),
    generateActionDocument({
      configuration: tennisClubMembershipEvent,
      action: ActionType.ASSIGN,
      defaults: {
        ...actionDefaults,
        createdAt: addDays(new Date(actionDefaults.createdAt), 3).toISOString(),
        assignedTo: refData.user.id.localRegistrar
      }
    })
  ],
  trackingId: generateTrackingId(rng),
  updatedAt: actionDefaults.createdAt,
  createdAt: actionDefaults.createdAt
}

export const WithAnnotationChangeOnValidate: Story = {
  parameters: {
    offline: {
      events: [annotationUpdateOnValidateEvent]
    },
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.OVERVIEW.buildPath({
        eventId: annotationUpdateOnValidateEvent.id
      })
    },
    msw: {
      handlers: {
        events: [
          tRPCMsw.event.search.query(() => {
            return {
              results: [
                getCurrentEventState(
                  annotationUpdateOnValidateEvent,
                  tennisClubMembershipEvent
                )
              ],
              total: 1
            }
          })
        ]
      }
    }
  }
}

const registerActionUuid = generateUuid(rng)
const annotationChangeDuringRegisterEvent = {
  id: getUUID(),
  type: 'tennis-club-membership',
  actions: [
    generateActionDocument({
      action: ActionType.CREATE,
      configuration: tennisClubMembershipEvent
    }),
    generateActionDocument({
      action: ActionType.DECLARE,
      configuration: tennisClubMembershipEvent,
      defaults: {
        ...actionDefaults,
        createdAt: addDays(new Date(actionDefaults.createdAt), 1).toISOString(),
        annotation: {
          'review.signature': generateRandomSignature(rng)
        }
      }
    }),
    generateActionDocument({
      action: ActionType.VALIDATE,
      configuration: tennisClubMembershipEvent,
      defaults: {
        ...actionDefaults,
        createdAt: addDays(new Date(actionDefaults.createdAt), 2).toISOString()
      },
      declarationOverrides: {}
    }),
    generateActionDocument({
      action: ActionType.REGISTER,
      configuration: tennisClubMembershipEvent,
      declarationOverrides: {},
      defaults: {
        ...actionDefaults,
        createdAt: addDays(new Date(actionDefaults.createdAt), 3).toISOString(),
        id: registerActionUuid,
        status: ActionStatus.Requested,
        annotation: {
          'review.signature': generateRandomSignature(rng)
        }
      }
    }),
    generateActionDocument({
      action: ActionType.REGISTER,
      configuration: tennisClubMembershipEvent,
      declarationOverrides: {},
      defaults: {
        ...actionDefaults,
        createdAt: addDays(new Date(actionDefaults.createdAt), 3).toISOString(),
        originalActionId: registerActionUuid
      }
    }),
    generateActionDocument({
      configuration: tennisClubMembershipEvent,
      action: ActionType.ASSIGN,
      defaults: {
        ...actionDefaults,
        createdAt: addDays(new Date(actionDefaults.createdAt), 3).toISOString(),
        assignedTo: refData.user.id.localRegistrar
      }
    })
  ],
  trackingId: generateTrackingId(rng),
  updatedAt: actionDefaults.createdAt,
  createdAt: actionDefaults.createdAt
}

export const WithAnnotationChangeOnRegister: Story = {
  parameters: {
    offline: {
      events: [annotationChangeDuringRegisterEvent]
    },
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.OVERVIEW.buildPath({
        eventId: annotationChangeDuringRegisterEvent.id
      })
    },
    msw: {
      handlers: {
        events: [
          tRPCMsw.event.search.query(() => {
            return {
              results: [
                getCurrentEventState(
                  annotationChangeDuringRegisterEvent,
                  tennisClubMembershipEvent
                )
              ],
              total: 1
            }
          })
        ]
      }
    }
  }
}

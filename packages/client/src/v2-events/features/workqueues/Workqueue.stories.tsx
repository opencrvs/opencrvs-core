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
import React from 'react'
import superjson from 'superjson'
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import {
  ActionType,
  eventQueryDataGenerator,
  EventStatus,
  generateEventDocument,
  generateEventDraftDocument,
  generateUuid,
  generateWorkqueues,
  tennisClubMembershipEvent,
  UUID
} from '@opencrvs/commons/client'
import { libraryMembershipEvent } from '@opencrvs/commons/client'
import { AppRouter, TRPCProvider } from '@client/v2-events/trpc'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import {
  tennisClubMembershipEventIndex,
  tennisClubMembershipEventDocument
} from '@client/v2-events/features/events/fixtures'
import { WorkqueueIndex } from './index'

const meta: Meta<typeof WorkqueueIndex> = {
  title: 'Workqueue',
  component: WorkqueueIndex,
  decorators: [
    (Story) => (
      <TRPCProvider>
        <Story />
      </TRPCProvider>
    )
  ]
}

export default meta
type Story = StoryObj<typeof WorkqueueIndex>

const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [
    httpLink({
      url: '/api/events'
    })
  ],
  transformer: { input: superjson, output: superjson }
})

const queryData = Array.from(
  { length: 15 },
  (_, i) => eventQueryDataGenerator(undefined, i * 52) // quite literally a magic number. It gives a sample where the test workqueues are not empty
)

export const Workqueue: Story = {
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.WORKQUEUES.WORKQUEUE.buildPath({ slug: 'recent' })
    },
    msw: {
      handlers: {
        workqueues: [
          tRPCMsw.workqueue.config.list.query(() => {
            return generateWorkqueues('recent')
          }),
          tRPCMsw.workqueue.count.query((input) => {
            return input.reduce((acc, { slug }) => {
              return { ...acc, [slug]: queryData.length }
            }, {})
          })
        ],
        event: [
          tRPCMsw.event.get.query(() => {
            return tennisClubMembershipEventDocument
          }),
          tRPCMsw.event.list.query(() => {
            return [tennisClubMembershipEventIndex]
          }),
          tRPCMsw.event.search.query((input) => {
            return { results: queryData, total: queryData.length }
          })
        ]
      }
    }
  }
}

const queryDataWithMultipleEventType = Array.from({ length: 15 }, (_, i) =>
  eventQueryDataGenerator(
    i & 1
      ? undefined
      : {
          type: libraryMembershipEvent.id,
          declaration: {
            'member.firstname': 'Robin',
            'member.surname': 'Milford'
          }
        },
    i * 52
  )
)

export const WorkqueueWithMultipleEventType: Story = {
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.WORKQUEUES.WORKQUEUE.buildPath({ slug: 'recent' })
    },
    offline: {
      configs: [tennisClubMembershipEvent, libraryMembershipEvent]
    },
    msw: {
      handlers: {
        events: [
          tRPCMsw.event.config.get.query(() => {
            return [tennisClubMembershipEvent, libraryMembershipEvent]
          })
        ],
        workqueues: [
          tRPCMsw.workqueue.config.list.query(() => {
            return generateWorkqueues('recent')
          }),
          tRPCMsw.workqueue.count.query((input) => {
            return input.reduce((acc, { slug }) => {
              return { ...acc, [slug]: queryDataWithMultipleEventType.length }
            }, {})
          })
        ],
        event: [
          tRPCMsw.event.get.query(() => {
            return tennisClubMembershipEventDocument
          }),
          tRPCMsw.event.list.query(() => {
            return [tennisClubMembershipEventIndex]
          }),
          tRPCMsw.event.search.query((input) => {
            return {
              results: queryDataWithMultipleEventType,
              total: queryDataWithMultipleEventType.length
            }
          })
        ]
      }
    }
  }
}

export const WorkqueueWithPagination: Story = {
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.WORKQUEUES.WORKQUEUE.buildPath({
        slug: 'recent'
      })
    },
    parameters: {
      chromatic: { disableSnapshot: true }
    },
    msw: {
      handlers: {
        workqueues: [
          tRPCMsw.workqueue.config.list.query(() => {
            return generateWorkqueues('recent')
          }),
          tRPCMsw.workqueue.count.query((input) => {
            return input.reduce((acc, { slug }) => {
              return { ...acc, [slug]: queryData.length }
            }, {})
          })
        ],
        events: [
          tRPCMsw.event.config.get.query(() => {
            return [tennisClubMembershipEvent]
          }),
          tRPCMsw.event.list.query(() => {
            return queryData
          }),
          tRPCMsw.event.search.query((input) => {
            return { results: queryData, total: queryData.length }
          })
        ]
      }
    }
  }
}

export const ReadyToPrintWorkqueue: Story = {
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.WORKQUEUES.WORKQUEUE.buildPath({
        slug: 'ready-to-print'
      })
    },
    parameters: {
      chromatic: { disableSnapshot: true }
    },
    msw: {
      handlers: {
        workqueues: [
          tRPCMsw.workqueue.config.list.query(() => {
            return generateWorkqueues('ready-to-print')
          }),
          tRPCMsw.workqueue.count.query((input) => {
            return input.reduce((acc, { slug }) => {
              return {
                ...acc,
                [slug]: queryData.filter(
                  (record) => record.status === EventStatus.enum.REGISTERED
                ).length
              }
            }, {})
          })
        ],
        events: [
          tRPCMsw.event.config.get.query(() => {
            return [tennisClubMembershipEvent]
          }),
          tRPCMsw.event.list.query(() => {
            return queryData.filter(
              (record) => record.status === EventStatus.enum.REGISTERED
            )
          }),
          tRPCMsw.event.search.query((input) => {
            const results = queryData.filter(
              (record) => record.status === EventStatus.enum.REGISTERED
            )
            return { results, total: results.length }
          })
        ]
      }
    }
  }
}

export const NoResults: Story = {
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.WORKQUEUES.WORKQUEUE.buildPath({
        slug: 'recent'
      })
    },
    msw: {
      handlers: {
        workqueues: [
          tRPCMsw.workqueue.config.list.query(() => {
            const [recent] = generateWorkqueues('recent')
            return [
              {
                ...recent,
                emptyMessage: {
                  id: 'v2.workqueues.recent.emptyMessage',
                  defaultMessage: 'No recent records',
                  description: 'Empty message for recent workqueue'
                }
              }
            ]
          }),
          tRPCMsw.workqueue.count.query((input) => {
            return input.reduce((acc, { slug }) => {
              return { ...acc, [slug]: 0 }
            }, {})
          })
        ],
        events: [
          tRPCMsw.event.list.query(() => {
            return []
          }),
          tRPCMsw.event.search.query((input) => {
            return { results: [], total: 0 }
          })
        ]
      }
    }
  }
}

const createdEvent = {
  ...generateEventDocument({
    configuration: tennisClubMembershipEvent,
    actions: [ActionType.CREATE]
  })
}

const createdDraft = generateEventDraftDocument({
  eventId: createdEvent.id,
  actionType: ActionType.DECLARE,
  declaration: {
    'applicant.name': {
      firstname: 'Draft for',
      surname: 'Declare'
    }
  }
})

/**
 * Shows draft action based on the event rather than the draft. (action is based on the CREATED state rather than DECLARED state of draft)
 */
export const Draft: Story = {
  parameters: {
    mockingDate: new Date(2024, 7, 12),
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.WORKQUEUES.WORKQUEUE.buildPath({
        slug: 'draft'
      })
    },
    msw: {
      handlers: {
        workqueues: [
          tRPCMsw.workqueue.config.list.query(() => {
            const [recent] = generateWorkqueues('draft')
            return [
              {
                ...recent,
                emptyMessage: {
                  id: 'v2.workqueues.recent.emptyMessage',
                  defaultMessage: 'No recent records',
                  description: 'Empty message for recent workqueue'
                }
              }
            ]
          }),
          tRPCMsw.workqueue.count.query((input) => {
            return input.reduce((acc, { slug }) => {
              return { ...acc, [slug]: 1 }
            }, {})
          })
        ],
        events: [
          tRPCMsw.event.list.query(() => {
            return []
          }),
          tRPCMsw.event.search.query((input) => {
            return { results: [], total: 0 }
          })
        ],
        event: [
          tRPCMsw.event.draft.list.query(() => {
            return [createdDraft]
          }),
          tRPCMsw.event.get.query(() => {
            return createdEvent
          }),
          tRPCMsw.event.search.query((input) => {
            return { results: [], total: 0 }
          })
        ],
        drafts: [
          tRPCMsw.event.draft.list.query(() => {
            return [createdDraft]
          })
        ],
        offline: {
          drafts: [createdDraft]
        }
      }
    }
  }
}

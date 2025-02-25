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
import superjson from 'superjson'
import { graphql, HttpResponse } from 'msw'
import { tennisClubMembershipEvent } from '@opencrvs/commons/client'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { useEventFormData } from '@client/v2-events/features/events/useEventFormData'
import { AppRouter } from '@client/v2-events/trpc'
// eslint-disable-next-line
import { testDataGenerator } from '@client/tests/test-data-generators'
import { tennisClubMembershipEventIndex } from '@client/v2-events/features/events/fixtures'
import { ReviewIndex } from './Review'

const generator = testDataGenerator()

const eventId = '123-456-789'

const meta: Meta<typeof ReviewIndex> = {
  title: 'Declare',
  beforeEach: () => {
    useEventFormData.setState({
      eventId,
      formValues: generator.event.actions.declare(eventId).data
    })
  }
}

export default meta

type Story = StoryObj<typeof ReviewIndex>
const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [
    httpLink({
      url: '/api/events'
    })
  ],
  transformer: { input: superjson, output: superjson }
})

const eventDocument = {
  type: 'TENNIS_CLUB_MEMBERSHIP',
  id: eventId,
  createdAt: '2025-01-23T05:30:02.615Z',
  updatedAt: '2025-01-23T05:35:27.689Z',
  actions: [
    {
      id: 'ae9618d8-319d-48a7-adfe-7ad6cfbc56b7',
      type: 'CREATE' as const,
      createdAt: '2025-01-23T05:30:02.615Z',
      createdBy: '6780dbf7a263c6515c7b97d2',
      createdAtLocation: '052891bf-916a-4332-a76a-dae0ebb0efbf',
      draft: false,
      data: {}
    }
  ]
}

export const ReviewForLocalRegistrarComplete: Story = {
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.DECLARE.REVIEW.buildPath({
        eventId
      })
    },
    msw: {
      handlers: {
        events: [
          tRPCMsw.event.config.get.query(() => {
            return [tennisClubMembershipEvent]
          }),
          tRPCMsw.event.get.query(() => {
            return eventDocument
          }),
          tRPCMsw.event.list.query(() => {
            return [tennisClubMembershipEventIndex]
          })
        ],
        user: [
          graphql.query('fetchUser', () => {
            return HttpResponse.json({
              data: {
                getUser: generator.user.localRegistrar()
              }
            })
          })
        ]
      }
    }
  }
}

export const ReviewForLocalRegistrarIncomplete: Story = {
  beforeEach: () => {
    useEventFormData.setState({
      eventId,
      formValues: {}
    })
  },
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.DECLARE.REVIEW.buildPath({
        eventId
      })
    },
    msw: {
      handlers: {
        events: [
          tRPCMsw.event.config.get.query(() => {
            return [tennisClubMembershipEvent]
          }),
          tRPCMsw.event.get.query(() => {
            return eventDocument
          }),
          tRPCMsw.event.list.query(() => {
            return [tennisClubMembershipEventIndex]
          })
        ],
        user: [
          graphql.query('fetchUser', () => {
            return HttpResponse.json({
              data: {
                getUser: generator.user.localRegistrar()
              }
            })
          })
        ]
      }
    }
  }
}

export const ReviewForRegistrationAgentComplete: Story = {
  beforeEach: () => {
    useEventFormData.setState({
      eventId,
      formValues: generator.event.actions.declare(eventId).data
    })

    window.localStorage.setItem(
      'opencrvs',
      generator.user.token.registrationAgent
    )
  },
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.DECLARE.REVIEW.buildPath({
        eventId
      })
    },
    msw: {
      handlers: {
        events: [
          tRPCMsw.event.config.get.query(() => {
            return [tennisClubMembershipEvent]
          }),
          tRPCMsw.event.get.query(() => {
            return eventDocument
          }),
          tRPCMsw.event.list.query(() => {
            return [tennisClubMembershipEventIndex]
          })
        ],
        user: [
          graphql.query('fetchUser', () => {
            return HttpResponse.json({
              data: {
                getUser: generator.user.registrationAgent()
              }
            })
          })
        ]
      }
    }
  }
}

export const ReviewForRegistrationAgentIncomplete: Story = {
  beforeEach: () => {
    useEventFormData.setState({
      eventId,
      formValues: {}
    })

    window.localStorage.setItem(
      'opencrvs',
      generator.user.token.registrationAgent
    )
  },
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.DECLARE.REVIEW.buildPath({
        eventId
      })
    },
    msw: {
      handlers: {
        events: [
          tRPCMsw.event.config.get.query(() => {
            return [tennisClubMembershipEvent]
          }),
          tRPCMsw.event.get.query(() => {
            return eventDocument
          }),
          tRPCMsw.event.list.query(() => {
            return [tennisClubMembershipEventIndex]
          })
        ],
        user: [
          graphql.query('fetchUser', () => {
            return HttpResponse.json({
              data: {
                getUser: generator.user.registrationAgent()
              }
            })
          })
        ]
      }
    }
  }
}
export const ReviewForFieldAgentComplete: Story = {
  beforeEach: () => {
    useEventFormData.setState({
      eventId,
      formValues: generator.event.actions.declare(eventId).data
    })

    window.localStorage.setItem('opencrvs', generator.user.token.fieldAgent)
  },
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.DECLARE.REVIEW.buildPath({
        eventId
      })
    },
    msw: {
      handlers: {
        events: [
          tRPCMsw.event.config.get.query(() => {
            return [tennisClubMembershipEvent]
          }),
          tRPCMsw.event.get.query(() => {
            return eventDocument
          }),
          tRPCMsw.event.list.query(() => {
            return [tennisClubMembershipEventIndex]
          })
        ],
        user: [
          graphql.query('fetchUser', () => {
            return HttpResponse.json({
              data: {
                getUser: generator.user.fieldAgent()
              }
            })
          })
        ]
      }
    }
  }
}

export const ReviewForFieldAgentIncomplete: Story = {
  beforeEach: () => {
    useEventFormData.setState({
      eventId,
      formValues: {}
    })

    window.localStorage.setItem('opencrvs', generator.user.token.fieldAgent)
  },
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.DECLARE.REVIEW.buildPath({
        eventId
      })
    },
    msw: {
      handlers: {
        events: [
          tRPCMsw.event.config.get.query(() => {
            return [tennisClubMembershipEvent]
          }),
          tRPCMsw.event.get.query(() => {
            return eventDocument
          }),
          tRPCMsw.event.list.query(() => {
            return [tennisClubMembershipEventIndex]
          })
        ],
        user: [
          graphql.query('fetchUser', () => {
            return HttpResponse.json({
              data: {
                getUser: generator.user.fieldAgent()
              }
            })
          })
        ]
      }
    }
  }
}

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
import { graphql, http, HttpResponse } from 'msw'
import superjson from 'superjson'
import {
  ActionType,
  FullDocumentPath,
  generateEventDocument,
  generateEventDraftDocument,
  tennisClubMembershipEvent,
  UUID
} from '@opencrvs/commons/client'
import { AppRouter, trpcOptionsProxy } from '@client/v2-events/trpc'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { testDataGenerator } from '@client/tests/test-data-generators'
import {
  tennisClubMembershipEventIndex,
  TestImage
} from '@client/v2-events/features/events/fixtures'

import { ReviewIndex } from './Review'

const generator = testDataGenerator()

const eventDocument = generateEventDocument({
  configuration: tennisClubMembershipEvent,
  actions: [ActionType.CREATE]
})

const eventId = eventDocument.id

const notifiedEventDocument = generateEventDocument({
  configuration: tennisClubMembershipEvent,
  actions: [ActionType.CREATE, ActionType.NOTIFY]
})

const rejectedNotifiedEventDocument = generateEventDocument({
  configuration: tennisClubMembershipEvent,
  actions: [ActionType.CREATE, ActionType.NOTIFY, ActionType.REJECT]
})

const rejectedDeclaerdEventDocument = generateEventDocument({
  configuration: tennisClubMembershipEvent,
  actions: [ActionType.CREATE, ActionType.NOTIFY, ActionType.REJECT]
})

const meta: Meta<typeof ReviewIndex> = {
  title: 'Declare',
  parameters: {
    offline: {
      events: [
        eventDocument,
        notifiedEventDocument,
        rejectedDeclaerdEventDocument,
        rejectedNotifiedEventDocument
      ]
    }
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

const draft = generateEventDraftDocument({
  eventId,
  actionType: ActionType.REGISTER
})

const mockUser = generator.user.fieldAgent().v2

export const ReviewForLocalRegistrarComplete: Story = {
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.DECLARE.REVIEW.buildPath({
        eventId
      })
    },
    offline: {
      drafts: [draft]
    },
    msw: {
      handlers: {
        drafts: [
          tRPCMsw.event.draft.list.query(() => {
            return [draft]
          })
        ],
        events: [
          tRPCMsw.event.config.get.query(() => {
            return [tennisClubMembershipEvent]
          })
        ],
        user: [
          graphql.query('fetchUser', () => {
            return HttpResponse.json({
              data: {
                getUser: generator.user.localRegistrar().v1
              }
            })
          }),
          tRPCMsw.user.list.query(() => {
            return [mockUser]
          }),
          tRPCMsw.user.get.query(() => {
            return mockUser
          })
        ]
      }
    }
  }
}

export const ReviewForLocalRegistrarIncomplete: Story = {
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
          })
        ],
        user: [
          graphql.query('fetchUser', () => {
            return HttpResponse.json({
              data: {
                getUser: generator.user.localRegistrar().v1
              }
            })
          }),
          tRPCMsw.user.list.query(([id]) => {
            return [mockUser]
          }),
          tRPCMsw.user.get.query((id) => {
            return mockUser
          })
        ]
      }
    }
  }
}

export const ReviewForRegistrationAgentComplete: Story = {
  loaders: [
    async () => {
      window.localStorage.setItem(
        'opencrvs',
        generator.user.token.registrationAgent
      )
      //  Intermittent failures starts to happen when global state gets out of whack.
      // // This is a workaround to ensure that the state is reset when similar tests are run in parallel.
      await new Promise((resolve) => setTimeout(resolve, 50))
    }
  ],
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.DECLARE.REVIEW.buildPath({
        eventId
      })
    },
    offline: {
      drafts: [draft]
    },
    msw: {
      handlers: {
        drafts: [
          tRPCMsw.event.draft.list.query(() => {
            return [draft]
          })
        ],
        events: [
          tRPCMsw.event.config.get.query(() => {
            return [tennisClubMembershipEvent]
          }),
          tRPCMsw.event.get.query(() => {
            return eventDocument
          })
        ],
        user: [
          graphql.query('fetchUser', () => {
            return HttpResponse.json({
              data: {
                getUser: generator.user.registrationAgent().v1
              }
            })
          }),
          tRPCMsw.user.list.query(([id]) => {
            return [mockUser]
          }),
          tRPCMsw.user.get.query((id) => {
            return mockUser
          })
        ]
      }
    }
  }
}

export const ReviewForRegistrationAgentIncomplete: Story = {
  loaders: [
    async () => {
      window.localStorage.setItem(
        'opencrvs',
        generator.user.token.registrationAgent
      )
      //  Intermittent failures starts to happen when global state gets out of whack.
      // // This is a workaround to ensure that the state is reset when similar tests are run in parallel.
      await new Promise((resolve) => setTimeout(resolve, 50))
    }
  ],
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
          })
        ],
        user: [
          graphql.query('fetchUser', () => {
            return HttpResponse.json({
              data: {
                getUser: generator.user.registrationAgent().v1
              }
            })
          }),
          tRPCMsw.user.list.query(([id]) => {
            return [mockUser]
          }),
          tRPCMsw.user.get.query((id) => {
            return mockUser
          })
        ]
      }
    }
  }
}
export const ReviewForFieldAgentComplete: Story = {
  loaders: [
    async () => {
      window.localStorage.setItem('opencrvs', generator.user.token.fieldAgent)
      //  Intermittent failures starts to happen when global state gets out of whack.
      // // This is a workaround to ensure that the state is reset when similar tests are run in parallel.
      await new Promise((resolve) => setTimeout(resolve, 50))
    }
  ],
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.DECLARE.REVIEW.buildPath({
        eventId
      })
    },
    offline: {
      drafts: [draft]
    },
    msw: {
      handlers: {
        drafts: [
          tRPCMsw.event.draft.list.query(() => {
            return [draft]
          })
        ],
        events: [
          tRPCMsw.event.config.get.query(() => {
            return [tennisClubMembershipEvent]
          })
        ],
        user: [
          graphql.query('fetchUser', () => {
            return HttpResponse.json({
              data: {
                getUser: generator.user.fieldAgent().v1
              }
            })
          }),
          tRPCMsw.user.list.query(([id]) => {
            return [mockUser]
          }),
          tRPCMsw.user.get.query((id) => {
            return mockUser
          })
        ]
      }
    }
  }
}

export const ReviewForFieldAgentIncomplete: Story = {
  loaders: [
    async () => {
      window.localStorage.setItem('opencrvs', generator.user.token.fieldAgent)
      //  Intermittent failures starts to happen when global state gets out of whack.
      // // This is a workaround to ensure that the state is reset when similar tests are run in parallel.
      await new Promise((resolve) => setTimeout(resolve, 50))
    }
  ],
  parameters: {
    offline: {
      events: [eventDocument]
    },
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
          })
        ],
        user: [
          graphql.query('fetchUser', () => {
            return HttpResponse.json({
              data: {
                getUser: generator.user.fieldAgent().v1
              }
            })
          }),
          tRPCMsw.user.list.query(([id]) => {
            return [mockUser]
          }),
          tRPCMsw.user.get.query((id) => {
            return mockUser
          })
        ]
      }
    }
  }
}

const createdEvent = generateEventDocument({
  configuration: tennisClubMembershipEvent,
  actions: [ActionType.CREATE]
})
const declareDraft = generateEventDraftDocument({
  eventId: createdEvent.id,
  actionType: ActionType.DECLARE
})
export const ReviewShowsFilesFromDraft: Story = {
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.DECLARE.REVIEW.buildPath({
        eventId: createdEvent.id
      })
    },
    offline: {
      events: [createdEvent],
      drafts: [declareDraft]
    },
    msw: {
      handlers: {
        drafts: [
          tRPCMsw.event.draft.list.query(() => {
            return [declareDraft]
          })
        ],
        event: [
          tRPCMsw.event.get.query(() => {
            return createdEvent
          })
        ],
        files: [
          http.get('/api/presigned-url/:filePath*', (req) => {
            return HttpResponse.json({
              presignedURL: `http://localhost:3535/ocrvs/${req.params.filePath}`
            })
          }),
          http.get('http://localhost:3535/ocrvs/:id', () => {
            return new HttpResponse(TestImage.Fish, {
              headers: {
                'Content-Type': 'image/svg+xml',
                'Cache-Control': 'no-cache'
              }
            })
          })
        ]
      }
    }
  }
}

export const Notified: Story = {
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.DECLARE.REVIEW.buildPath({
        eventId: notifiedEventDocument.id
      })
    },
    msw: {
      handlers: {
        events: [
          tRPCMsw.event.config.get.query(() => {
            return [tennisClubMembershipEvent]
          }),
          tRPCMsw.event.get.query(() => {
            return notifiedEventDocument
          })
        ],
        user: [
          graphql.query('fetchUser', () => {
            return HttpResponse.json({
              data: {
                getUser: generator.user.localRegistrar().v1
              }
            })
          }),
          tRPCMsw.user.list.query(([id]) => {
            return [mockUser]
          }),
          tRPCMsw.user.get.query((id) => {
            return mockUser
          })
        ]
      }
    }
  }
}

export const RejectedNotified: Story = {
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.DECLARE.REVIEW.buildPath({
        eventId: rejectedNotifiedEventDocument.id
      })
    },
    msw: {
      handlers: {
        events: [
          tRPCMsw.event.config.get.query(() => {
            return [tennisClubMembershipEvent]
          }),
          tRPCMsw.event.get.query(() => {
            return rejectedNotifiedEventDocument
          })
        ],
        user: [
          graphql.query('fetchUser', () => {
            return HttpResponse.json({
              data: {
                getUser: generator.user.localRegistrar().v1
              }
            })
          }),
          tRPCMsw.user.list.query(([id]) => {
            return [mockUser]
          }),
          tRPCMsw.user.get.query((id) => {
            return mockUser
          })
        ]
      }
    }
  }
}

export const RejectedDeclared: Story = {
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.DECLARE.REVIEW.buildPath({
        eventId: rejectedDeclaerdEventDocument.id
      })
    },
    msw: {
      handlers: {
        events: [
          tRPCMsw.event.config.get.query(() => {
            return [tennisClubMembershipEvent]
          }),
          tRPCMsw.event.get.query(() => {
            return rejectedDeclaerdEventDocument
          })
        ],
        user: [
          graphql.query('fetchUser', () => {
            return HttpResponse.json({
              data: {
                getUser: generator.user.localRegistrar().v1
              }
            })
          }),
          tRPCMsw.user.list.query(([id]) => {
            return [mockUser]
          }),
          tRPCMsw.user.get.query((id) => {
            return mockUser
          })
        ]
      }
    }
  }
}

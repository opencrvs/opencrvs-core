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
import superjson from 'superjson'
import React, { Suspense } from 'react'
import { within } from '@storybook/testing-library'
import { waitFor, expect } from '@storybook/test'
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import { http, HttpResponse } from 'msw'
import {
  ActionType,
  generateEventDocument,
  generateEventDraftDocument,
  tennisClubMembershipEvent
} from '@opencrvs/commons/client'
import { TestImage } from '@client/v2-events/features/events/fixtures'
import {
  AppRouter,
  queryClient,
  trpcOptionsProxy,
  TRPCProvider
} from '@client/v2-events/trpc'
import {
  ensureCacheExists,
  CACHE_NAME,
  getCache
} from '@client/v2-events/cache'
import { ROUTES } from '@client/v2-events/routes'
import { withSuspense } from '@client/v2-events/components/withSuspense'
import { useDrafts } from '../../drafts/useDrafts'
import { useEvents } from './useEvents'

const meta: Meta<unknown> = {
  title: 'Hooks/useEvents'
}

export default meta

type Story = StoryObj<unknown>

const createdEvent = generateEventDocument({
  configuration: tennisClubMembershipEvent,
  actions: [ActionType.CREATE]
})

const router = {
  path: '/',
  children: [
    {
      path: ROUTES.V2.EVENTS.DECLARE.REVIEW.path,
      Component: withSuspense(() => {
        const { getEvent } = useEvents()
        /*
         * Explicitly trigger the download of the event
         */
        const event = getEvent.findFromCache(createdEvent.id)

        React.useEffect(() => {
          void event.refetch()
        }, [event, event.refetch])

        /*
         * Explicitly call the hook to trigger draft fetching
         */

        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        queryClient.invalidateQueries({
          queryKey: trpcOptionsProxy.event.draft.list.queryKey()
        })
        useDrafts().getRemoteDraftByEventId(createdEvent.id)

        return (
          <TRPCProvider>
            {event.data && <div>{'Test content'}</div>}
          </TRPCProvider>
        )
      })
    }
  ]
}

const trpcMsw = createTRPCMsw<AppRouter>({
  links: [
    httpLink({
      url: '/api/events'
    })
  ],
  transformer: { input: superjson, output: superjson }
})

const spies = {
  draftList: 0,
  eventGet: 0,
  presignFile: 0,
  uploadFile: 0,
  fetchFile: 0
}

const handlers = {
  drafts: [
    trpcMsw.event.draft.list.query(() => {
      spies.draftList++
      return [
        generateEventDraftDocument({
          eventId: createdEvent.id,
          actionType: ActionType.DECLARE
        })
      ]
    })
  ],
  event: [
    trpcMsw.event.get.query(() => {
      spies.eventGet++
      return createdEvent
    }),
    trpcMsw.event.list.query(() => {
      return []
    })
  ],
  files: [
    http.get('/api/presigned-url/:filePath*', (req) => {
      spies.presignFile++
      return HttpResponse.json({
        presignedURL: `http://localhost:3535/ocrvs/${req.params.filePath}`
      })
    }),
    http.get('http://localhost:3535/ocrvs/:id', () => {
      spies.fetchFile++
      return new HttpResponse(TestImage.Fish, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'no-cache'
        }
      })
    })
  ]
}

export const GetEventHook: Story = {
  name: 'Precaches declaration and draft files',
  args: {
    actionType: ActionType.DECLARE
  },
  loaders: [
    async () => {
      spies.draftList = 0
      spies.eventGet = 0
      spies.presignFile = 0
      spies.uploadFile = 0
      spies.fetchFile = 0

      const cacheKeys = await caches.keys()
      const cacheKey = cacheKeys.find((key) => key === CACHE_NAME)
      if (cacheKey) {
        await caches.delete(cacheKey)
      }

      await ensureCacheExists(CACHE_NAME)
    }
  ],
  parameters: {
    reactRouter: {
      router: router,
      initialPath: ROUTES.V2.EVENTS.DECLARE.REVIEW.buildPath({
        eventId: createdEvent.id
      })
    },
    chromatic: { disableSnapshot: true },
    msw: {
      handlers
    }
  },
  play: async ({ canvasElement, step }) => {
    await step('No cache exists for the presigned urls', async () => {
      const cache = await getCache(CACHE_NAME)
      await expect(cache.matchAll()).resolves.toHaveLength(0)
    })

    await step('Waits for test content to appear', async () => {
      const canvas = within(canvasElement)
      await waitFor(
        async () => {
          return expect(canvas.getByText('Test content')).toBeInTheDocument()
        },
        {
          timeout: 5000
        }
      )
    })

    await step('Retrieves draft list', async () => {
      await waitFor(async () => {
        await expect(spies.draftList).toBe(1)
      })
    })

    await step('Retrieves event data', async () => {
      await waitFor(async () => {
        await expect(spies.eventGet).toBe(1)
      })
    })

    await step('Gets presigned URL for file', async () => {
      await waitFor(async () => {
        await expect(spies.presignFile).toBe(1)
      })
    })

    await step('Fetches file content', async () => {
      await waitFor(async () => {
        await expect(spies.fetchFile).toBe(1)
      })
    })

    await step('Caches the files', async () => {
      const cache = await getCache(CACHE_NAME)
      await waitFor(async () => {
        await expect(cache.matchAll()).resolves.toHaveLength(1)
      })
    })
  }
}

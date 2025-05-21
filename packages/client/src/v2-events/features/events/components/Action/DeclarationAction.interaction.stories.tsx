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
import React from 'react'
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
import { AppRouter, TRPCProvider } from '@client/v2-events/trpc'
import {
  ensureCacheExists,
  CACHE_NAME,
  getCache
} from '@client/v2-events/cache'
import { ROUTES } from '@client/v2-events/routes'
import { DeclarationAction } from './DeclarationAction'

const meta: Meta<typeof DeclarationAction> = {
  title: 'Components/DeclarationAction'
}

export default meta

type Story = StoryObj<typeof DeclarationAction>

const router = {
  path: '/',
  children: [
    {
      path: ROUTES.V2.EVENTS.DECLARE.REVIEW.path,
      Component: () => {
        return (
          <TRPCProvider>
            <DeclarationAction actionType={ActionType.DECLARE}>
              <div>{'Test content'}</div>
            </DeclarationAction>
          </TRPCProvider>
        )
      }
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

const createdEvent = generateEventDocument({
  configuration: tennisClubMembershipEvent,
  actions: [ActionType.CREATE]
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
      return [generateEventDraftDocument(createdEvent.id, ActionType.DECLARE)]
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
    http.get('/api/presigned-url/event-attachments/:filename', (req) => {
      spies.presignFile++
      return HttpResponse.json({
        presignedURL: `http://localhost:3535/ocrvs/${req.params.filename}`
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

export const DeclarationDraftCache: Story = {
  name: 'Precaches draft files for declaration action',
  args: {
    actionType: ActionType.DECLARE
  },
  beforeEach: async () => {
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
  },
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

    const canvas = within(canvasElement)
    await canvas.findByText('Test content')

    await step('Retrieves presigned urls for draft files', async () => {
      await waitFor(async () => {
        await expect(spies.draftList).toBe(1)
        await expect(spies.eventGet).toBe(1)
        await expect(spies.presignFile).toBe(1)
        await expect(spies.fetchFile).toBe(1)
      })
    })

    await step('Caches the files', async () => {
      const cache = await getCache(CACHE_NAME)

      await expect(cache.matchAll()).resolves.toHaveLength(1)
    })
  }
}

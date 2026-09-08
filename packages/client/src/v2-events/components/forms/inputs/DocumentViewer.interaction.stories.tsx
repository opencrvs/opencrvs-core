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
import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, waitFor, userEvent, within } from 'storybook/test'
import { http, HttpResponse } from 'msw'
import { DocumentPath } from '@opencrvs/commons/client'
import { CACHE_NAME } from '@client/v2-events/cache'
import { Option } from '@client/v2-events/utils'
import { TestPdf } from '@client/v2-events/features/events/fixtures'
import { DocumentViewer, DocumentViewerOptionValue } from './DocumentViewer'

// Serves whatever the real app would have precached under this same-origin
// synthetic path, or a 404 if nothing has been cached yet — standing in for
// the real service worker's CacheFirst route, which isn't active in Storybook.
const passiveFileRoute = http.get(
  '/events/:eventId/:filename',
  async ({ request }) => {
    const cache = await caches.open(CACHE_NAME)
    const cached = await cache.match(request)
    return cached ?? new HttpResponse(null, { status: 404 })
  }
)

const meta: Meta<typeof DocumentViewer> = {
  title: 'Inputs/DocumentViewer'
}

export default meta

type Story = StoryObj<typeof DocumentViewer>

const imageOption: Option<DocumentViewerOptionValue> = {
  label: 'Test image',
  value: {
    id: 'test-image',
    filename: 'test-image.png',
    url: 'events/test-event-id/test-image.png' as DocumentPath
  }
}

export const ImageFailsThenRetrySucceeds: Story = {
  // A previous run's retry may have already cached this exact path.
  loaders: [async () => caches.delete(CACHE_NAME)],
  parameters: {
    chromatic: { disableSnapshot: true },
    msw: {
      handlers: {
        files: [
          http.get('/api/presigned-url/:filePath*', () =>
            HttpResponse.json({
              presignedURL: 'http://localhost:3535/ocrvs/tree.svg'
            })
          ),
          http.get(
            'http://localhost:3535/ocrvs/:id',
            () =>
              new HttpResponse('<svg xmlns="http://www.w3.org/2000/svg" />', {
                headers: {
                  'Content-Type': 'image/svg+xml',
                  'Cache-Control': 'no-cache'
                }
              })
          ),
          passiveFileRoute
        ]
      }
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Image fails to load initially', async () => {
      await canvas.findByText('Failed to load document')
    })

    await step('Retry loads the image', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Retry' }))
      await waitFor(async () => {
        await expect(
          canvas.queryByText('Failed to load document')
        ).not.toBeInTheDocument()
      })
      await waitFor(async () => {
        await expect(canvasElement.querySelector('img')).not.toBeNull()
      })
    })
  },
  render: () => <DocumentViewer id="document_section" options={[imageOption]} />
}

const pdfOption: Option<DocumentViewerOptionValue> = {
  label: 'Test document',
  value: {
    id: 'test-document',
    filename: 'test-document.pdf',
    url: 'events/test-event-id/test-document.pdf' as DocumentPath
  }
}

export const PdfFailsThenRetrySucceeds: Story = {
  name: 'PDF fails to load, then loads after retry',
  // A previous run's retry may have already cached this exact path.
  loaders: [async () => caches.delete(CACHE_NAME)],
  parameters: {
    chromatic: { disableSnapshot: true },
    msw: {
      handlers: {
        files: [
          http.get('/api/presigned-url/:filePath*', () =>
            HttpResponse.json({
              presignedURL: 'http://localhost:3535/ocrvs/test.pdf'
            })
          ),
          http.get(
            'http://localhost:3535/ocrvs/:id',
            () =>
              new HttpResponse(TestPdf, {
                headers: {
                  'Content-Type': 'application/pdf',
                  'Cache-Control': 'no-cache'
                }
              })
          ),
          passiveFileRoute
        ]
      }
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('PDF fails to load initially', async () => {
      await canvas.findByText('Failed to load PDF')
    })

    await step('Retry loads and renders the PDF', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Retry' }))
      await waitFor(
        async () => {
          await expect(
            canvas.queryByText('Failed to load PDF')
          ).not.toBeInTheDocument()
        },
        { timeout: 10000 }
      )
      await waitFor(
        async () => {
          await expect(canvasElement.querySelector('canvas')).not.toBeNull()
        },
        { timeout: 10000 }
      )
    })
  },
  render: () => <DocumentViewer id="document_section" options={[pdfOption]} />
}

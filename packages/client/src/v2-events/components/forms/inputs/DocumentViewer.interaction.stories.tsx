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
import { CACHE_NAME, cacheFile } from '@client/v2-events/cache'
import { Option } from '@client/v2-events/utils'
import {
  TestImage,
  TestPdf,
  passiveFileRoute
} from '@client/v2-events/features/events/fixtures'
import { tRPCMsw } from '../../../../../.storybook/default-request-handlers'
import { DocumentViewer, DocumentViewerOptionValue } from './DocumentViewer'

const meta: Meta<typeof DocumentViewer> = {
  title: 'Inputs/DocumentViewer/Interaction'
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
          tRPCMsw.event.file.getPresignedUrl.query(() => ({
            presignedURL: 'http://localhost:3535/ocrvs/tree.svg'
          })),
          http.get(
            'http://localhost:3535/ocrvs/:id',
            () =>
              new HttpResponse(TestImage.Tree, {
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

      // Both checks belong inside the same retrying waitFor: onError/onload
      // fire asynchronously, so a one-off check right after the click can
      // pass by observing the <img> before it has actually settled.
      await waitFor(async () => {
        await expect(
          canvas.queryByText('Failed to load document')
        ).not.toBeInTheDocument()

        const img = canvasElement.querySelector(
          'img'
        ) as HTMLImageElement | null
        await expect(img).not.toBeNull()
        await expect(Boolean(img?.complete && img.naturalWidth > 0)).toBe(true)
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
          tRPCMsw.event.file.getPresignedUrl.query(() => ({
            presignedURL: 'http://localhost:3535/ocrvs/test.pdf'
          })),
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

function createPdfWithPages(pageCount: number) {
  const pageIds = Array.from({ length: pageCount }, (_, i) => i + 5)
  const content = 'BT /F1 12 Tf 10 20 Td (page) Tj ET'
  const objects = [
    '<</Type/Catalog/Pages 2 0 R>>',
    `<</Type/Pages/Kids[${pageIds.map((id) => `${id} 0 R`).join(' ')}]/Count ${pageCount}>>`,
    '<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>',
    `<</Length ${content.length}>>\nstream\n${content}\nendstream`,
    ...pageIds.map(
      () =>
        '<</Type/Page/MediaBox[0 0 200 50]/Parent 2 0 R/Resources<</Font<</F1 3 0 R>>>>/Contents 4 0 R>>'
    )
  ]

  let pdf = '%PDF-1.4\n'
  const offsets = objects.map((object, i) => {
    const offset = pdf.length
    pdf += `${i + 1} 0 obj${object}endobj\n`
    return offset
  })
  const xrefOffset = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  pdf += offsets
    .map((o) => `${String(o).padStart(10, '0')} 00000 n \n`)
    .join('')
  pdf += `trailer<</Size ${objects.length + 1}/Root 1 0 R>>\nstartxref\n${xrefOffset}\n%%EOF`
  return pdf
}

export const FirstPdfPageShowsBeforeAllPagesLoad: Story = {
  name: 'First page of a long PDF shows before all pages load',
  loaders: [
    async () => {
      await caches.delete(CACHE_NAME)
      await cacheFile(
        {
          url: pdfOption.value.url,
          file: new File([createPdfWithPages(1000)], 'test-document.pdf', {
            type: 'application/pdf'
          })
        },
        await caches.open(CACHE_NAME)
      )
    }
  ],
  parameters: {
    chromatic: { disableSnapshot: true },
    msw: { handlers: { files: [passiveFileRoute] } }
  },
  play: async ({ canvasElement }) => {
    await waitFor(
      async () => {
        await expect(canvasElement.querySelector('canvas')).not.toBeNull()
      },
      { timeout: 5000 }
    )
    await waitFor(
      async () => {
        await expect(
          within(canvasElement).queryByText('Loading...')
        ).not.toBeInTheDocument()
      },
      { timeout: 1000 }
    )
  },
  render: () => <DocumentViewer id="document_section" options={[pdfOption]} />
}

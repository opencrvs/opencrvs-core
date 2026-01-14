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

import * as React from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import { useIntl } from 'react-intl'

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.mjs'

const pdfLoadErrorMessage = {
  id: 'error.pdf',
  defaultMessage: 'Failed to load PDF',
  description: 'PDF loading error message'
}
/* Hook to fetch and render PDF */
export function usePreviewPdf(pdfUrl: string) {
  const i18n = useIntl()
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const renderedRef = React.useRef(false)

  React.useEffect(() => {
    if (renderedRef.current) {
      return
    }
    renderedRef.current = true

    let cancelled = false
    const canvases: HTMLCanvasElement[] = []

    async function loadPdf() {
      setLoading(true)
      setError(null)

      const res = await fetch(pdfUrl)
      if (!res.ok) {
        setError(i18n.formatMessage(pdfLoadErrorMessage))
        setLoading(false)
        throw new Error(`Failed to fetch PDF: ${res.status} ${res.statusText}`)
      }

      const arrayBuffer = await res.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      if (cancelled) {
        return
      }

      const container = containerRef.current
      if (!container) {
        return
      }

      // Clear previous canvases
      canvases.forEach((c) => container.removeChild(c))
      canvases.length = 0

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        if (cancelled) {
          break
        }

        const page = await pdf.getPage(pageNum)
        const viewport = page.getViewport({ scale: 1.5 })
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        if (!context) {
          continue
        }

        canvas.width = viewport.width
        canvas.height = viewport.height
        canvas.style.display = 'block'
        canvas.style.margin = '0 auto 16px'

        container.appendChild(canvas)
        canvases.push(canvas)

        page.render({ canvasContext: context, viewport, canvas })
      }

      if (!cancelled) {
        setLoading(false)
      }
    }

    loadPdf().catch((err) => {
      if (!cancelled) {
        // eslint-disable-next-line no-console
        console.error(err)
        setError(i18n.formatMessage(pdfLoadErrorMessage))
        setLoading(false)
      }
    })

    return () => {
      cancelled = true
    }
  }, [pdfUrl, i18n])

  return { containerRef, loading, error }
}

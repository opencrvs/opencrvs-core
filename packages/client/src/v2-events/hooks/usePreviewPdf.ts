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
import { useIntl } from 'react-intl'
import { DocumentPath } from '@opencrvs/commons/client'
import { toFileUrl } from '@client/v2-events/cache'
import { precacheFile } from '@client/v2-events/features/files/useFileUpload'

async function loadPdfJs() {
  if (!('document' in globalThis)) {
    return
  }

  const pdfjsLib: typeof import('pdfjs-dist') | null = await import(
    'pdfjs-dist'
  )
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.mjs'

  return pdfjsLib
}

const pdfLoadErrorMessage = {
  id: 'error.pdf',
  defaultMessage: 'Failed to load PDF',
  description: 'PDF loading error message'
}
/* Hook to fetch and render PDF */
export function usePreviewPdf(path: DocumentPath) {
  const i18n = useIntl()
  const pdfUrl = toFileUrl(path)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const renderedRef = React.useRef(false)
  // Shared across the initial load and any retry, since both call loadPdf().
  const cancelledRef = React.useRef(false)
  const canvasesRef = React.useRef<HTMLCanvasElement[]>([])

  const loadPdf = React.useCallback(async () => {
    setLoading(true)
    setError(null)

    const res = await fetch(pdfUrl)
    if (!res.ok) {
      setError(i18n.formatMessage(pdfLoadErrorMessage))
      setLoading(false)
      throw new Error(`Failed to fetch PDF: ${res.status} ${res.statusText}`)
    }

    const arrayBuffer = await res.arrayBuffer()
    const pdfjsLib = await loadPdfJs()
    if (!pdfjsLib) {
      {
        setError(i18n.formatMessage(pdfLoadErrorMessage))
        setLoading(false)
        throw new Error(`Failed to load pdfjsLib`)
      }
    }
    /*
     * isEvalSupported: false stops pdf.js compiling PostScript functions and font
     * programs with new Function, which the Content-Security-Policy would otherwise
     * have to permit. See #13246.
     */
    const pdf = await pdfjsLib.getDocument({
      data: arrayBuffer,
      isEvalSupported: false
    }).promise
    if (cancelledRef.current) {
      return
    }

    const container = containerRef.current
    if (!container) {
      return
    }

    // Clear previous canvases
    canvasesRef.current.forEach((c) => container.removeChild(c))
    canvasesRef.current = []

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
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
      canvasesRef.current.push(canvas)

      page.render({ canvasContext: context, viewport, canvas })
    }

    setLoading(false)
  }, [pdfUrl, i18n])

  const handleLoadError = React.useCallback(
    (err: unknown) => {
      if (!cancelledRef.current) {
        // eslint-disable-next-line no-console
        console.error(err)
        setError(i18n.formatMessage(pdfLoadErrorMessage))
        setLoading(false)
      }
    },
    [i18n]
  )

  const runLoadPdf = React.useCallback(() => {
    cancelledRef.current = false
    loadPdf().catch(handleLoadError)
  }, [loadPdf, handleLoadError])

  /*
   * pdfUrl is a synthetic same-origin path only ever served from the
   * service worker's cache — there is no real backend route behind it.
   * Unlike the initial load, retry can't assume the cache holds anything
   * usable, so it calls precacheFile to fetch the real presigned URL and
   * (re)populate that cache entry before reading it.
   */
  const retry = React.useCallback(() => {
    cancelledRef.current = false
    setLoading(true)
    setError(null)
    precacheFile(path).then(loadPdf).catch(handleLoadError)
  }, [path, loadPdf, handleLoadError])

  React.useEffect(() => {
    if (renderedRef.current) {
      return
    }
    renderedRef.current = true

    runLoadPdf()

    return () => {
      cancelledRef.current = true
    }
  }, [runLoadPdf])

  return { containerRef, loading, error, retry }
}

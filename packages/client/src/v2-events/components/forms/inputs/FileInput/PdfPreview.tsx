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
import styled, { keyframes } from 'styled-components'
import * as pdfjsLib from 'pdfjs-dist'
import { useIntl } from 'react-intl'
import {
  FileFieldValue,
  FileFieldValueWithOption
} from '@opencrvs/commons/client'
import { AppBar } from '@opencrvs/components/lib/AppBar'
import { Button } from '@opencrvs/components/lib/Button'
import { DividerVertical } from '@opencrvs/components/lib/Divider'
import { Icon } from '@opencrvs/components/lib/Icon'
import { Stack } from '@opencrvs/components/lib/Stack'
import { getUnsignedFileUrl } from '@client/v2-events/cache'
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.mjs'

const ViewerWrapper = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 4;
  width: 100%;
  height: 100%;
  background: ${({ theme }) => theme.colors.white};
  display: flex;
  flex-direction: column;
`

const ViewerContainer = styled.div`
  position: relative;
  flex: 1;
  overflow-y: auto; /* vertical scrolling */
  overflow-x: hidden; /* hide horizontal scroll */
  display: flex;
  flex-direction: column; /* stack pages vertically */
  align-items: center; /* center pages horizontally */
  background: ${({ theme }) => theme.colors.white};

  & canvas {
    margin-bottom: 16px; /* spacing between pages */
    max-width: 90%; /* prevent overflow */
    height: auto; /* maintain aspect ratio */
    display: block;
  }
`

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: ${({ theme }) => theme.colors.white};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 10;
`

const ErrorBox = styled.div`
  position: absolute;
  top: 20%;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  padding: 16px;
  border-radius: 8px;
  z-index: 20;
  ${({ theme }) => theme.fonts.bold12};
`

const SpinnerAnimation = keyframes`
  to { transform: rotate(360deg); }
`

const Spinner = styled.div`
  width: 32px;
  height: 32px;
  border: 4px solid ${({ theme }) => theme.colors.redLight};
  border-top-color: ${({ theme }) => theme.colors.supportingCopy};
  border-radius: 50%;
  animation: ${SpinnerAnimation} 1s linear infinite;
  margin-bottom: 8px;
`

const pdfLoadErrorMessage = {
  id: 'error.pdf',
  defaultMessage: 'Failed to load PDF',
  description: 'PDF loading error message'
}

function PdfViewer({ pdfUrl, title }: { pdfUrl: string; title?: string }) {
  const i18n = useIntl()
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const renderedRef = React.useRef(false)

  React.useEffect(() => {
    if (renderedRef.current) {
      return
    } // skip if already rendered
    renderedRef.current = true

    let cancelled = false
    const canvases: HTMLCanvasElement[] = []

    async function loadPdf() {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch(pdfUrl)
        if (!res.ok) {
          setError(i18n.formatMessage(pdfLoadErrorMessage))
          setLoading(false)
          return
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

        // Clear previous canvases safely
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
      } catch (err) {
        if (!cancelled) {
          /* eslint-disable no-console */
          console.error(err)
          setError(i18n.formatMessage(pdfLoadErrorMessage))
          setLoading(false)
        }
      }
    }

    void loadPdf()

    return () => {
      cancelled = true
    }
  }, [pdfUrl, i18n])

  return (
    <ViewerContainer ref={containerRef} aria-label={title}>
      {loading && (
        <LoadingOverlay>
          <Spinner />
          {'Loading...'}
        </LoadingOverlay>
      )}
      {error && <ErrorBox>{error}</ErrorBox>}
    </ViewerContainer>
  )
}

// === PdfPreview Component ===
interface IProps {
  previewImage:
    | NonNullable<FileFieldValue>
    | NonNullable<FileFieldValueWithOption>
  disableDelete?: boolean
  title?: string
  goBack: () => void
  onDelete: (image: FileFieldValue) => void
  id?: string
}

export function PdfPreview({
  previewImage,
  title,
  goBack,
  onDelete,
  disableDelete,
  id
}: IProps) {
  const fileUrl = getUnsignedFileUrl(previewImage.path)

  return (
    <ViewerWrapper id={id ?? 'preview_image_field'}>
      <AppBar
        desktopLeft={<Icon name="Paperclip" size="large" />}
        desktopRight={
          <Stack gap={8}>
            {!disableDelete && (
              <>
                <DividerVertical />
                <Button
                  id="preview_delete"
                  type="icon"
                  onClick={() => onDelete(previewImage)}
                >
                  <Icon color="red" name="Trash" />
                </Button>
              </>
            )}
            <DividerVertical />
            <Button
              aria-label="Go close"
              id="preview_close"
              size="medium"
              type="icon"
              onClick={goBack}
            >
              <Icon name="X" size="medium" />
            </Button>
          </Stack>
        }
        desktopTitle={title}
        mobileLeft={<Icon name="Paperclip" size="large" />}
        mobileRight={
          <Stack gap={8}>
            {!disableDelete && (
              <Button
                id="preview_delete"
                type="icon"
                onClick={() => onDelete(previewImage)}
              >
                <Icon color="red" name="Trash" />
              </Button>
            )}
            <Button
              aria-label="Go back"
              id="preview_close"
              size="medium"
              type="icon"
              onClick={goBack}
            >
              <Icon name="X" size="medium" />
            </Button>
          </Stack>
        }
        mobileTitle={title}
      />

      <PdfViewer pdfUrl={fileUrl} title={title} />
    </ViewerWrapper>
  )
}

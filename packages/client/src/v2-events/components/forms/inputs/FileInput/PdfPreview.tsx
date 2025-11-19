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
import { useMemo } from 'react'
import styled from 'styled-components'
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
import { getPresignedUrl } from '@client/v2-events/features/files/useFileUpload'

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
`

const ViewerContainer = styled.div`
  position: relative;
  width: 100%;
  height: calc(100% - 56px); /* subtract AppBar height */
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;

  & img {
    max-height: 90%;
    max-width: 90%;
  }

  & embed {
    width: 100%;
    height: 100%;
    border: none;
  }
`
function PdfViewer({ pdfUrl }: { pdfUrl: string }) {
  const [blobUrl, setBlobUrl] = React.useState<string | null>(null)

  React.useEffect(() => {
    let revokeUrl: string | null = null

    async function loadPdf() {
      try {
        const res = await fetch(pdfUrl, { cache: 'force-cache' })
        if (!res.ok) {
          throw new Error('Failed to fetch PDF')
        }

        const blob = await res.blob()
        const url = URL.createObjectURL(blob)

        setBlobUrl(url)
        revokeUrl = url
      } catch (err) {
        console.error('PDF load error:', err)
      }
    }

    loadPdf().catch((error) => {
      console.error('Error loading PDF:', error)
    })

    return () => {
      if (revokeUrl) {
        URL.revokeObjectURL(revokeUrl)
      }
    }
  }, [pdfUrl])

  if (!blobUrl) {
    return <div>Loading PDF…</div>
  }

  return <embed src={blobUrl} type="application/pdf" />
}

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

      <ViewerContainer>
        {/* <embed
          // src={
          //   'http://localhost:3535/ocrvs/1e2f0fce-d427-451d-82b3-3d70ce087032/57b45dcf-06c8-4de1-b6dd-f97f88b0b09a.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20251118%2Flocal%2Fs3%2Faws4_request&X-Amz-Date=20251118T125709Z&X-Amz-Expires=259200&X-Amz-SignedHeaders=host&X-Amz-Signature=fe6664c3ae88c7d4701efa1482c780fc3069c79cc78042bc15e7e28ead4c45e6'
          // }
          src={fileUrl}
          title="pdf"
        /> */}
        <PdfViewer pdfUrl={fileUrl} />
      </ViewerContainer>
    </ViewerWrapper>
  )
}

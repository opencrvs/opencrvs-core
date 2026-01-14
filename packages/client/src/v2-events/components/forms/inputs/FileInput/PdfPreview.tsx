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
import { SimplePdfPreview } from './SimplePdfPreview'

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

      <SimplePdfPreview pdfUrl={fileUrl} title={title} />
    </ViewerWrapper>
  )
}

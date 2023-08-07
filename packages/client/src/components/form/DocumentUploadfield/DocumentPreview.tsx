/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */

import * as React from 'react'
import styled from 'styled-components'
import { IFileValue, IAttachmentValue } from '@client/forms'
import { AppBar } from '@opencrvs/components/lib/AppBar'
import { Stack } from '@opencrvs/components/lib/Stack'
import { Button } from '@opencrvs/components/lib/Button'
import { Icon } from '@opencrvs/components/lib/Icon'
import { DividerVertical } from '@opencrvs/components/lib/Divider'
import PanControls from '@opencrvs/components/lib/DocumentViewer/components/PanControls'
import PanViewer from '@opencrvs/components/lib/DocumentViewer/components/PanViewer'
import { useState } from 'react'

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
  height: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
  & img {
    max-height: 80vh;
    max-width: 80vw;
    width: auto;
  }
`

interface IProps {
  previewImage: IFileValue | IAttachmentValue
  disableDelete?: boolean
  title?: string
  goBack: () => void
  onDelete: (image: IFileValue | IAttachmentValue) => void
  id?: string
}

export const DocumentPreview = ({
  previewImage,
  title,
  goBack,
  onDelete,
  disableDelete,
  id
}: IProps) => {
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)

  const zoomIn = () => setZoom((prevState) => prevState + 0.2)
  const zoomOut = () =>
    setZoom((prevState) => (prevState >= 1 ? prevState - 0.2 : prevState))
  const rotateLeft = () => setRotation((prevState) => (prevState - 90) % 360)

  return (
    <ViewerWrapper id={id ?? 'preview_image_field'}>
      <AppBar
        desktopLeft={<Icon name="Paperclip" size="large" />}
        desktopTitle={title}
        desktopRight={
          <Stack gap={8}>
            <PanControls
              zoomIn={zoomIn}
              zoomOut={zoomOut}
              rotateLeft={rotateLeft}
            />
            {!disableDelete && (
              <>
                <DividerVertical />
                <Button
                  id="preview_delete"
                  type="icon"
                  onClick={() => onDelete(previewImage)}
                >
                  <Icon name="TrashSimple" color="red" />
                </Button>
              </>
            )}
            <DividerVertical />
            <Button
              id="preview_close"
              aria-label="Go close"
              size="medium"
              type="icon"
              onClick={goBack}
            >
              <Icon name="X" size="medium" />
            </Button>
          </Stack>
        }
        mobileLeft={<Icon name="Paperclip" size="large" />}
        mobileTitle={title}
        mobileRight={
          <Stack gap={8}>
            <PanControls
              zoomIn={zoomIn}
              zoomOut={zoomOut}
              rotateLeft={rotateLeft}
            />
            {!disableDelete && (
              <Button
                id="preview_delete"
                type="icon"
                onClick={() => onDelete(previewImage)}
              >
                <Icon name="TrashSimple" color="red" />
              </Button>
            )}
            <Button
              id="preview_close"
              aria-label="Go back"
              size="medium"
              type="icon"
              onClick={goBack}
            >
              <Icon name="X" size="medium" />
            </Button>
          </Stack>
        }
      />

      <ViewerContainer>
        {previewImage.data && (
          <PanViewer
            key={Math.random()}
            id="document_image"
            image={previewImage.data}
            zoom={zoom}
            rotation={rotation}
          />
        )}
      </ViewerContainer>
    </ViewerWrapper>
  )
}

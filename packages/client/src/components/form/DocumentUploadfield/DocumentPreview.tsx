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
import styled from '@client/styledComponents'
import { IFileValue, IAttachmentValue } from '@client/forms'
import { AppBar } from '@opencrvs/components/lib/AppBar'
import { Stack } from '@opencrvs/components/lib/Stack'
import { Button } from '@opencrvs/components/lib/Button'
import { Icon } from '@opencrvs/components/lib/Icon'
import { DividerVertical } from '@opencrvs/components/lib/Divider'
import PanControls from '@opencrvs/components/lib/DocumentViewer/components/PanControls'
import PanViewer from '@opencrvs/components/lib/DocumentViewer/components/PanViewer'

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
  top: -24px;
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

const Divider = styled.div`
  width: 1px;
  height: 24px;
  background-color: ${({ theme }) => theme.colors.grey200};
`

type IProps = {
  previewImage: IFileValue | IAttachmentValue
  disableDelete?: boolean
  title?: string
  goBack: () => void
  onDelete: (image: IFileValue | IAttachmentValue) => void
}

interface IState {
  zoom: number
  rotation: number
}

export class DocumentPreview extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)

    this.state = {
      zoom: 1,
      rotation: 0
    }
  }

  zoomIn = () => {
    this.setState((prevState) => ({ ...prevState, zoom: prevState.zoom + 0.2 }))
  }

  zoomOut = () => {
    this.setState((prevState) => {
      if (prevState.zoom >= 1) {
        return { ...prevState, zoom: prevState.zoom - 0.2 }
      } else {
        return prevState
      }
    })
  }

  rotateLeft = () => {
    this.setState((prevState) => ({
      rotation: (prevState.rotation - 90) % 360
    }))
  }

  render = () => {
    const { previewImage, title, goBack, onDelete, disableDelete } = this.props
    return (
      <ViewerWrapper id="preview_image_field">
        <AppBar
          desktopLeft={<Icon name="Paperclip" />}
          desktopTitle={title}
          desktopRight={
            <Stack gap={8}>
              <PanControls
                zoomIn={this.zoomIn}
                zoomOut={this.zoomOut}
                rotateLeft={this.rotateLeft}
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
                aria-label="Go back"
                size="medium"
                type="icon"
                onClick={goBack}
              >
                <Icon name="X" size="medium" />
              </Button>
            </Stack>
          }
          mobileLeft={<Icon name="Paperclip" />}
          mobileTitle={title}
          mobileRight={
            <Stack gap={8}>
              <PanControls
                zoomIn={this.zoomIn}
                zoomOut={this.zoomOut}
                rotateLeft={this.rotateLeft}
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
              zoom={this.state.zoom}
              rotation={this.state.rotation}
            />
          )}
        </ViewerContainer>
      </ViewerWrapper>
    )
  }
}

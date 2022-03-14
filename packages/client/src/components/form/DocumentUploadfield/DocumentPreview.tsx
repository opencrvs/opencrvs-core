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
import { Button, CircleButton } from '@opencrvs/components/lib/buttons'
import { ArrowBack, Delete } from '@opencrvs/components/lib/icons'
import PanViewer from '@opencrvs/components/lib/interface/components/PanViewer'
const PreviewContainer = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 4;
  width: 100%;
  height: 100%;
  background: ${({ theme }) => theme.colors.grey600};
`
const PreviewContainerHeader = styled.div`
  width: 100%;
  padding: 0 ${({ theme }) => theme.grid.margin}px;
  height: 56px;
  position: absolute;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 99999;
`

const ImageHolder = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  display: flex;
  & img {
    max-height: 80vh;
    max-width: 80vw;
    width: auto;
  }
`

// const Title = styled.span`
//   padding-left: 16px;
//   color: ${({ theme }) => theme.colors.white};
//   ${({ theme }) => theme.fonts.bodyStyle};
// `
// const BackButton = styled.button`
//   display: flex;
//   justify-content: space-between;
//   align-items: center;
//   background: transparent;
//   border: none;
//   cursor: pointer;
//   color: ${({ theme }) => theme.colors.white};
// `
type IProps = {
  previewImage: IFileValue | IAttachmentValue
  disableDelete?: boolean
  title?: string
  goBack: () => void
  onDelete: (image: IFileValue | IAttachmentValue) => void
}

export class DocumentPreview extends React.Component<IProps> {
  render = () => {
    const { previewImage, title, goBack, onDelete, disableDelete } = this.props
    return (
      <PreviewContainer id="preview_image_field">
        <PreviewContainerHeader>
          <CircleButton id="preview_back" onClick={goBack}>
            <ArrowBack />
          </CircleButton>
          {!disableDelete && (
            <span>
              <CircleButton
                id="preview_delete"
                onClick={() => onDelete(previewImage)}
              >
                <Delete color="red" />
              </CircleButton>
            </span>
          )}
        </PreviewContainerHeader>
        <ImageHolder>
          {previewImage.data && (
            <PanViewer
              key={Math.random()}
              image={previewImage.data}
              controllerCenter={true}
            />
          )}
        </ImageHolder>
      </PreviewContainer>
    )
  }
}

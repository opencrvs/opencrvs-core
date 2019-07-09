import * as React from 'react'
import styled from '@register/styledComponents'
import { IFileValue } from '@register/forms'

import { Button } from '@opencrvs/components/lib/buttons'
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
  background: ${({ theme }) => theme.colors.previewBackground};
`
const PreviewContainerHeader = styled.div`
  width: 100%;
  padding: 0 ${({ theme }) => theme.grid.margin}px;
  height: 64px;
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
`

const Title = styled.span`
  padding-left: 16px;
  color: ${({ theme }) => theme.colors.white};
  ${({ theme }) => theme.fonts.bodyStyle};
`
const BackButton = styled.button`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: transparent;
  border: none;
  cursor: pointer;
`
type IProps = {
  previewImage: IFileValue
  title?: string
  goBack: () => void
  onDelete: () => void
}

export class ImagePreview extends React.Component<IProps> {
  render = () => {
    const { previewImage, title, goBack, onDelete } = this.props
    return (
      <PreviewContainer id="preview_image_field">
        <PreviewContainerHeader>
          <BackButton onClick={goBack}>
            <ArrowBack />
            <Title>{title}</Title>
          </BackButton>
          <span>
            <Button icon={() => <Delete color="white" />} onClick={onDelete} />
          </span>
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

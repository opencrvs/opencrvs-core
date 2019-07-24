import * as React from 'react'
import styled from 'styled-components'
import { PrimaryButton } from '../buttons'

const ImageBase = styled(PrimaryButton.withComponent('label'))`
  width: auto;
  height: 48px;
  padding: 0 35px;
  ${({ theme }) => theme.fonts.bodyBoldStyle};
  align-items: center;
  display: inline-flex;
  border: 0;
  justify-content: space-between;
  cursor: pointer;
`

const HiddenInput = styled.input`
  display: none;
`
const Icon = styled.div`
  display: flex;
  justify-content: center;
  margin-left: 2em;
`
interface IImagePickerProps {
  id: string
  title: string
  icon?: () => React.ReactNode
  handleFileChange: (file: File) => void
  onClick?: (event: React.MouseEvent<HTMLElement>) => void
}

export class ImageUploader extends React.Component<IImagePickerProps, {}> {
  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target
    return files && this.props.handleFileChange(files[0])
  }
  render() {
    const { icon, title, ...otherProps } = this.props
    return (
      <ImageBase {...otherProps}>
        {title}
        {icon && <Icon>{icon()}</Icon>}
        <HiddenInput
          id="image_file_uploader_field"
          type="file"
          accept="image/*"
          onChange={this.handleFileChange}
        />
      </ImageBase>
    )
  }
}

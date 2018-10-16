import * as React from 'react'
import styled, { StyledComponentClass } from 'styled-components'
import { InputHTMLAttributes } from 'react'

const ImageBase = styled.label`
  width: auto;
  padding: 15px 35px;
  font-family: ${({ theme }) => theme.fonts.boldFont};
  align-items: center;
  display: inline-flex;
  font-size: inherit;
  justify-content: space-between;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.white};
  background: ${({ theme }) => theme.colors.primary};
  border: ${({ theme }) => theme.colors.white};
  border-radius: 2px;
  ${({ theme }) => theme.fonts.capsFontStyle};

  &:hover {
    color: ${({ theme }) => theme.colors.white};
    border: ${({ theme }) => theme.colors.white};
  }

  &:active {
    color: ${({ theme }) => theme.colors.accentGradientDark};
    outline: none;
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.white};
    cursor: not-allowed;
    color: ${({ theme }) => theme.colors.disabled};
  }
`
const HiddenInput = styled.input`
  display: none;
`
const Icon = styled.div`
  /* TODO these feel weird..*/
  display: flex;
  justify-content: center;

  /* TODO 1. only apply margin if not only child */
  margin-left: 2em;
`
interface IImagePickerProps {
  id: string
  title: string
  icon?: () => React.ReactNode
  handleFileChange: (file: File) => void
}

export class ImageUploader extends React.Component<IImagePickerProps, {}> {
  handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
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
          type="file"
          accept="image/*"
          onChange={event => this.handleFileChange(event)}
        />
      </ImageBase>
    )
  }
}

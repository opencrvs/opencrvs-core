import * as React from 'react'
import styled, { StyledComponentClass } from 'styled-components'

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

export interface IImagePickerProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  title: string
  icon?: () => React.ReactNode
}

export function ImageUploader({
  icon,
  title,
  ...otherProps
}: IImagePickerProps) {
  return (
    <ImageBase {...otherProps}>
      {title}
      {icon && <Icon>{icon()}</Icon>}
      <HiddenInput type="file" accept="image/*" />
    </ImageBase>
  )
}

export const Icon = styled.div`
  /* TODO these feel weird..*/
  display: flex;
  justify-content: center;

  /* TODO 1. only apply margin if not only child */
  margin-left: 2em;
`

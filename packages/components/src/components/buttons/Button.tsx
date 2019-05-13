import * as React from 'react'
import styled from 'styled-components'

export enum ICON_ALIGNMENT {
  LEFT,
  RIGHT
}

const ButtonBase = styled.button`
  width: auto;
  padding: 0 35px;
  height: 48px;
  font-family: ${({ theme }) => theme.fonts.boldFont};
  align-items: center;
  display: inline-flex;
  border: 0;
  font-size: inherit;
  justify-content: space-between;
  cursor: pointer;
  background: transparent;
  &:disabled {
    background: ${({ theme }) => theme.colors.disabledButton};
    path {
      stroke: ${({ theme }) => theme.colors.disabled};
    }
  }
`
export interface IButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: () => React.ReactNode
  align?: ICON_ALIGNMENT
}

export function Button({
  icon,
  children,
  align = ICON_ALIGNMENT.RIGHT,
  ...otherProps
}: IButtonProps) {
  return (
    <ButtonBase {...otherProps}>
      {icon && align === ICON_ALIGNMENT.LEFT && (
        <LeftButtonIcon>{icon()}</LeftButtonIcon>
      )}
      {children}
      {icon && align === ICON_ALIGNMENT.RIGHT && (
        <ButtonIcon>{icon()}</ButtonIcon>
      )}
    </ButtonBase>
  )
}

const LeftButtonIcon = styled.div`
  position: relative !important;
  margin-right: 20px;
  top: 2px;
`
const ButtonIcon = styled.div`
  display: flex;
  justify-content: center;
`

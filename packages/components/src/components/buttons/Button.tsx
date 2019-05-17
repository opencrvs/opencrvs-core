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
  ${({ theme }) => theme.fonts.bodyBoldStyle};
  align-items: center;
  display: inline-flex;
  border: 0;
  button:focus {
    outline: 0;
  }
  justify-content: space-between;
  cursor: pointer;
  background: transparent;
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
  align-self: center;
  position: absolute;
`
export const ButtonIcon = styled.div`
  /* TODO these feel weird..*/
  display: flex;
  justify-content: center;

  /* TODO 1. only apply margin if not only child */
  margin-left: 2em;
`

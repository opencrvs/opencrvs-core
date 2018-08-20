import * as React from 'react'
import styled, { StyledComponentClass } from 'styled-components'

const ButtonBase = styled.button`
  width: auto;
  padding: 15px 35px;
  font-family: ${({ theme }) => theme.fonts.boldFont};
  align-items: center;
  display: inline-flex;
  border: 0;
  justify-content: space-between;
  cursor: pointer;
`

/* TODO this should be the last component of this file,
 * figure out how to define priority for styleguidist
 */
export function Button({
  icon,
  children,
  ...otherProps
}: React.ButtonHTMLAttributes<HTMLButtonElement> & IButtonProps) {
  return (
    <ButtonBase {...otherProps}>
      {children}

      {icon && <ButtonIcon>{icon()}</ButtonIcon>}
    </ButtonBase>
  )
}

export const ButtonIcon = styled.div`
  /* TODO these feel weird..*/
  display: flex;
  justify-content: center;

  /* TODO 1. only apply margin if not only child */
  margin-left: 2em;
`
export interface IButtonProps {
  icon?: () => React.ReactNode
}

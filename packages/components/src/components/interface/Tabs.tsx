import * as React from 'react'
import styled, { StyledComponentBase } from 'styled-components'
import { Button, IButtonProps } from '../buttons'

export const Tabs = styled.div`
  padding: 0 ${({ theme }) => theme.grid.margin}px;
  position: relative;
  white-space: nowrap;
`

export interface IProps extends IButtonProps {
  active?: boolean
  disabled?: boolean
  id: string
}

export const Tab = styled(Button)<IProps>`
  color: ${({ theme, active }) =>
    active ? theme.colors.white : theme.colors.disabled};
  opacity: ${({ disabled }) => (disabled ? 0.3 : 1)};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  & div {
    padding-left: 20px;
    padding-right: 20px;
  }
  &:disabled {
    background: transparent;
  }
  ${({ theme, active }) =>
    active ? theme.fonts.bodyBoldStyle : theme.fonts.bodyStyle};

  ${({ theme, active }) =>
    active ? `border-bottom: 3px solid ${theme.fonts.secondary}` : ''};
`

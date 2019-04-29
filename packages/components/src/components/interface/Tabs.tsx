import * as React from 'react'
import styled, { StyledComponentClass } from 'styled-components'
import { Button, IButtonProps } from '../buttons'

export const Tabs = styled.div`
  padding: 0 ${({ theme }: any) => theme.grid.margin}px;
  position: relative;
  white-space: nowrap;
`

export interface IProps extends IButtonProps {
  active?: boolean
  disabled?: boolean
  id: string
}

export const Tab = styled(Button).attrs<IProps>({})`
  color: ${({ theme, active }) =>
    active ? theme.colors.white : theme.colors.disabledTab};
  opacity: ${({ disabled }) => (disabled ? 0.3 : 1)};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  padding-left: 20px;
  padding-right: 20px;
  font-family: ${({ theme, active }) =>
    active ? theme.fonts.regularFont : theme.fonts.lightFont};
  font-size: 18px;
  ${({ active }) => (active ? 'border-bottom: 3px solid #5E93ED' : '')};
`

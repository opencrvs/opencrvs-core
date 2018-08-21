import * as React from 'react'
import styled, { StyledComponentClass } from 'styled-components'
import { Button, IButtonProps } from '../buttons'

export const Tabs = styled.div`
  padding: 0 ${({ theme }) => theme.grid.margin}px;
  position: relative;
  white-space: nowrap;
`

export interface IProps extends Omit<IButtonProps, 'onClick'> {
  active?: boolean
  id: string
  onClick: (id: string) => void
}

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

export const TabWrapper = styled(Button).attrs<IProps>({})`
  color: #fff;
  font-family: ${({ theme, active }) =>
    active ? theme.fonts.regularFont : theme.fonts.lightFont};
  font-size: 18px;
  ${({ active }) => (active ? 'border-bottom: 3px solid #5E93ED' : '')};
`

export const Tab = (props: IProps) => (
  <TabWrapper {...props} onClick={() => props.onClick(props.id)} />
)

import * as React from 'react'
import styled, { StyledComponentClass } from 'styled-components'

import { ITheme } from '../theme'
import { Button, IButtonProps } from './Button'

const ActionContainer = styled(Button)`
  width: 100%;
  height: 96px;
  padding: 0 ${({ theme }) => theme.grid.margin}px;
  background: #fff;
  color: #fff;
  text-align: left;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.05);
  margin-bottom: 10px;
  &:last-child {
    margin-bottom: 0;
  }
`

const ActionTitle = styled.h3`
  color: #526dc3;
  font-family: ${({ theme }) => theme.fonts.lightFont};
  font-size: 24px;
  margin: 0;
`

export interface IActionProps extends IButtonProps {
  title: string
}

export function Action({ title, ...props }: IActionProps) {
  return (
    <ActionContainer {...props}>
      <ActionTitle>{title}</ActionTitle>
    </ActionContainer>
  )
}

export const ActionList = styled.div`
  z-index: 1;
  position: relative;
  padding: 0 ${({ theme }) => theme.grid.margin}px;
`

import * as React from 'react'
import styled, { StyledComponentClass } from 'styled-components'

import { ITheme } from '../theme'
import { Button, IButtonProps } from './Button'

const ActionContainer = styled(Button)`
  width: 100%;

  padding: 30px ${({ theme }) => theme.grid.margin}px;
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

const ActionDescription = styled.p`
  color: #30495f;
  font-family: ${({ theme }) => theme.fonts.lightFont};
  font-size: 14px;
  margin: 0;
`

export interface IActionProps extends IButtonProps {
  title: string
  description?: string
}

export function Action({ title, description, ...props }: IActionProps) {
  return (
    <ActionContainer {...props}>
      <div>
        <ActionTitle>{title}</ActionTitle>
        {description && <ActionDescription>{description}</ActionDescription>}
      </div>
    </ActionContainer>
  )
}

export const ActionList = styled.div`
  z-index: 1;
  position: relative;
  padding: 0 ${({ theme }) => theme.grid.margin}px;
`

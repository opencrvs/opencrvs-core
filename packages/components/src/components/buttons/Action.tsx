import * as React from 'react'
import styled, { StyledComponentClass } from 'styled-components'

import { ITheme } from '../theme'
import { Button, IButtonProps } from './Button'
import { ArrowWithGradient } from '../icons'
import { DisabledArrow } from '../icons'

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

const ActionTitle = styled.h3.attrs<{ disabled?: boolean }>({})`
  color: ${({ disabled }) => (disabled ? '#D2D2D2' : '#526dc3')};
  font-family: ${({ theme }) => theme.fonts.lightFont};
  font-size: 24px;
  margin: 0;
`

const ActionDescription = styled.p.attrs<{ disabled?: boolean }>({})`
  color: ${({ disabled }) => (disabled ? '#D2D2D2' : '#30495f')};
  font-family: ${({ theme }) => theme.fonts.regularFont};
  font-size: 14px;
  margin: 0;
  margin-top: 3px;
  strong {
    font-family: ${({ theme }) => theme.fonts.boldFont};
  }
`

export interface IActionProps extends IButtonProps {
  title: string
  description?: string
  disabled?: boolean
}

export function Action({
  title,
  description,
  disabled,
  ...props
}: IActionProps) {
  return (
    <ActionContainer
      icon={() => (disabled ? <DisabledArrow /> : <ArrowWithGradient />)}
      {...props}
    >
      <div>
        <ActionTitle disabled={disabled}>{title}</ActionTitle>
        {description && (
          <ActionDescription
            disabled={disabled}
            dangerouslySetInnerHTML={{ __html: description }}
          />
        )}
      </div>
    </ActionContainer>
  )
}

export const ActionList = styled.div`
  z-index: 1;
  position: relative;
  padding: 0 ${({ theme }) => theme.grid.margin}px;
`

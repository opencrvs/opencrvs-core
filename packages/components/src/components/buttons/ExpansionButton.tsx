import * as React from 'react'
import styled from 'styled-components'
import { Button, IButtonProps, ICON_ALIGNMENT } from './Button'
import { ThreeDots } from '../icons'
import { Omit } from '../omit'
import { boolean } from 'joi'

const StyledButton = styled(Button)`
  color: ${({ theme }) => theme.colors.accent};
  background: ${({ theme }) => theme.colors.white};
  display: flex;
  min-height: 50px;
  min-width: 50px;
  justify-content: center;
  align-items: center;

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
const StyledIcon = styled(ThreeDots).attrs<{ expanded?: boolean }>({})`
  display: flex;
  transition: transform 300ms cubic-bezier(0.075, 0.82, 0.165, 1);
  transform: ${({ expanded }) => (expanded ? `rotate(90deg)` : `rotate(0deg)`)};
`
interface IExpansionButtonProps extends IButtonProps {
  expanded?: boolean
}

export function ExpansionButton(props: IExpansionButtonProps) {
  return (
    <StyledButton
      align={ICON_ALIGNMENT.LEFT}
      icon={() => <StyledIcon expanded={props.expanded} />}
      {...props}
    />
  )
}

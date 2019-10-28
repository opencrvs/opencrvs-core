import * as React from 'react'
import styled from 'styled-components'
import { Button, IButtonProps } from './Button'
import { PlusTransparent, MinusTransparent } from '../icons'

export const StyledButton = styled(Button)`
  color: ${({ theme }) => theme.colors.secondary};
  display: flex;
  padding: 0 8px;
  flex-shrink: 1;
  background: ${({ theme }) => theme.colors.white};
  margin-bottom: 1px;
  &:last-child {
    margin-bottom: 0;
  }
  justify-content: center;
  align-items: center;
  & > div {
    top: 0;
  }
  border: none;
  outline: none;
`
export interface IExpansionButtonProps extends IButtonProps {
  expanded?: boolean
}

export function ExpansionButton(props: IExpansionButtonProps) {
  return (
    <StyledButton
      icon={() => {
        return props.expanded ? <MinusTransparent /> : <PlusTransparent />
      }}
      {...props}
    />
  )
}

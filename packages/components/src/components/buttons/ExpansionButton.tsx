import * as React from 'react'
import styled from 'styled-components'
import { Button, IButtonProps, ICON_ALIGNMENT } from './Button'
import {
  PlusTransparent,
  MinusTransparent,
  KeyboardArrowUp,
  KeyboardArrowDown
} from '../icons'

const StyledButton = styled(Button)`
  color: ${({ theme }) => theme.colors.secondary};
  display: flex;
  padding: 0 8px;
  flex: 1;
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
interface IExpansionButtonProps extends IButtonProps {
  expanded?: boolean
  arrowExpansionButtons?: boolean
}

export function ExpansionButton(props: IExpansionButtonProps) {
  return (
    <StyledButton
      icon={() => {
        if (props.arrowExpansionButtons) {
          return props.expanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />
        } else {
          return props.expanded ? <MinusTransparent /> : <PlusTransparent />
        }
      }}
      {...props}
    />
  )
}

import * as React from 'react'
import styled from 'styled-components'
import { Button, IButtonProps, ICON_ALIGNMENT } from './Button'
import { PlusTransparent, MinusTransparent } from '../icons'

const StyledButton = styled(Button)`
  color: ${({ theme }) => theme.colors.accent};
  display: flex;
  padding: 0 8px;
  flex: 1;
  margin-bottom: 1px;
  &:last-child {
    margin-bottom: 0;
  }
  justify-content: center;
  align-items: center;
`
interface IExpansionButtonProps extends IButtonProps {
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

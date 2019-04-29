import * as React from 'react'
import styled from 'styled-components'
import { Button, IButtonProps, ICON_ALIGNMENT } from './Button'
import { PlusTransparent, MinusTransparent } from '../icons'

const StyledButton = styled(Button)`
  color: ${({ theme }: any) => theme.colors.accent};
  background: ${({ theme }: any) => theme.colors.white};
  display: flex;
  flex: 1;
  min-height: 50px;
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
      align={ICON_ALIGNMENT.LEFT}
      icon={() => {
        return props.expanded ? <MinusTransparent /> : <PlusTransparent />
      }}
      {...props}
    />
  )
}

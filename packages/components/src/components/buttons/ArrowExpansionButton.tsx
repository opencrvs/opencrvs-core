import * as React from 'react'
import { KeyboardArrowDown, KeyboardArrowUp } from '../icons'
import { StyledButton, IExpansionButtonProps } from './ExpansionButton'

export function ArrowExpansionButton(props: IExpansionButtonProps) {
  return (
    <StyledButton
      icon={() => {
        return props.expanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />
      }}
      {...props}
    />
  )
}

import * as React from 'react'
import styled from 'styled-components'
import { Button, ICON_ALIGNMENT as IconAlignment } from './Button'
import { IActionProps } from './Action'

const ActionContainer = styled(Button)`
  width: 100%;
  min-height: 120px;
  padding: 0 ${({ theme }) => theme.grid.margin}px;
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.white};
  text-align: left;
  justify-content: flex-start;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.05);
  margin-bottom: 10px;
  &:last-child {
    margin-bottom: 0;
  }
`

export const ActionTitle = styled.h3.attrs<{
  disabled?: boolean
}>({})`
  color: ${({ disabled, theme }) =>
    disabled ? theme.colors.disabled : theme.colors.primary};
  font-family: ${({ theme }) => theme.fonts.lightFont};
  font-size: 24px;
  margin-left: 80px;
`
const ActionDescription = styled.p.attrs<{ disabled?: boolean }>({})`
  color: ${({ disabled, theme }) =>
    disabled ? theme.colors.disabled : theme.colors.secondary};
  font-family: ${({ theme }) => theme.fonts.regularFont};
  font-size: 16px;
  margin: 3px 0px 0px 80px;
  strong {
    font-family: ${({ theme }) => theme.fonts.boldFont};
  }
`

interface IIconActionProps extends IActionProps {
  icon: () => React.ReactNode
}

export function IconAction({
  title,
  description,
  icon,
  ...props
}: IIconActionProps) {
  return (
    <ActionContainer icon={icon} align={IconAlignment.LEFT} {...props}>
      <div>
        <ActionTitle>{title}</ActionTitle>
        {description && <ActionDescription>{description}</ActionDescription>}
      </div>
    </ActionContainer>
  )
}

import * as React from 'react'
import styled from 'styled-components'
import { Button, ICON_ALIGNMENT as IconAlignment } from './Button'
import { IActionProps } from './Action'

const ActionContainer = styled(Button)`
  min-height: 120px;
  width: 100%;
  text-align: left;
  padding: 0 ${({ theme }) => theme.grid.margin}px;
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.white};
  & div {
    justify-content: flex-start;
    padding: 0;
  }

  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.05);
  margin-bottom: 10px;
  &:last-child {
    margin-bottom: 0;
  }
`

export const ActionTitle = styled.h3<{
  disabled?: boolean
}>`
  color: ${({ disabled, theme }) =>
    disabled ? theme.colors.disabled : theme.colors.primary};
  ${({ theme }) => theme.fonts.h4Style};
  margin-left: 80px;
`
const ActionDescription = styled.p<{ disabled?: boolean }>`
  color: ${({ disabled, theme }) =>
    disabled ? theme.colors.disabled : theme.colors.secondary};
  ${({ theme }) => theme.fonts.bodyStyle};
  margin: 3px 0px 0px 80px;
  strong {
    ${({ theme }) => theme.fonts.bodyBoldStyle};
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

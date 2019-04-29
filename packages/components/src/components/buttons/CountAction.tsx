import * as React from 'react'
import styled from 'styled-components'
import { Button } from './Button'
import { IActionProps } from './Action'

const ActionContainer = styled(Button)`
  width: 100%;
  min-height: 90px;
  padding: 0 ${({ theme }: any) => theme.grid.margin}px;
  background: ${({ theme }: any) => theme.colors.white};
  color: ${({ theme }: any) => theme.colors.white};
  text-align: left;
  justify-content: flex-start;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.05);
  margin-bottom: 2px;
  &:last-child {
    margin-bottom: 0;
  }
`

const ActionTitle = styled.h3.attrs<{
  disabled?: boolean
}>({})`
  font-family: ${({ theme }: any) => theme.fonts.regularFont};
  background-color: ${({ theme }: any) => theme.colors.white};
  color: ${({ theme }: any) => theme.colors.copy};
  margin-left: 11px;
`

const StyledStatus = styled.div`
  font-family: ${({ theme }: any) => theme.fonts.boldFont};
  background-color: rgba(150, 150, 150, 0.1);
  border-radius: 17px;
  padding: 5px 13px 5px 7px;
  margin: 2px 5px 2px 0;
  display: flex;
  align-items: center;
  height: 32px;
  & span {
    text-transform: uppercase;
    margin-left: 5px;
    font-size: 13px;
    color: ${({ theme }: any) => theme.colors.primary};
  }
`

interface ICountActionProps extends IActionProps {
  count: string
}

export function CountAction({ title, count, ...props }: ICountActionProps) {
  return (
    <ActionContainer {...props}>
      <StyledStatus>
        <span>{count}</span>
      </StyledStatus>
      <ActionTitle>{title}</ActionTitle>
    </ActionContainer>
  )
}

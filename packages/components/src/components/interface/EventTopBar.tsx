import * as React from 'react'
import styled from 'styled-components'
import { Button } from '../buttons'
import { ApplicationIcon, Cross } from '../icons'
const TopBar = styled.div`
  padding: 0 ${({ theme }) => theme.grid.margin}px;
  height: 64px;
  background: ${({ theme }) => theme.colors.white};
  ${({ theme }) => theme.shadows.mistyShadow};
  display: flex;
  justify-content: space-between;
  align-items: center;
`
const TopBarTitle = styled.h4`
  ${({ theme }) => theme.fonts.bigBodyStyle};
  padding-left: 16px;
`
const Item = styled.span`
  display: flex;
  align-items: center;
`
interface IProps {
  title: string
  goHome?: () => void
}

export const EventTopBar = (props: IProps) => {
  return (
    <TopBar>
      <Item>
        {' '}
        <ApplicationIcon /> <TopBarTitle>{props.title}</TopBarTitle>
      </Item>
      <Item>
        <Button icon={() => <Cross />} onClick={props.goHome} />
      </Item>
    </TopBar>
  )
}

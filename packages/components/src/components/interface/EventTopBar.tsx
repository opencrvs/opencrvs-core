import * as React from 'react'
import styled from 'styled-components'
import { TertiaryButton, CircleButton } from '../buttons'
import { ApplicationIcon, Cross, VerticalThreeDots } from '../icons'
import { ToggleMenu } from '.'

const TopBar = styled.div`
  padding: 0 ${({ theme }) => theme.grid.margin}px;
  height: 64px;
  background: ${({ theme }) => theme.colors.white};
  ${({ theme }) => theme.shadows.mistyShadow};
  display: flex;
  justify-content: space-between;
  align-items: center;
  top: 0;
  width: 100%;
  position: fixed;
  z-index: 1;
`
const TopBarTitle = styled.h4`
  ${({ theme }) => theme.fonts.bigBodyBoldStyle};
  padding-left: 16px;
  color: ${({ theme }) => theme.colors.copy};
`
const Item = styled.span`
  display: flex;
  align-items: center;
`
interface IProps {
  id?: string
  title: string
  goHome?: () => void
  saveAction?: IAction
  exitAction?: IAction
  menuItems?: IToggleMenuItem[]
  iconColor?: string
}
interface IAction {
  handler: () => void
  label: string
}
interface IToggleMenuItem {
  label: string
  icon?: JSX.Element
  handler: () => void
}

export const EventTopBar = (props: IProps) => {
  const { goHome, title, saveAction, exitAction, menuItems, iconColor } = props
  return (
    <TopBar>
      <Item>
        <ApplicationIcon color={iconColor} /> <TopBarTitle>{title}</TopBarTitle>
      </Item>
      <Item>
        {goHome && (
          <CircleButton id="crcl-btn" onClick={goHome}>
            <Cross />
          </CircleButton>
        )}
        {saveAction && (
          <TertiaryButton onClick={saveAction.handler} id="save_draft">
            {saveAction.label}
          </TertiaryButton>
        )}

        {exitAction && (
          <TertiaryButton onClick={exitAction.handler} id="exit_top_bar">
            {exitAction.label}
          </TertiaryButton>
        )}

        {menuItems && (
          <ToggleMenu
            id="eventToggleMenu"
            toggleButton={
              <CircleButton>
                <VerticalThreeDots />
              </CircleButton>
            }
            menuItems={menuItems}
          />
        )}
      </Item>
    </TopBar>
  )
}

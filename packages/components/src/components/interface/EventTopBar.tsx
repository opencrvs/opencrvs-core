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
  id?: string
  title: string
  goHome?: () => void
  saveAction?: ISaveAction
  menuItems?: IToggleMenuItem[]
}
interface ISaveAction {
  handler: () => void
  label: string
}
interface IToggleMenuItem {
  label: string
  icon?: JSX.Element
  handler: () => void
}

export const EventTopBar = (props: IProps) => {
  const { goHome, title, saveAction, menuItems } = props
  return (
    <TopBar>
      <Item>
        {' '}
        <ApplicationIcon /> <TopBarTitle>{title}</TopBarTitle>
      </Item>
      <Item>
        {goHome && (
          <CircleButton onClick={goHome}>
            <Cross />
          </CircleButton>
        )}
        {saveAction && (
          <TertiaryButton onClick={saveAction.handler} id="save_draft">
            {saveAction.label}
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

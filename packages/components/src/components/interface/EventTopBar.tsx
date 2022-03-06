/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
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
  ${({ theme }) => theme.fonts.h4};
  padding-left: 16px;
  color: ${({ theme }) => theme.colors.copy};
`
const Item = styled.span`
  display: flex;
  align-items: center;
`
export interface IEventTopBarProps {
  id?: string
  title: string
  pageIcon?: JSX.Element
  goHome?: () => void
  saveAction?: IEventTopBarMenuAction
  exitAction?: IEventTopBarMenuAction
  menuItems?: IToggleMenuItem[]
  iconColor?: string
}
export interface IEventTopBarMenuAction {
  handler: () => void
  label: string
}
interface IToggleMenuItem {
  label: string
  icon?: JSX.Element
  handler: () => void
}

export const EventTopBar = (props: IEventTopBarProps) => {
  const {
    goHome,
    title,
    saveAction,
    exitAction,
    menuItems,
    iconColor,
    pageIcon
  } = props
  return (
    <TopBar>
      <Item>
        {pageIcon || <ApplicationIcon color={iconColor} />}{' '}
        <TopBarTitle>{title}</TopBarTitle>
      </Item>
      <Item>
        {goHome && (
          <CircleButton id="crcl-btn" onClick={goHome}>
            <Cross color="currentColor" />
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
            toggleButton={<VerticalThreeDots />}
            menuItems={menuItems}
          />
        )}
      </Item>
    </TopBar>
  )
}

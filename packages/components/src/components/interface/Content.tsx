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
import { ReactElement } from 'react'
import styled from 'styled-components'
import { colors } from '../colors'
import { Box } from './Box'

const Container = styled(Box)<{ size: string }>`
  position: relative;
  margin: 24px auto;
  max-width: ${({ size }) => (size === 'large' ? '1140px' : '778px')};
  box-sizing: border-box;

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    margin: 24px;
  }

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    height: 100%;
    margin: 0;
    border: 0;
    border-radius: 0;
  }
`
const Header = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  flex-direction: column;
  margin: -24px -24px 24px;
  padding: 0 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey300};
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    border: 0;
    padding: 0;
  }
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    margin: 0 -16px;
  }
`
const TopActionBar = styled.div`
  display: flex;
  gap: 16px;
`
export const SubHeader = styled.div`
  padding-bottom: 16px;
  color: ${({ theme }) => theme.colors.supportingCopy};
  ${({ theme }) => theme.fonts.reg18};
`
export const Body = styled.div`
  color: ${({ theme }) => theme.colors.copy};
  ${({ theme }) => theme.fonts.reg16};
`
const Footer = styled.div`
  display: flex;
  height: 72px;
  padding-top: 24px;
`
const HeaderBottom = styled.div`
  display: flex;
  padding: 0 0 24px;
  width: 100%;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    padding: 24px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.grey300};
  }
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    padding: 0 16px 16px;
  }
`
const TopTabBar = styled.div`
  display: flex;
  gap: 28px;
  width: 100%;
  margin: -24px 0;
  padding: 0;
  position: relative;
  bottom: -1px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    margin: -16px 0;
  }
`

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 16px 0;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: none;
  }
`
const BottomActionBar = styled.div`
  display: flex;
  gap: 16px;
  margin-right: auto;
`
const TitleContainer = styled.div<{ titleColor?: keyof typeof colors }>`
  display: flex;
  gap: 16px;
  align-items: center;
  width: 0;
  flex: 1;
  color: ${({ theme, titleColor }) => titleColor && theme.colors[titleColor]};
`

const Title = styled.div`
  ${({ theme }) => theme.fonts.h2}
  color: ${({ theme }) => theme.colors.copy};
  white-space: nowrap;

  text-overflow: ellipsis;
`
const Icon = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
`

export enum ContentSize {
  LARGE = 'large',
  NORMAL = 'normal'
}

interface IProps {
  icon?: () => React.ReactNode
  title?: string
  titleColor?: keyof typeof colors
  topActionButtons?: ReactElement[]
  tabBarContent?: React.ReactNode
  filterContent?: React.ReactNode
  subtitle?: string
  children?: React.ReactNode
  bottomActionButtons?: ReactElement[]
  size?: ContentSize
}

export class Content extends React.Component<IProps> {
  render() {
    const {
      icon,
      title,
      titleColor,
      topActionButtons,
      tabBarContent,
      filterContent,
      subtitle,
      children,
      bottomActionButtons,
      size
    } = this.props
    return (
      <Container size={size as string}>
        <Header>
          <TopBar>
            <TitleContainer titleColor={titleColor}>
              {icon && <Icon id={`content-icon`}>{icon()}</Icon>}
              {title && <Title id={`content-name`}>{title}</Title>}
            </TitleContainer>
            {topActionButtons && (
              <TopActionBar>{topActionButtons}</TopActionBar>
            )}
          </TopBar>
          {(filterContent || tabBarContent) && (
            <HeaderBottom>
              {tabBarContent && <TopTabBar>{tabBarContent}</TopTabBar>}
              {filterContent}
            </HeaderBottom>
          )}
        </Header>
        {subtitle && <SubHeader>{subtitle}</SubHeader>}
        {children && <Body>{children}</Body>}

        {bottomActionButtons && (
          <Footer>
            <BottomActionBar>{bottomActionButtons}</BottomActionBar>
          </Footer>
        )}
      </Container>
    )
  }
}

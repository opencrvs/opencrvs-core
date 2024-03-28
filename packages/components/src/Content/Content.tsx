/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import * as React from 'react'
import { ReactElement } from 'react'
import styled from 'styled-components'
import { ICON_ALIGNMENT, TertiaryButton } from '../buttons'
import { colors } from '../colors'
import { BackArrow } from '../icons'

const Container = styled.div<{ size: string }>`
  position: relative;
  border-radius: 4px;
  box-sizing: border-box;
  margin: 24px auto;
  max-width: ${({ size = 'normal' }) => {
    switch (size) {
      case 'large':
        return '1140px'
      case 'normal':
        return '778px'
      case 'small':
      default:
        return '568px'
    }
  }};
  border: 1px solid ${({ theme }) => theme.colors.grey300};
  background: ${({ theme }) => theme.colors.white};
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    margin: 0;
    height: 100%;
    border: 0;
    border-radius: 0;
    max-width: 100%;
  }
`
const Header = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  flex-direction: column;
  padding: 0 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey300};
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    border: 0;
    padding: 0;
  }
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    margin: 0;
  }
`
const TopActionBar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`
export const SubHeader = styled.div`
  padding-bottom: 24px;
  color: ${({ theme }) => theme.colors.supportingCopy};
  ${({ theme }) => theme.fonts.reg16};
`
export const Body = styled.div`
  color: ${({ theme }) => theme.colors.copy};
  ${({ theme }) => theme.fonts.reg16};
`
const Footer = styled.div`
  display: flex;
  padding: 24px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    padding: 16px;
  }
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
const TopFilterBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`
const TopBar = styled.div<{ keepShowing?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 64px;
  padding: 12px 0;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    ${({ keepShowing }) => {
      return !keepShowing ? 'display:none;' : 'padding:16px;'
    }}
  }
`
const BottomActionBar = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
`
const BackButtonContainer = styled.div`
  padding-left: 8px;
  @media (min-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: none;
  }
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
  ${({ theme }) => theme.fonts.h1}
  color: ${({ theme }) => theme.colors.copy};
`

const Icon = styled.div`
  height: 24px;
  background-color: ${({ theme }) => theme.colors.white};
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: none;
  }
`

const Contents = styled.div<{ noPadding?: boolean }>`
  padding: ${(props) => (props.noPadding ? 0 : '24px')};
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    padding: ${(props) => (props.noPadding ? 0 : '16px')};
  }
`

export enum ContentSize {
  LARGE = 'large',
  NORMAL = 'normal',
  SMALL = 'small'
}

interface IProps {
  id?: string
  icon?: () => React.ReactNode
  backButtonLabel?: string
  backButtonAction?: () => void
  title?: string | React.ReactNode
  titleColor?: keyof typeof colors
  showTitleOnMobile?: boolean
  noPadding?: boolean
  topActionButtons?: ReactElement[]
  tabBarContent?: React.ReactNode
  filterContent?: React.ReactNode
  subtitle?: string | React.ReactNode
  children?: React.ReactNode
  bottomActionButtons?: ReactElement[]
  size?: ContentSize
  className?: string
}

export const UnstyledContent = ({
  icon,
  backButtonLabel,
  backButtonAction,
  title,
  titleColor,
  showTitleOnMobile,
  topActionButtons,
  tabBarContent,
  filterContent,
  noPadding,
  subtitle,
  children,
  bottomActionButtons,
  size,
  className
}: IProps) => (
  <Container size={size as string} className={className}>
    <Header>
      {backButtonLabel && (
        <BackButtonContainer>
          <TertiaryButton
            align={ICON_ALIGNMENT.LEFT}
            icon={() => <BackArrow />}
            onClick={backButtonAction}
          >
            {backButtonLabel}
          </TertiaryButton>
        </BackButtonContainer>
      )}
      {(icon || title || topActionButtons) && (
        <TopBar keepShowing={showTitleOnMobile}>
          <TitleContainer titleColor={titleColor}>
            {icon && <Icon id={`content-icon`}>{icon()}</Icon>}
            {title && <Title id={`content-name`}>{title}</Title>}
          </TitleContainer>
          {topActionButtons && <TopActionBar>{topActionButtons}</TopActionBar>}
        </TopBar>
      )}
      {(filterContent || tabBarContent) && (
        <HeaderBottom>
          {tabBarContent && <TopTabBar>{tabBarContent}</TopTabBar>}
          {filterContent && <TopFilterBar>{filterContent}</TopFilterBar>}
        </HeaderBottom>
      )}
    </Header>
    <Contents noPadding={noPadding}>
      {subtitle && <SubHeader>{subtitle}</SubHeader>}
      {children && <Body>{children}</Body>}
    </Contents>
    {bottomActionButtons && (
      <Footer>
        <BottomActionBar>{bottomActionButtons}</BottomActionBar>
      </Footer>
    )}
  </Container>
)

// Allows styling <Content> inside styled`` -template blocks
// https://web.archive.org/web/20220725170839/https://styled-components.com/docs/advanced#caveat
export const Content = styled(UnstyledContent)``

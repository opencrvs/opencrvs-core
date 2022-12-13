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

const Container = styled.div<{ size: string }>`
  margin: 24px auto 200px auto;
  position: relative;
  box-sizing: border-box;
  max-width: min(
    ${({ size }) => (size === 'large' ? '1140px' : '778px')},
    100% - 24px - 24px
  );
  border: 1px solid ${({ theme }) => theme.colors.grey300};
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.white};

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    max-width: none;
    margin: 16px;
  }
`
const Header = styled.div<{ hideHeader?: boolean }>`
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey300};
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    ${({ hideHeader }) => {
      return !hideHeader ? '' : 'display: none;'
    }}
  }
`

const HeaderActions = styled.div`
  display: flex;
  padding-right: 24px;
  align-items: center;
  gap: 12px;
`

const HeaderTitle = styled.div<{ titleColor?: keyof typeof colors }>`
  display: flex;
  gap: 16px;
  align-items: center;
  width: 0;
  padding: 0px 24px;
  flex: 1;
  color: ${({ theme, titleColor }) => titleColor && theme.colors[titleColor]};
`

const Title = styled.div`
  ${({ theme }) => theme.fonts.h2}
  color: ${({ theme }) => theme.colors.copy};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Icon = styled.div`
  display: flex;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.white};
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: none;
  }
`

const HeaderFilters = styled.div`
  display: flex;
  width: 100%;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey300};
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    padding: 0 16px 16px;
  }
`

const TabFilters = styled.div`
  height: 40px;
  display: flex;
  align-items: center;
  width: 100%;
  position: relative;
  padding: 0px 24px;
`

const SelectFilters = styled.div`
  height: 56px;
  display: flex;
  overflow: hidden;
  display: flex;
  align-items: center;
  padding: 0px 24px;
  gap: 8px;
`

export const SupportingCopy = styled.div`
  padding: 16px 24px;
  color: ${({ theme }) => theme.colors.supportingCopy};
  ${({ theme }) => theme.fonts.reg16};
`

export const ContentBody = styled.div`
  padding: 16px 24px;
`

const Footer = styled.div`
  display: flex;
  align-items: center;
  padding: 24px 24px;
`

const FooterActions = styled.div`
  display: flex;
  gap: 16px;
  margin-right: auto;
`

export enum ContentSize {
  LARGE = 'large',
  NORMAL = 'normal'
}

interface IProps {
  icon?: () => React.ReactNode
  title?: string
  titleColor?: keyof typeof colors
  hideHeaderMobile?: boolean
  topActionButtons?: ReactElement[]
  tabBarContent?: React.ReactNode
  filterContent?: React.ReactNode
  subtitle?: string
  children?: React.ReactNode
  bottomActionButtons?: ReactElement[]
  size?: ContentSize
  className?: string
}

export class UnstyledContent extends React.Component<IProps> {
  render() {
    const {
      icon,
      title,
      titleColor,
      hideHeaderMobile,
      topActionButtons,
      tabBarContent,
      filterContent,
      subtitle,
      children,
      bottomActionButtons,
      size,
      className
    } = this.props

    return (
      <Container size={size as string} className={className}>
        {(icon || title || topActionButtons) && (
          <Header hideHeader={hideHeaderMobile}>
            <HeaderTitle titleColor={titleColor}>
              {icon && <Icon id={`content-icon`}>{icon()}</Icon>}
              {title && <Title id={`content-name`}>{title}</Title>}
            </HeaderTitle>
            {topActionButtons && (
              <HeaderActions>{topActionButtons}</HeaderActions>
            )}
          </Header>
        )}
        {(filterContent || tabBarContent) && (
          <HeaderFilters>
            {tabBarContent && <TabFilters>{tabBarContent}</TabFilters>}
            {filterContent && <SelectFilters>{filterContent}</SelectFilters>}
          </HeaderFilters>
        )}
        {subtitle && <SupportingCopy>{subtitle}</SupportingCopy>}
        {children}
        {bottomActionButtons && (
          <Footer>
            <FooterActions>{bottomActionButtons}</FooterActions>
          </Footer>
        )}
      </Container>
    )
  }
}

// Allows styling <Content> inside styled`` -template blocks
// https://web.archive.org/web/20220725170839/https://styled-components.com/docs/advanced#caveat
export const Content = styled(UnstyledContent)``

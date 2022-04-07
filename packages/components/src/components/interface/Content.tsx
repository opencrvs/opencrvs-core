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
import styled, { ThemeConsumer } from 'styled-components'
import { colors } from '../colors'
import { FormTabs, IFormTabProps } from '../forms/FormTabs'
import { Box } from './Box'

const Container = styled(Box)<{ size: string }>`
  position: relative;
  margin: 24px auto;
  max-width: ${({ size }) => (size === 'large' ? '1140px' : '778px')};
  height: 100%;
  box-sizing: border-box;

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
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
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    border: 0;
    padding: 0;
  }
`
const BottomBorder = styled.div`
  position: absolute;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey300};
  bottom: 1px;
  width: 100%;
`
const TopActionBar = styled.div`
  display: flex;
  gap: 16px;
  margin-left: auto;
`
export const SubHeader = styled.div`
  padding-top: 24px;
  color: ${({ theme }) => theme.colors.supportingCopy};
  ${({ theme }) => theme.fonts.reg18};
`
export const Body = styled.div`
  padding-bottom: 24px;
  color: ${({ theme }) => theme.colors.copy};
  ${({ theme }) => theme.fonts.reg16};
`
const Footer = styled.div`
  display: flex;
  height: 72px;
  padding-top: 24px;
`
const TopTabBar = styled.div`
  display: flex;
  gap: 28px;
  width: 100%;
  padding: 0;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    padding: 24px 24px 0;
  }
`
const TopBar = styled.div`
  display: flex;
  width: 100%;
  padding: 16px 0;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    /* display: none; */
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
  margin-right: auto;
  color: ${({ theme, titleColor }) => titleColor && theme.colors[titleColor]};
`

const Title = styled.div`
  ${({ theme }) => theme.fonts.h2}
  color: ${({ theme }) => theme.colors.copy};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 700px;
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
  tabs?: IFormTabProps
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
      tabs,
      subtitle,
      children,
      bottomActionButtons,
      size
    } = this.props

    return (
      <Container size={size as string}>
        <Header>
          <BottomBorder />
          <TopBar>
            <TitleContainer titleColor={titleColor}>
              {icon && <Icon id={`content-icon`}>{icon()}</Icon>}
              {title && <Title id={`content-name`}>{title}</Title>}
            </TitleContainer>
            {topActionButtons && (
              <TopActionBar>{topActionButtons}</TopActionBar>
            )}
          </TopBar>
          {tabs && (
            <TopTabBar>
              <FormTabs
                sections={tabs.sections}
                activeTabId={tabs.activeTabId}
                onTabClick={(id: string) => tabs.onTabClick(id)}
              />
            </TopTabBar>
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

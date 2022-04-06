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
import { Cross } from '../icons'
import { CircleButton } from '../buttons'

const ModalContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding-top: 160px;
  z-index: 5;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    padding-top: 80px;
  }
`

const ScreenBlocker = styled.div`
  position: absolute;
  z-index: -1;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${({ theme }) => theme.colors.copy};
  opacity: 0.8;
`
const ModalContent = styled.div<{
  width?: number
  responsive?: boolean
  fullscreen?: boolean
}>`
  ${({ theme }) => theme.fonts.reg16};
  color: ${({ theme }) => theme.colors.copy};
  background-color: ${({ theme }) => theme.colors.white};
  width: ${({ width }) => (width ? width : 448)}px;
  height: ${({ fullscreen }) => (fullscreen ? '100vh' : 'auto')};
  display: flex;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.colors.grey300};
  flex-direction: column;
  flex-grow: ${({ fullscreen }) => (fullscreen ? 1 : 0)};
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    flex-grow: 1;
    margin-right: 24px;
    margin-left: 24px;
  }
  @media (max-width: ${({ theme, responsive }) =>
      responsive && theme.grid.breakpoints.lg}px) {
    width: 100%;
    height: 100vh;
  }
`
const Header = styled.div<{
  responsive?: boolean
  hideBoxShadow?: boolean
  titleHeightAuto?: boolean
}>`
  ${({ theme }) => theme.fonts.regularFont};
  height: ${({ titleHeightAuto }) => (titleHeightAuto ? 'auto' : '64px')};
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: top;
  padding: 24px 24px 8px;
  @media (max-width: ${({ theme, responsive }) =>
      responsive && theme.grid.breakpoints.lg}px) {
    ${({ theme, hideBoxShadow }) => !hideBoxShadow && theme.shadows.light};
    margin-bottom: 16px;
  }
`
const Title = styled.h1`
  margin: 0px;
  ${({ theme }) => theme.fonts.h2};
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    ${({ theme }) => theme.fonts.h4};
  }
`
const Body = styled.div<{
  height?: number
  autoHeight?: boolean
  scrollableY?: boolean
  responsive?: boolean
  fullscreen?: boolean
}>`
  ${({ theme }) => theme.fonts.reg16};
  height: ${({ height }) => (height ? height : 250)}px;
  height: ${({ autoHeight }) => autoHeight && `auto`};
  color: ${({ theme }) => theme.colors.supportingCopy};
  overflow-y: ${({ scrollableY }) => (scrollableY ? 'visible' : 'auto')};
  padding: 0 24px 16px;
  display: flex;
  flex-direction: column;
  flex-grow: ${({ fullscreen }) => (fullscreen ? 1 : 0)};
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    flex-grow: 1;
  }

  &::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.grey400};
    border-radius: 10px;
  }
`
const Footer = styled.div<{ responsive?: boolean }>`
  ${({ theme }) => theme.fonts.bold14};
  padding: 16px 3px;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  border-top: 1px solid ${({ theme }) => theme.colors.grey300};
  @media (max-width: ${({ theme, responsive }) =>
      responsive && theme.grid.breakpoints.md}px) {
    flex-direction: column-reverse;
    border-top: 0px;
  }
`

const Action = styled.div`
  margin: 0 8px;
  display: flex;
  align-items: center;
  & button {
    width: 100%;
  }
`
interface IProps {
  id?: string
  title: string
  show: boolean
  responsive?: boolean
  width?: number
  contentHeight?: number
  titleHeightAuto?: boolean
  autoHeight?: boolean
  contentScrollableY?: boolean
  fullscreen?: boolean
  actions: JSX.Element[]
  handleClose?: () => void
  hideHeaderBoxShadow?: boolean
}

export class ResponsiveModal extends React.Component<IProps> {
  toggleScroll = () => {
    const body = document.querySelector('body') as HTMLBodyElement
    if (this.props.show) {
      body.style.overflow = 'hidden'
    } else {
      body.style.removeProperty('overflow')
    }
  }
  componentWillUnmount = () => {
    const body = document.querySelector('body') as HTMLBodyElement
    body.style.removeProperty('overflow')
  }
  render() {
    const {
      title,
      show,
      responsive = true,
      handleClose,
      id,
      actions,
      width,
      contentHeight,
      titleHeightAuto,
      fullscreen,
      autoHeight,
      contentScrollableY,
      hideHeaderBoxShadow
    } = this.props

    this.toggleScroll()
    if (!show) {
      return null
    }

    return (
      <ModalContainer id={id}>
        <ScreenBlocker />
        <ModalContent
          width={width}
          responsive={responsive}
          fullscreen={fullscreen}
        >
          <Header
            responsive={responsive}
            hideBoxShadow={hideHeaderBoxShadow}
            titleHeightAuto={titleHeightAuto}
          >
            <Title>{title}</Title>
            <CircleButton id="close-btn" type="button" onClick={handleClose}>
              <Cross color="currentColor" />
            </CircleButton>
          </Header>
          <Body
            height={contentHeight}
            scrollableY={contentScrollableY}
            fullscreen={fullscreen}
            autoHeight={autoHeight}
          >
            {this.props.children}
          </Body>
          {actions.length > 0 && (
            <Footer responsive={responsive}>
              {actions.map((action, i) => (
                <Action key={i}>{action}</Action>
              ))}
            </Footer>
          )}
        </ModalContent>
      </ModalContainer>
    )
  }
}

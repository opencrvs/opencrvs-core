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
  z-index: 5;
  display: flex;
  justify-content: center;
  align-items: center;
`
const ScreenBlocker = styled.div`
  position: absolute;
  z-index: -1;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${({ theme }) => theme.colors.menuBackground};
  opacity: 0.8;
`
const ModalContent = styled.div<{ width?: number }>`
  ${({ theme }) => theme.fonts.bodyStyle};
  color: ${({ theme }) => theme.colors.copy};
  background-color: ${({ theme }) => theme.colors.white};
  width: ${({ width }) => (width ? width : 448)}px;
  display: flex;
  flex-direction: column;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    width: 100%;
    height: 100vh;
  }
`
const Header = styled.div`
  ${({ theme }) => theme.fonts.regularFont};
  height: 64px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0 8px 0px 24px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    ${({ theme }) => theme.shadows.mistyShadow};
    margin-bottom: 16px;
  }
`
const Title = styled.h1`
  ${({ theme }) => theme.fonts.h4Style};
`
const Body = styled.div<{ height?: number; overflowY?: string }>`
  ${({ theme }) => theme.fonts.bodyStyle};
  height: ${({ height }) => (height ? height : 250)}px;
  overflow-y: ${({ overflowY }) => (overflowY ? overflowY : 'auto')};
  padding: 0 24px 16px;
  display: flex;
  flex-direction: column;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    flex-grow: 1;
  }

  &::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.scrollBarGrey};
    border-radius: 10px;
  }
`
const Footer = styled.div`
  ${({ theme }) => theme.fonts.buttonStyle};
  padding: 16px 3px;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  border-top: 2px solid ${({ theme }) => theme.colors.dividerLight};
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    flex-direction: column-reverse;
    border-top: 0px;
  }
`

const Action = styled.div`
  margin: 0 12px;
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
  width?: number
  contentHeight?: number
  contentOverflowY?: string
  actions: JSX.Element[]
  handleClose?: () => void
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
      handleClose,
      id,
      actions,
      width,
      contentHeight,
      contentOverflowY
    } = this.props

    this.toggleScroll()
    if (!show) {
      return null
    }

    return (
      <ModalContainer id={id}>
        <ScreenBlocker />
        <ModalContent width={width}>
          <Header>
            <Title>{title}</Title>
            <CircleButton id="close-btn" type="button" onClick={handleClose}>
              <Cross color="currentColor" />
            </CircleButton>
          </Header>
          <Body height={contentHeight} overflowY={contentOverflowY}>
            {this.props.children}
          </Body>
          <Footer>
            {actions.map((action, i) => (
              <Action key={i}>{action}</Action>
            ))}
          </Footer>
        </ModalContent>
      </ModalContainer>
    )
  }
}

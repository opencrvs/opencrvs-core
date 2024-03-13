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
import React, { useEffect } from 'react'
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
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    padding-top: 0px;
  }
  cursor: initial;
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
}>`
  ${({ theme }) => theme.fonts.reg16};
  color: ${({ theme }) => theme.colors.copy};
  background-color: ${({ theme }) => theme.colors.white};
  width: ${({ width }) => (width ? width : 448)}px;
  display: flex;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.colors.grey300};
  flex-direction: column;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    flex-grow: 1;
  }
  @media (max-width: ${({ theme, responsive }) =>
      responsive && theme.grid.breakpoints.lg}px) {
    width: 100%;
    height: 100vh;
    border-radius: unset;
  }
`
const Header = styled.div<{
  responsive?: boolean
  hideBoxShadow?: boolean
  titleHeightAuto?: boolean
  showHeaderBorder?: boolean
}>`
  height: ${({ titleHeightAuto }) => (titleHeightAuto ? 'auto' : '64px')};
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px;

  @media (min-width: ${({ theme, responsive }) =>
      responsive && theme.grid.breakpoints.lg}px) {
    ${({ theme, showHeaderBorder }) =>
      showHeaderBorder &&
      `
          border-bottom: solid 1px ${theme.colors.grey300};
          margin-bottom: 20px;
          padding: 20px
        `}
  }

  @media (max-width: ${({ theme, responsive }) =>
      responsive && theme.grid.breakpoints.lg}px) {
    ${({ theme, hideBoxShadow }) => !hideBoxShadow && theme.shadows.light};
    margin-bottom: 16px;
    padding-top: 8px 8px;
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
}>`
  ${({ theme }) => theme.fonts.reg16};
  height: ${({ height, autoHeight }) =>
    height ? `${height}px` : autoHeight ? `auto` : `250px`};
  max-height: calc(100vh - 180px);
  color: ${({ theme }) => theme.colors.supportingCopy};
  overflow-y: ${({ scrollableY }) => (scrollableY ? 'visible' : 'auto')};
  padding: 0 24px 16px;
  display: flex;
  flex-direction: column;
  text-align: left;
  white-space: normal;
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
  actions: JSX.Element[]
  handleClose?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
  hideHeaderBoxShadow?: boolean
  preventClickOnParent?: boolean
  showHeaderBorder?: boolean
  children?: React.ReactNode
}

export const ResponsiveModal = ({
  title,
  show,
  responsive = true,
  handleClose,
  id,
  actions,
  width,
  contentHeight,
  titleHeightAuto,
  autoHeight,
  contentScrollableY,
  hideHeaderBoxShadow,
  preventClickOnParent,
  showHeaderBorder,
  children
}: IProps) => {
  const toggleScroll = () => {
    const body = document.querySelector('body') as HTMLBodyElement
    if (show) {
      return (body.style.overflow = 'hidden')
    }
    return body.style.removeProperty('overflow')
  }

  useEffect(() => {
    toggleScroll()

    return () => {
      const body = document.querySelector('body') as HTMLBodyElement
      body.style.removeProperty('overflow')
    }
  }, [show])

  if (!show) {
    return null
  }

  return (
    <ModalContainer
      id={id}
      onClick={(e) => {
        if (preventClickOnParent) {
          e.stopPropagation()
        }
      }}
    >
      <ScreenBlocker />
      <ModalContent width={width} responsive={responsive}>
        <Header
          responsive={responsive}
          hideBoxShadow={hideHeaderBoxShadow}
          titleHeightAuto={titleHeightAuto}
          showHeaderBorder={showHeaderBorder}
        >
          <Title>{title}</Title>
          <CircleButton id="close-btn" type="button" onClick={handleClose}>
            <Cross color="currentColor" />
          </CircleButton>
        </Header>
        <Body
          height={contentHeight}
          scrollableY={contentScrollableY}
          autoHeight={autoHeight}
        >
          {children}
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

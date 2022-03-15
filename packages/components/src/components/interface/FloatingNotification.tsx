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
import styled, { keyframes, withTheme } from 'styled-components'
import { CrossLarge, Error, Success, Warning } from '../icons'
import { Spinner } from './Spinner'
import { ITheme } from '../theme'

export enum NOTIFICATION_TYPE {
  SUCCESS = 'success',
  WARNING = 'warning',
  IN_PROGRESS = 'inProgress',
  ERROR = 'error'
}

interface IProps {
  id?: string
  show: boolean
  type?: NOTIFICATION_TYPE
  callback?: (event: React.MouseEvent<HTMLDivElement>) => void
  className?: string
  children: React.ReactNode
}

type FullProps = IProps & { theme: ITheme }

const easeInFromBottom = keyframes`
  from { bottom: -200px; }
  to { bottom: 100px; }
`

const easeInFromTop = keyframes`
  from { top: -200px; }
  to { top: 56px; }
`

const NotificationContainer = styled.div`
  position: fixed;
  padding: 4px 8px;
  width: 50%;
  transform: translateX(-50%);
  left: 50%;
  display: flex;
  box-shadow: rgba(53, 67, 93, 0.54) 0px 2px 8px;
  background: ${({ theme }) => theme.colors.secondary};
  z-index: 1;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;

  &.show {
    animation: ${easeInFromBottom} 500ms;
    bottom: 100px;
  }

  &.hide {
    display: none;
  }

  &.success {
    background: ${({ theme }) => theme.colors.positive};
  }
  &.inProgress {
    background: ${({ theme }) => theme.colors.primary};
  }
  &.error {
    background: ${({ theme }) => theme.colors.negative};
  }
  &.warning {
    background: ${({ theme }) => theme.colors.neutral};
  }
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    width: 100%;

    &.show {
      animation: ${easeInFromTop} 500ms;
      top: 56px;
      bottom: auto;
    }
  }
`

const Content = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
`
const Cancel = styled.div`
  padding: 8px;

  transform: scale(0.8);

  &.clickable {
    cursor: pointer;
  }
`

const NotificationMessage = styled.div`
  position: relative;
  ${({ theme }) => theme.fonts.bodyStyle};
  padding: 8px 16px;
  margin: 8px;
  color: ${({ theme }) => theme.colors.white};
  min-width: 160px;
`

class FloatingNotificationComp extends React.Component<FullProps> {
  render() {
    const { id, type, show, children, callback, className, theme } = this.props

    return (
      <NotificationContainer
        id={id}
        className={
          (type ? type : '') + (show ? ' show' : ' hide') + ' ' + className
        }
      >
        <Content>
          {type === NOTIFICATION_TYPE.SUCCESS && <Success />}
          {type === NOTIFICATION_TYPE.WARNING && <Warning />}
          {type === NOTIFICATION_TYPE.ERROR && <Error />}
          {type === NOTIFICATION_TYPE.IN_PROGRESS && (
            <Spinner
              id="in-progress-floating-notification"
              baseColor={theme.colors.white}
            />
          )}
          <NotificationMessage>{children}</NotificationMessage>
        </Content>
        {callback && (
          <Cancel
            id={`${id}Cancel`}
            onClick={callback}
            className={' clickable'}
          >
            <CrossLarge />
          </Cancel>
        )}
      </NotificationContainer>
    )
  }
}

export const FloatingNotification = withTheme(FloatingNotificationComp)

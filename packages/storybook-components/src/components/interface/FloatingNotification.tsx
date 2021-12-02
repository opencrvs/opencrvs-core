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
import styled, { keyframes } from 'styled-components'
import { CrossLarge, Error, Success, Warning } from '../icons'
enum NOTIFICATION_TYPE {
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error'
}
interface IProps {
  id?: string
  show: boolean
  type?: NOTIFICATION_TYPE
  callback?: (event: React.MouseEvent<HTMLDivElement>) => void
  className?: string
}

const easeIn = keyframes`
  from { bottom: -200px; }
  to { bottom: 100; }
`
const NotificationContainer = styled.div`
  position: fixed;
  padding: 4px 8px;
  width: 50%;
  margin-bottom: 100px;
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
    animation: ${easeIn} 500ms;
    bottom: 0;
  }

  &.success {
    background: ${({ theme }) => theme.colors.success};
  }
  &.error {
    background: ${({ theme }) => theme.colors.error};
  }
  &.warning {
    background: ${({ theme }) => theme.colors.warning};
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

export class FloatingNotification extends React.Component<IProps> {
  render() {
    const { id, type, show, children, callback, className } = this.props

    return (
      <NotificationContainer
        id={id}
        className={(type ? type : '') + (show ? ' show' : '') + ' ' + className}
      >
        <Content>
          {type === NOTIFICATION_TYPE.SUCCESS && <Success />}
          {type === NOTIFICATION_TYPE.WARNING && <Warning />}
          {type === NOTIFICATION_TYPE.ERROR && <Error />}
          <NotificationMessage>{children}</NotificationMessage>
        </Content>
        <Cancel
          id={`${id}Cancel`}
          onClick={callback}
          className={callback ? ' clickable' : ''}
        >
          <CrossLarge />
        </Cancel>
      </NotificationContainer>
    )
  }
}

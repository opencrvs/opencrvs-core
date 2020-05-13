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
import { Button } from '../buttons'
import { Alert } from '../icons/Alert'

interface IProps {
  retryButtonText: string
  retryButtonHandler?: (event: React.MouseEvent<HTMLDivElement>) => void
}

const RetryButton = styled(Button)`
  ${({ theme }) => theme.fonts.buttonStyle};
  transition: background 0.4s ease;
  border: 2px solid ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.white};
  border-radius: 2px;
  height: 40px;
  padding: 0 12px;

  &:hover {
    opacity: 0.8;
  }
  &:not([data-focus-visible-added]):hover {
    opacity: 0.8;
  }
  &:focus {
    outline: none;
    background: ${({ theme }) => theme.colors.focus};
    color: ${({ theme }) => theme.colors.white};
  }
  &:not([data-focus-visible-added]) {
    background: transparent;
    outline: none;
    color: ${({ theme }) => theme.colors.white};
  }
  &:active:not([data-focus-visible-added]) {
    outline: none;
    background: ${({ theme }) => theme.colors.focus};
    color: ${({ theme }) => theme.colors.white};
    opacity: 1;
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.disabled};
  }
`

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
  z-index: 1;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
  background: ${({ theme }) => theme.colors.error};
  animation: ${easeIn} 500ms;
  bottom: 0;
`

const Content = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding-left: 8px;
`
const Retry = styled.div`
  padding: 8px;
`

const NotificationMessage = styled.div`
  position: relative;
  ${({ theme }) => theme.fonts.bodyBoldStyle};
  padding: 8px;
  color: ${({ theme }) => theme.colors.white};
  min-width: 160px;
`

export class ErrorToastNotification extends React.Component<IProps> {
  render() {
    const { children, retryButtonText, retryButtonHandler } = this.props

    return (
      <NotificationContainer id="error-toast">
        <Content>
          <Alert />
          <NotificationMessage>{children}</NotificationMessage>
        </Content>
        <Retry id="btn-retry" onClick={retryButtonHandler}>
          <RetryButton>{retryButtonText}</RetryButton>
        </Retry>
      </NotificationContainer>
    )
  }
}

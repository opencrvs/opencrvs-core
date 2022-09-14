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
import React from 'react'
import styled, { keyframes, css } from 'styled-components'
import { Alert } from '../Alert'

const NOTIFICATION_AUTO_HIDE_TIMEOUT = 20000 // 20 seconds

type ToastType = 'success' | 'neutral' | 'loading' | 'warning'

export interface IToastProps extends React.HTMLAttributes<HTMLDivElement> {
  show: boolean
  type?: ToastType
  onClose?: (event?: React.MouseEvent<HTMLButtonElement>) => void
  onActionClick?: (event?: React.MouseEvent<HTMLButtonElement>) => void
  actionText?: string
}

const easeInFromBottom = keyframes`
  from { bottom: -200px; }
  to { bottom: 100px; }
`

const easeInFromTop = keyframes`
  from { top: -200px; }
  to { top: 56px; }
`

const ToastAlert = styled(Alert)<{
  $show: boolean
}>`
  position: fixed;
  width: 50%;
  max-width: 520px;
  transform: translateX(-50%);
  left: 50%;
  z-index: 1;

  ${({ $show }) =>
    $show
      ? css`
          animation: ${easeInFromBottom} 500ms ease-in-out;
          bottom: 100px;
        `
      : `display: none;`}

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    width: 100%;
    margin: 16px;

    ${({ $show }) =>
      $show &&
      css`
        animation: ${easeInFromTop} 500ms ease-in-out;
        top: 64px;
        bottom: auto;
      `}
  }
`

export class Toast extends React.Component<IToastProps> {
  autoHideTimeout = setTimeout(
    this.closeNotification,
    NOTIFICATION_AUTO_HIDE_TIMEOUT
  )

  componentWillUnmount() {
    clearTimeout(this.autoHideTimeout)
  }

  // Issue 3203: The notification will be disappeared automatically
  closeNotification() {
    if (this.props && this.props.onClose) {
      this.props.onClose()
    }
  }

  render() {
    const { type, show, ...props } = this.props
    return <ToastAlert type={type ?? 'neutral'} $show={show} {...props} />
  }
}

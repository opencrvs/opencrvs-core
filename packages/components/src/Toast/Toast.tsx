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
import styled, { keyframes } from 'styled-components'
import { Alert } from '../Alert'
import { useToastVisibility } from './useToastVisibility'

const TOAST_DEFAULT_DURATION_MS = 10000

type ToastType = 'success' | 'warning' | 'loading' | 'error'

interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: ToastType
  onClose?: (event?: React.MouseEvent<HTMLButtonElement>) => void
  onActionClick?: (event?: React.MouseEvent<HTMLButtonElement>) => void
  actionText?: string
  duration?: number | null
}

const deepToast = keyframes`
  from { bottom: -10px; }
  to { bottom: 80px; }
`

const shallowToast = keyframes`
  from { bottom: -10px; }
  to { bottom: 24px; }
`

const ToastAlert = styled(Alert)`
  position: fixed;
  filter: drop-shadow(0px 2px 4px rgba(34, 34, 34, 0.24));
  width: 50%;
  max-width: 564px;
  transform: translateX(-50%);
  left: 50%;
  z-index: 1;
  animation: ${deepToast} 400ms ease-in-out;
  bottom: 80px;

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    width: 100%;
    animation: ${shallowToast} 400ms ease-in-out;
    bottom: 24px;
  }
`

export const Toast = ({
  type,
  duration = TOAST_DEFAULT_DURATION_MS,
  onClose,
  ...props
}: ToastProps) => {
  useToastVisibility({
    duration: type === 'loading' ? null : duration,
    onClose
  })

  return (
    <ToastAlert
      type={type ?? 'error'}
      onClose={onClose}
      role="alert"
      aria-live="polite"
      {...props}
    />
  )
}

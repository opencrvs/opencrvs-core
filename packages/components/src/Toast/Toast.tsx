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
import { Cross } from '../icons'
import { Spinner } from '../Spinner'
import { Button } from '../Button'
import { Text } from '../Text'
import { colors } from '../colors'
import { useToastVisibility } from './useToastVisibility'

const TOAST_DEFAULT_DURATION_MS = 80000

type ToastType = 'success' | 'warning' | 'loading' | 'error'

const deepToast = keyframes`
  from { bottom: -10px; }
  to { bottom: 80px; }
`

const shallowToast = keyframes`
  from { bottom: -10px; }
  to { bottom: 24px; }
`

const Container = styled.div<{
  $type?: ToastType
}>`
  --color: ${({ $type, theme }) => `
    ${$type === 'success' ? theme.colors.positiveDark : ''}
    ${$type === 'loading' ? theme.colors.primaryDark : ''}
    ${$type === 'error' ? theme.colors.negativeDark : ''}
    ${$type === 'warning' ? theme.colors.orangeDark : ''}
    ${$type === undefined ? theme.colors.positiveDark : ''}
  `};
  background: var(--color);
  border-radius: 8px;
  min-height: 48px;
  position: fixed;
  display: flex;
  gap: 8px;
  /* padding: 0px 12px 0px 20px; */
  ${({ theme }) => theme.shadows.heavy};
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

const Close = styled(Button)`
  color: ${({ theme }) => theme.colors.white};
  margin-top: 8px;
  margin-right: 8px;
  svg {
    height: 24px;
    width: 24px;
  }
  &:hover {
    background: none;
  }
`

/**
 *  Change to Link component
 */

const ActionButton = styled(Button)`
  color: ${({ theme }) => theme.colors.white};
  margin-top: 8px;
  margin-right: 8px;
  &:hover {
    color: ${({ theme }) => theme.colors.white};
    background: none;
  }
`

const NotificationMessage = styled.div`
  ${({ theme }) => theme.fonts.bold16};
  color: ${({ theme }) => theme.colors.white};
  position: relative;
  width: 100%;
  padding: 14px 24px 12px 16px;
  flex: 1;
`

export interface IToastProps extends React.HTMLAttributes<HTMLDivElement> {
  type: ToastType
  onClose?: (event?: React.MouseEvent<HTMLButtonElement>) => void
  onActionClick?: (event?: React.MouseEvent<HTMLButtonElement>) => void
  actionText?: string
  duration?: number | null
}

export const Toast = ({
  type,
  onClose,
  duration = TOAST_DEFAULT_DURATION_MS,
  onActionClick,
  actionText,
  children,
  ...props
}: IToastProps) => (
  <Container $type={type} {...props}>
    {type === 'loading' && (
      <Spinner
        id="in-progress-floating-notification"
        baseColor={colors.white}
        size={20}
      />
    )}

    <NotificationMessage>{children}</NotificationMessage>

    {useToastVisibility({
      duration: type === 'loading' ? null : duration,
      onClose
    })}

    {onActionClick && (
      <ActionButton
        type="tertiary"
        size="small"
        onClick={onActionClick}
        data-testid={props['data-testid'] && `${props['data-testid']}-action`}
      >
        {actionText}
      </ActionButton>
    )}
    {onClose && type !== 'loading' && (
      <Close
        type="icon"
        size="small"
        id={props.id + 'Cancel'}
        data-testid={props['data-testid'] && `${props['data-testid']}-close`}
        onClick={onClose}
      >
        <Cross color="currentColor" />
      </Close>
    )}
  </Container>
)

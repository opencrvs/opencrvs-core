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
import React from 'react'
import styled, { keyframes } from 'styled-components'
import { Spinner } from '../Spinner'
import { Button } from '../Button'
import { Text } from '../Text'
import { Link } from '../Link'
import { colors } from '../colors'
import { useToastVisibility } from './useToastVisibility'
import { Icon } from '../Icon'

const TOAST_DEFAULT_DURATION_MS = 8000

type ToastType = 'success' | 'warning' | 'loading' | 'error' | 'info'

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
    ${$type === 'loading' || $type === 'info' ? theme.colors.primaryDark : ''}
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

const SpinnerContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 48px;
  width: 48px;
  margin-right: -16px;
`

const ActionLink = styled(Link)`
  height: 24px;
  margin-top: 12px;
  margin-right: 4px;
`

const Close = styled(Button)`
  color: ${({ theme }) => theme.colors.white};
  margin-top: 4px;
  margin-right: 4px;
  &:hover {
    background: var(--color) !important;
  }
`

const NotificationMessage = styled(Text).attrs({
  color: 'white',
  variant: 'bold16',
  element: 'span'
})`
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

export function Toast({
  type,
  onClose,
  duration = TOAST_DEFAULT_DURATION_MS,
  onActionClick,
  actionText,
  children,
  ...props
}: IToastProps) {
  useToastVisibility({
    duration: type === 'loading' ? null : duration,
    onClose
  })
  return (
    <Container $type={type} {...props}>
      {type === 'loading' && (
        <SpinnerContainer>
          <Spinner
            id="in-progress-floating-notification"
            baseColor={colors.white}
            size={20}
          />
        </SpinnerContainer>
      )}

      <NotificationMessage>{children}</NotificationMessage>

      {onActionClick && (
        <ActionLink
          color="white"
          font="bold14"
          element="button"
          data-testid={props['data-testid'] && `${props['data-testid']}-action`}
        >
          {actionText}
        </ActionLink>
      )}
      {onClose && type !== 'loading' && (
        <Close
          type="icon"
          size="medium"
          id={props.id + 'Cancel'}
          data-testid={props['data-testid'] && `${props['data-testid']}-close`}
          onClick={onClose}
        >
          <Icon color="currentColor" name="X" size="large" />
        </Close>
      )}
    </Container>
  )
}

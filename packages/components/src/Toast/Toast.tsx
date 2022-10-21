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
<<<<<<< HEAD
import { Link } from '../Link'
=======
>>>>>>> 9a57ca8143714dfce87b463d82f6c16f8c84fae9
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
<<<<<<< HEAD
=======
  /* padding: 0px 12px 0px 20px; */
>>>>>>> 9a57ca8143714dfce87b463d82f6c16f8c84fae9
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

<<<<<<< HEAD
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
=======
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
>>>>>>> 9a57ca8143714dfce87b463d82f6c16f8c84fae9
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
<<<<<<< HEAD
      <SpinnerContainer>
        <Spinner
          id="in-progress-floating-notification"
          baseColor={colors.white}
          size={20}
        />
      </SpinnerContainer>
=======
      <Spinner
        id="in-progress-floating-notification"
        baseColor={colors.white}
        size={20}
      />
>>>>>>> 9a57ca8143714dfce87b463d82f6c16f8c84fae9
    )}

    <NotificationMessage>{children}</NotificationMessage>

    {useToastVisibility({
      duration: type === 'loading' ? null : duration,
      onClose
    })}

    {onActionClick && (
<<<<<<< HEAD
      <ActionLink
        color="white"
        font="bold14"
        element="button"
        data-testid={props['data-testid'] && `${props['data-testid']}-action`}
      >
        {actionText}
      </ActionLink>
=======
      <ActionButton
        type="tertiary"
        size="small"
        onClick={onActionClick}
        data-testid={props['data-testid'] && `${props['data-testid']}-action`}
      >
        {actionText}
      </ActionButton>
>>>>>>> 9a57ca8143714dfce87b463d82f6c16f8c84fae9
    )}
    {onClose && type !== 'loading' && (
      <Close
        type="icon"
<<<<<<< HEAD
        size="medium"
=======
        size="small"
>>>>>>> 9a57ca8143714dfce87b463d82f6c16f8c84fae9
        id={props.id + 'Cancel'}
        data-testid={props['data-testid'] && `${props['data-testid']}-close`}
        onClick={onClose}
      >
        <Cross color="currentColor" />
      </Close>
    )}
  </Container>
)
